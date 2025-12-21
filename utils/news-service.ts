import * as cheerio from 'cheerio'
import OpenAI from 'openai'
import { createClient } from './supabase/server'

// Initialize OpenAI (safe check for key)
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

        // Selectors optimized for common KR news sites (Generic fallback)
        const title = $('h2.end_tit').first().text().trim() || $('title').text().trim()
        const content = $('#articeBody').text().trim() || $('article').text().trim() || $('body').text().trim()
        const image = $('img#img1').attr('src') || $('meta[property="og:image"]').attr('content')

        if (!title || !content) return null

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

        // Naver Mobile Ranking specific selector (heuristic)
        // Adjust based on actual page structure. Common pattern for Naver mobile lists:
        // li.common_list_item > a
        // or .ranking_list > li > a

        // Let's try a few common ones or just find the first link that looks like an article
        // /article/oid/aid pattern is common in Naver

        let foundUrl: string | null = null

        $('a').each((_, el) => {
            if (foundUrl) return
            const href = $(el).attr('href')
            if (href && href.includes('/article/')) {
                // Ensure absolute URL
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
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a K-Pop news editor for Brazilian fans. You will be given a Korean entertainment article. Your task is to: 1. Translate the title to Portuguese. 2. Summarize the key facts of the article into a short, engaging paragraph in Portuguese (avoiding copyright issues by not translating verbatim). Return JSON: { title: string, summary: string }."
                },
                { role: "user", content: `TITLE: ${raw.title}\n\nCONTENT: ${raw.content.substring(0, 1500)}` }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        })

        const result = JSON.parse(completion.choices[0].message.content || '{}')
        summaryPt = result.summary || "Resumo indisponível."
        translatedTitle = result.title || raw.title
    } else {
        // Fallback if no API Key
        summaryPt = "[MOCK] AI Summarization requires OpenAI Key. Content: " + raw.content.substring(0, 100) + "..."
        translatedTitle = "K-News Check"
    }

    // 3. Save to DB (as 'News Bot' or similar)
    const supabase = await createClient()

    // Create a specialized bot user profile if not exists (conceptual - usually we just pick a system ID)
    // For now, we will link to the current user or a specific Bot ID. 
    // We'll create a post directly.

    return {
        title: translatedTitle,
        content: `${summaryPt}\n\nRunning Source: [Link](${url})`,
        image_url: raw.image
    }
}
