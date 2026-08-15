import type { NewsBrief, NewsFeedPayload } from '../types/news'
import { LOGISTICS_UPDATES, NEWS_ARTICLES } from '../data/marketing'

const CACHE_MS = 6 * 60 * 60 * 1000

type Cache = {
  payload: NewsFeedPayload
  fetchedAt: number
}

let cache: Cache | null = null

function staticPayload(): NewsFeedPayload {
  return {
    briefs: NEWS_ARTICLES.map((a) => ({
      ...a,
      body: [...a.body],
      source: 'static' as const,
    })),
    logistics: LOGISTICS_UPDATES.map((row) => ({ ...row })),
    analyzedAt: null,
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced?.[1]?.trim() ?? trimmed
  return JSON.parse(raw)
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const models = [
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-2.5-flash-lite',
    'gemini-pro-latest',
  ]
  let lastError = 'Unknown Gemini error'

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!res.ok) {
      lastError = `Gemini ${model} HTTP ${res.status}: ${await res.text()}`
      continue
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
    if (text.trim()) return text
    lastError = `Gemini ${model} returned empty content`
  }

  throw new Error(lastError)
}

function normalizeBriefs(raw: unknown): NewsBrief[] {
  if (!raw || typeof raw !== 'object') return []
  const articles = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { articles?: unknown }).articles)
      ? (raw as { articles: unknown[] }).articles
      : Array.isArray((raw as { briefs?: unknown }).briefs)
        ? (raw as { briefs: unknown[] }).briefs
        : []

  return articles
    .map((item, index): NewsBrief | null => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const title = String(row.title ?? '').trim()
      if (!title) return null
      const slugBase = String(row.slug ?? title)
      const bodyRaw = row.body
      const body = Array.isArray(bodyRaw)
        ? bodyRaw.map((p) => String(p)).filter(Boolean)
        : String(row.excerpt ?? row.summary ?? '')
            .split(/\n+/)
            .map((p) => p.trim())
            .filter(Boolean)

      const brief: NewsBrief = {
        slug: slugify(slugBase) || `brief-${index + 1}`,
        title,
        date: String(row.date ?? todayIso()),
        excerpt: String(row.excerpt ?? body[0] ?? title),
        body: body.length ? body : [String(row.excerpt ?? title)],
        source: 'gemini',
      }
      if (row.corridor) brief.corridor = String(row.corridor)
      if (row.status) brief.status = String(row.status)
      if (row.timestamp) brief.timestamp = String(row.timestamp)
      return brief
    })
    .filter((b): b is NewsBrief => b != null)
}

const ANALYSIS_PROMPT = `You are LeanChem's logistics intelligence analyst for Ethiopian B2B chemical procurement buyers.

Produce JSON only (no markdown) with this shape:
{
  "articles": [
    {
      "slug": "kebab-case-slug",
      "title": "string",
      "date": "YYYY-MM-DD",
      "excerpt": "1 sentence for procurement planners",
      "body": ["paragraph 1", "paragraph 2"],
      "corridor": "e.g. Djibouti → Modjo",
      "status": "In Transit | Customs Cleared | Watch | Clear",
      "timestamp": "human readable EAT timestamp"
    }
  ]
}

Requirements:
- Exactly 4 articles
- Focus on Djibouti–Modjo–Addis chemical import corridor, dry-port dwell, customs, tanker capacity, industrial park delivery slots, and SDS/TDS documentation readiness
- Practical, high-trust, non-sensational tone for procurement / technical buyers
- No invented company-specific prices; no unsafe handling instructions beyond high-level reminders
- Use today's date context: ${todayIso()}
`

export async function getNewsFeed(opts?: { force?: boolean }): Promise<NewsFeedPayload> {
  if (!opts?.force && cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache.payload
  }

  const fallback = staticPayload()
  if (!process.env.GEMINI_API_KEY) {
    cache = { payload: fallback, fetchedAt: Date.now() }
    return fallback
  }

  try {
    const text = await callGemini(ANALYSIS_PROMPT)
    const parsed = parseGeminiJson(text)
    const briefs = normalizeBriefs(parsed)
    if (briefs.length === 0) {
      return {
        ...fallback,
        error: 'Gemini returned no usable briefs; showing static updates.',
      }
    }

    const logistics = briefs.map((b, i) => ({
      id: `gem-${b.slug}`,
      corridor: b.corridor ?? LOGISTICS_UPDATES[i % LOGISTICS_UPDATES.length]!.corridor,
      status: b.status ?? 'Watch',
      timestamp:
        b.timestamp ??
        `${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Addis_Ababa' })} EAT`,
      summary: b.excerpt,
      articleSlug: b.slug,
    }))

    const payload: NewsFeedPayload = {
      briefs,
      logistics,
      analyzedAt: new Date().toISOString(),
      geminiEnabled: true,
    }
    cache = { payload, fetchedAt: Date.now() }
    return payload
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gemini analysis failed'
    console.error('[news]', message)
    const payload = { ...fallback, error: message }
    cache = { payload, fetchedAt: Date.now() }
    return payload
  }
}

export function getBriefBySlug(slug: string, feed: NewsFeedPayload): NewsBrief | undefined {
  return feed.briefs.find((b) => b.slug === slug)
}
