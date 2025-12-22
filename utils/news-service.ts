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

// Scrape Soompi Article
export async function scrapeArticle(url: string): Promise<{ title: string; content: string; image?: string } | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        if (!response.ok) {
            console.log('Fetch failed:', response.status)
            return null
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Soompi Selectors
        const title = $('h1').first().text().trim() || $('title').text().trim()

        // Remove ads and unnecessary elements
        $('script').remove()
        $('style').remove()
        $('.ad-container').remove()

        // Content: P tags inside article body
        // Soompi usually puts content in a wrapper, let's grab all paragraphs
        let content = ''
        $('article p').each((_, el) => {
            content += $(el).text().trim() + '\n\n'
        })

        // Fallback content selector
        if (!content) {
            content = $('p').text().substring(0, 3000)
        }

        // Disable image scraping to avoid copyright issues
        const image = undefined // $('meta[property="og:image"]').attr('content') || $('img').first().attr('src')

        if (!title || content.length < 50) {
            console.log('Skipping: Missing title or meaningful content', url)
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
        // Use Soompi RSS Feed (Most reliable)
        const targetListingUrl = 'https://www.soompi.com/feed'

        const response = await fetch(targetListingUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })
        if (!response.ok) {
            console.log('RSS Fetch failed:', response.status)
            return null
        }

        const xml = await response.text()
        const $ = cheerio.load(xml, { xmlMode: true })

        // Find first item link
        const firstLink = $('item > link').first().text()

        if (firstLink) {
            return firstLink.trim()
        }

        return null

    } catch (e) {
        console.error('Failed to find article from RSS:', e)
        return null
    }
}

export async function processNewsArticle(url: string) {
    // 1. Scrape
    const raw = await scrapeArticle(url)
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
1. Translate the English title to Portuguese.
2. Read the English article and write a **summary in Portuguese** (about 2-3 paragraphs).
3. Do NOT simply translate word-for-word. Summarize the key facts to avoid copyright issues.
4. **Identify the Main Entity**: Find the single most relevant K-Pop Group or Actor discussed.
   - If it's a general topic or about many groups, return null.
   - If it's a specific idol/group or actor, return their name and type ('idol' or 'actor').
5. Tone: Exciting, engaging, suitable for a community.
6. Return strictly JSON format: { "title": "...", "content": "...", "related_artist": "Name" | null, "artist_type": "idol" | "actor" | null }`
                    },
                    { role: "user", content: `TITLE: ${raw.title}\n\nCONTENT: ${raw.content.substring(0, 2500)}` }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" }
            })

            const result = JSON.parse(completion.choices[0].message.content || '{}')
            summaryPt = result.content || "Resumo indisponível."
            translatedTitle = result.title || raw.title

            return {
                title: translatedTitle,
                content: `${summaryPt}\n\nSource: [Soompi](${url})`,
                image_url: raw.image,
                related_artist: result.related_artist || null,
                artist_type: result.artist_type || null
            }
        } catch (e) {
            console.error('OpenAI Error:', e)
            summaryPt = "Erro ao gerar resumo."
            translatedTitle = raw.title
        }
    } else {
        summaryPt = "⚠️ OpenAI API Key missing. Please configure it in Vercel.\n\nRaw Content (EN): " + raw.content.substring(0, 100) + "..."
        translatedTitle = raw.title
    }

    return {
        title: translatedTitle,
        content: `${summaryPt}\n\nSource: [Soompi](${url})`,
        image_url: raw.image,
        related_artist: null,
        artist_type: null
    }
}
