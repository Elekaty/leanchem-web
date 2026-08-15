import { readFileSync } from 'node:fs'
for (const line of readFileSync('.env','utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}
const { getNewsFeed } = await import('../src/server/newsAnalysis.ts')
const feed = await getNewsFeed({ force: true })
console.log(JSON.stringify({ geminiEnabled: feed.geminiEnabled, analyzedAt: feed.analyzedAt, error: feed.error, count: feed.briefs.length, first: feed.briefs[0]?.title, source: feed.briefs[0]?.source }, null, 2))
