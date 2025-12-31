import * as cheerio from 'cheerio'
import OpenAI from 'openai'
// import { createClient } from './supabase/server' // Unused

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

export async function findLatestArticleUrl(_listingUrl: string): Promise<string | null> {
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
    let related_artist: string | null = null
    let artist_type: 'idol' | 'actor' | null = null

    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a professional K-Pop news editor for Brazilian fans.

**CRITICAL TASK**: You MUST identify the main K-Pop group or actor if the article is about a specific celebrity.

**TASK REQUIREMENTS**:
1. Translate the English title to Portuguese (exciting tone)
2. Read the article and write a summary in Portuguese (2-3 paragraphs)
3. DO NOT translate word-for-word - SUMMARIZE key facts to avoid copyright issues
4. **ARTIST IDENTIFICATION** (VERY IMPORTANT):
   - If the article mentions a SPECIFIC K-Pop group, idol, or actor prominently → Extract their name
   - Look in the TITLE first - it usually contains the main subject
   - Common groups: BTS, BLACKPINK, TWICE, Stray Kids, NewJeans, IVE, aespa, SEVENTEEN, etc.
   - Common actors: Park Seo-joon, Lee Min-ho, Song Hye-kyo, etc.
   - If the article is about ONE specific celebrity/group → return their name
   - If it's about general K-Pop trends or multiple groups equally → return null
   - **ALWAYS prefer extracting a name over returning null**

**EXAMPLES**:
- Title: "BTS Jimin Tops Billboard Chart" → "BTS", "idol"
- Title: "BLACKPINK's Jennie Stars in New Drama" → "BLACKPINK", "idol"
- Title: "NewJeans Announces Comeback Date" → "NewJeans", "idol"
- Title: "Park Seo-joon Confirmed for Hollywood Film" → "Park Seo-joon", "actor"
- Title: "Top 10 K-Pop Songs This Week" → null, null (general list)

**OUTPUT FORMAT** (strict JSON):
{
  "title": "Portuguese translated title",
  "content": "Portuguese summary",
  "related_artist": "Artist/Group Name" OR null,
  "artist_type": "idol" OR "actor" OR null
}

**Remember**: Be AGGRESSIVE in extracting artist names. If you see a K-Pop name, extract it!`
                    },
                    { role: "user", content: `TITLE: ${raw.title}\n\nCONTENT: ${raw.content.substring(0, 2500)}` }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" }
            })

            const result = JSON.parse(completion.choices[0].message.content || '{}')
            summaryPt = result.content || "Resumo indisponível."
            translatedTitle = result.title || raw.title
            related_artist = result.related_artist || null
            artist_type = result.artist_type || null
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
        related_artist,
        artist_type
    }
}
