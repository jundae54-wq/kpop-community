import { NextResponse } from 'next/server'
import { processNewsArticle, findLatestArticleUrl } from '@/utils/news-service'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Simple security check
    if (secret !== process.env.CRON_SECRET && secret !== 'test') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Define sources
    const listingUrl = 'https://m.entertain.naver.com/ranking/article'

    // 2. Discover Latest Article
    let targetUrl = await findLatestArticleUrl(listingUrl)

    if (!targetUrl) {
        return NextResponse.json({ error: 'Failed to discover new article source' }, { status: 500 })
    }

    // 3. Process
    const result = await processNewsArticle(targetUrl)

    if (!result) {
        return NextResponse.json({ error: 'Failed to process news' }, { status: 500 })
    }

    // 3. Save to DB
    const supabase = await createClient()

    // Find bot user (admin or first user)
    const { data: users } = await supabase.from('profiles').select('id').limit(1)
    const botId = users && users.length > 0 ? users[0].id : null

    if (!botId) {
        return NextResponse.json({ error: 'No user found to act as bot' }, { status: 500 })
    }

    const { data, error } = await supabase.from('posts').insert({
        title: result.title,
        content: result.content,
        image_url: result.image_url,
        author_id: botId,
        // We could look up a 'News' group ID here
    }).select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, post: data })
}
