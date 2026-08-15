import type { NewsBrief, NewsFeedPayload } from '../types/news'

/** Load news feed (Gemini on server when GEMINI_API_KEY is set; static fallback otherwise). */
export async function loadNewsFeed(opts?: { force?: boolean }): Promise<NewsFeedPayload> {
  const { getNewsFeed } = await import('../server/newsAnalysis')
  return getNewsFeed(opts)
}

export async function loadNewsBrief(slug: string): Promise<{
  brief: NewsBrief | null
  feedMeta: { analyzedAt: string | null; geminiEnabled: boolean; error?: string }
}> {
  const { getBriefBySlug, getNewsFeed } = await import('../server/newsAnalysis')
  const feed = await getNewsFeed()
  return {
    brief: getBriefBySlug(slug, feed) ?? null,
    feedMeta: {
      analyzedAt: feed.analyzedAt,
      geminiEnabled: feed.geminiEnabled,
      error: feed.error,
    },
  }
}
