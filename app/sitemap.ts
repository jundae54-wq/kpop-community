import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()

    // Real Apps: Fetch all posts ID to generate dynamic sitemap
    // Limit to most recent 5000 for standard sitemap
    const { data: posts } = await supabase
        .from('posts')
        .select('id, updated_at')
        .limit(1000)

    const postEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
        url: `https://k-community-br.com/p/${post.id}`,
        lastModified: new Date(post.updated_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.7,
    }))

    return [
        {
            url: 'https://k-community-br.com',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://k-community-br.com/login',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: 'https://k-community-br.com/write',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...postEntries,
    ]
}
