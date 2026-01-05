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
    let type = 'post' // Default

    if (openai) {
        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a super friendly K-Pop best friend giving daily updates to Brazilian fans! 💖🇧🇷
Use a casual, exciting, and supportive tone (like a close friend). Use emojis!

**CRITICAL TASK**: You MUST identify the main K-Pop group or actor if the article is about a specific celebrity.

**TASK REQUIREMENTS**:
1. Translate the English title to Portuguese (exciting tone!)
2. Read the article and write a summary in Portuguese (2-3 paragraphs). Talk like a fan friend!
3. DO NOT translate word-for-word - SUMMARIZE key facts.
4. **ARTIST IDENTIFICATION** (EXTREMELY IMPORTANT):
   - We need to categorize this news. **Who is the MAIN subject?**
   - Look at the Title first.
   - If it's about "BTS Jimin", related_artist = "BTS" (Group) or "Jimin" (Idol). Prefer Group name if active in group activities.
   - If multiple groups, pick the **FIRST** one mentioned in the title.
   - **NEVER return null unless it is IMPOSSIBLE to find a name** (e.g. "Top 10 Songs of 2024").
   - Even if it's a rumor or small news, EXTRACT THE NAME.
   - Clean the name: "NewJeans's Minji" -> "NewJeans" (Group context) or "Minji" (Idol context). Prefer GROUP name usually unless solo work.
   - **EXCLUDE AGENCIES**: Do NOT set related_artist to a company name (e.g. HYBE, SM, JYP, YG, Cube, YH Entertainment). If the news is about a company statement regarding an artist, find the **Artist's Name**. ('YH Entertainment updates on Yoo Seungeon' -> 'Yoo Seungeon').
   - If multiple artists (e.g. Yoo Seungeon and Ji Yunseo), pick the **First Person** or the **Group Name** (EVNNE).
6. **TYPE CLASSIFICATION ('idol' vs 'actor')**:
   - If they are a singer/idol group member -> "idol" (Keywords: Album, Comeback, Song, M/V, Concert).
   - If they are primarily an actor -> "actor" (Keywords: Drama, Movie, Series, Role, Cast).
   - If they are BOTH (e.g. Cha Eun-woo, Yoona, D.O.):
     - If news is about acting -> "actor"
     - If news is about music -> "idol"
     - If unsure, default to "idol" (as K-Pop fans usually call them idols first).

**OUTPUT FORMAT** (strict JSON):
{
  "title": "Portuguese friendly title",
  "content": "Portuguese friendly summary",
  "related_artist": "Artist/Group Name" OR null,
  "artist_type": "idol" OR "actor" OR null,
  "type": "news"
}`
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
            type = result.type || 'news'
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
        artist_type,
        type
    }
}
