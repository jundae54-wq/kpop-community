import { NextResponse } from 'next/server'
import { processNewsArticle, findLatestArticleUrl } from '@/utils/news-service'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Simple security check (Authorization)
    if (secret !== process.env.CRON_SECRET && secret !== 'test') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Define sources
        const listingUrl = 'https://www.soompi.com/feed'

        // 2. Discover Latest Article
        console.log('Finding latest article from:', listingUrl)
        let targetUrl = await findLatestArticleUrl(listingUrl)
        console.log('Target URL found:', targetUrl)

        if (!targetUrl) {
            console.error('ERROR: No target URL found')
            return NextResponse.json({ error: 'Failed to discover new article source' }, { status: 500 })
        }

        // 3. Process (Scrape + AI)
        console.log('Processing article...')
        const result = await processNewsArticle(targetUrl)

        if (!result) {
            console.error('ERROR: Result process failed')
            return NextResponse.json({ error: 'Failed to process news' }, { status: 500 })
        }

        // 4. Save to DB
        // 4. Save to DB (Use Admin Client to bypass RLS)
        const supabase = createAdminClient()

        // Ensure NO DUPLICATES (Check if recent post has same title)
        const { data: existing } = await supabase.from('posts')
            .select('id, group_id')
            .eq('title', result.title)
            .limit(1)

        let postIdToUpdate: number | null = null

        if (existing && existing.length > 0) {
            const post = existing[0]
            if (post.group_id) {
                return NextResponse.json({ message: 'Article already exists with category, skipping.', title: result.title })
            } else {
                console.log('Article exists but missing category. Attempting to backfill...')
                postIdToUpdate = post.id
            }
        }

        // Find a user to act as the Author (Admin)
        const ADMIN_EMAIL = 'jundae54@gmail.com'
        let author_id: string | null = null

        // 1. Try to find user ID from Auth (Admin API)
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

        if (users && users.length > 0) {
            const adminUser = users.find((u: any) => u.email === ADMIN_EMAIL)
            if (adminUser) author_id = adminUser.id
        }

        // 2. If not found, pick FIRST profile as fallback
        if (!author_id) {
            const { data: anyProfile } = await supabase.from('profiles').select('id').limit(1).single()
            if (anyProfile) author_id = anyProfile.id
        }

        if (!author_id) {
            console.error('ERROR: No user found to act as bot')
            return NextResponse.json({ error: 'No user found to act as bot' }, { status: 500 })
        }

        // Logic: Find or Create Group
        let group_id: number | null = null
        if (result.related_artist) {
            console.log('AI identified artist:', result.related_artist, 'Type:', result.artist_type)

            // 1. Check existing
            const { data: existingGroup } = await supabase
                .from('groups')
                .select('id')
                .ilike('name', result.related_artist) // case insensitive match
                .maybeSingle()

            if (existingGroup) {
                console.log('Found existing group:', existingGroup.id)
                group_id = existingGroup.id
            } else {
                // 2. Create new
                console.log('No existing group found, creating new...')
                // Only create if we have a valid type ('idol' or 'actor'), default to 'idol' if unsure but confident name
                const type = (result.artist_type === 'idol' || result.artist_type === 'actor') ? result.artist_type : 'idol'

                const { data: newGroup, error: groupError } = await supabase
                    .from('groups')
                    .insert({
                        name: result.related_artist,
                        slug: result.related_artist.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
                        type: type,
                        image_url: null // Can be filled later or by another valid image source
                    })
                    .select()
                    .single()

                if (newGroup) {
                    console.log(`✅ Auto-created new category: ${newGroup.name} (ID: ${newGroup.id})`)
                    group_id = newGroup.id
                } else if (groupError) {
                    console.error('❌ Failed to create group:', groupError)
                }
            }
        } else {
            console.log('No specific artist identified by AI for this article')
        }

        let data, error

        if (postIdToUpdate) {
            // Update existing post
            const dbResult = await supabase.from('posts')
                .update({ group_id: group_id })
                .eq('id', postIdToUpdate)
                .select()
            data = dbResult.data
            error = dbResult.error
            console.log(`✅ Backfilled category for Post ID: ${postIdToUpdate}`)
        } else {
            // Insert new post
            const dbResult = await supabase.from('posts').insert({
                title: result.title,
                content: result.content,
                image_url: result.image_url,
                author_id: author_id,
                group_id: group_id
            }).select()
            data = dbResult.data
            error = dbResult.error
        }

        if (error) {
            console.error('Supabase Insert Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, post: data })

    } catch (e: any) {
        console.error('CRITICAL CRON ERROR:', e)
        return NextResponse.json({ error: e.message || 'Unknown Server Error' }, { status: 500 })
    }
}
