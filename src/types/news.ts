export interface NewsBrief {
  slug: string
  title: string
  date: string
  excerpt: string
  body: string[]
  corridor?: string
  status?: 'In Transit' | 'Customs Cleared' | 'Watch' | 'Clear' | string
  timestamp?: string
  source: 'gemini' | 'static'
}

export interface NewsFeedPayload {
  briefs: NewsBrief[]
  logistics: Array<{
    id: string
    corridor: string
    status: string
    timestamp: string
    summary: string
    articleSlug: string
  }>
  analyzedAt: string | null
  geminiEnabled: boolean
  error?: string
}
