import * as cheerio from 'cheerio'
import OpenAI from 'openai'
import { createClient } from './supabase/server'

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null

export interface NewsItem {
    originalTitle: string
    originalUrl: string
    summaryPt: string
    imageUrl?: string
}

export async function scrapeNaverEnt(url: string): Promise<{ title: string; content: string; image?: string } | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        if (!response.ok) return null

        const html = await response.text()
        const $ = cheerio.load(html)

        // 1. Clean up script/style tags
        $('script').remove()
        $('style').remove()

        // 2. Extract Title (Try multiple common selectors)
        const title =
            $('h2.end_tit').first().text().trim() ||
            $('.media_end_head_headline').text().trim() ||
            $('h2.heading').text().trim() ||
            $('title').text().trim()

        // 3. Extract Content
        const content =
            $('#articeBody').text().trim() ||
            $('#dic_area').text().trim() ||
            $('.go_trans').text().trim() ||
            $('.news_end').text().trim()

        // 4. Extract Image (High res preferred)
        let image =
            $('img#img1').attr('data-src') ||
            $('img#img1').attr('src') ||
            $('.media_end_head_photo_img').attr('src') ||
            $('meta[property="og:image"]').attr('content')

        if (!title || !content) {
            console.log('Skipping: Missing title or content', url)
            return null
        }

        return { title, content, image }
    } catch (error) {
        console.error('Scraping failed:', error)
        return null
    }
}

export async function findLatestArticleUrl(listingUrl: string): Promise<string | null> {
    try {
        const response = await fetch(listingUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })
        if (!response.ok) return null

        const html = await response.text()
        const $ = cheerio.load(html)

        let foundUrl: string | null = null

        // Naver Ranking Listing (Mobile) often uses these classes
        // Look for the first link that is a valid article
        $('a').each((_, el) => {
            if (foundUrl) return
            const href = $(el).attr('href')
            // Filter for article links (usually contains /article/ or /read/)
            if (href && (href.includes('/article/') || href.includes('/read/'))) {
                // Ignore "ranking" self-links
                if (href.includes('ranking')) return

                if (href.startsWith('http')) {
                    foundUrl = href
                } else {
                    foundUrl = `https://m.entertain.naver.com${href}`
                }
            }
        })

        return foundUrl

    } catch (e) {
        console.error('Failed to find article:', e)
        return null
    }
}

export async function processNewsArticle(url: string) {
    // 1. Scrape
    const raw = await scrapeNaverEnt(url)
    if (!raw) return null

    // 2. Summarize & Translate via AI
    let summaryPt = ''
    let translatedTitle = ''

    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a professional K-Pop news editor for Brazilian fans.
Task:
1. Translate the title to Portuguese.
2. Read the Korean article and write a **summary in Portuguese** (about 2-3 paragraphs).
3. Do NOT simply translate word-for-word. Summarize the key facts to avoid copyright issues.
4. Tone: Exciting, engaging, suitable for a community.
5. Return strictly JSON format: { "title": "...", "content": "..." }`
                    },
                    { role: "user", content: `TITLE: ${raw.title}\n\nCONTENT: ${raw.content.substring(0, 2000)}` }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" }
            })

            const result = JSON.parse(completion.choices[0].message.content || '{}')
            summaryPt = result.content || "Resumo indisponível."
            translatedTitle = result.title || raw.title
        } catch (e) {
            console.error('OpenAI Error:', e)
            summaryPt = "Erro ao gerar resumo."
            translatedTitle = raw.title
        }
    } else {
        summaryPt = "⚠️ OpenAI API Key missing. Please configure it in Vercel.\n\nRaw Content (KR): " + raw.content.substring(0, 100) + "..."
        translatedTitle = raw.title
    }

    return {
        title: translatedTitle,
        content: `${summaryPt}\n\nSource: [Naver News](${url})`,
        image_url: raw.image
    }
}
