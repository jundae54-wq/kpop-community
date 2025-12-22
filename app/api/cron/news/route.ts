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
            .select('id')
            .eq('title', result.title)
            .limit(1)

        if (existing && existing.length > 0) {
            return NextResponse.json({ message: 'Article already exists, skipping.', title: result.title })
        }

        // Find a user to act as the Author
        // Ideally: 'jundae54@gmail.com' (The Admin) or any random user if admin not found
        const ADMIN_EMAIL = 'jundae54@gmail.com'

        // Try to find admin profile first
        let { data: author, error: profileError } = await supabase.from('profiles').select('id').eq('email', ADMIN_EMAIL).single()

        if (profileError) {
            console.log("Admin profile fetch failed or empty", profileError)
        }

        // If not found (admin hasn't logged in yet?), pick ANY user
        if (!author) {
            const { data: anyUser } = await supabase.from('profiles').select('id').limit(1).single()
            author = anyUser
        }

        if (!author) {
            console.error('ERROR: No user found to act as bot')
            return NextResponse.json({ error: 'No user found to act as bot' }, { status: 500 })
        }

        const { data, error } = await supabase.from('posts').insert({
            title: result.title,
            content: result.content,
            image_url: result.image_url,
            author_id: author.id,
            // We could look up a 'News' group ID here if we had one
        }).select()

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
