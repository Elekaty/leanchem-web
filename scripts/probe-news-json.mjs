import { readFileSync } from 'node:fs'

for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const key = process.env.GEMINI_API_KEY
const model = 'gemini-flash-latest'
const prompt = `Return JSON only: {"articles":[{"slug":"test-brief","title":"Test corridor brief","date":"2026-08-15","excerpt":"Procurement note.","body":["Para one.","Para two."],"corridor":"Djibouti → Modjo","status":"Watch","timestamp":"15 Aug 2026 · 12:00 EAT"}]}`

const url =
  'https://generativelanguage.googleapis.com/v1beta/models/' +
  model +
  ':generateContent?key=' +
  encodeURIComponent(key)

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  }),
})

const raw = await res.text()
console.log('status', res.status)
if (!res.ok) {
  console.log(raw.slice(0, 400))
  process.exit(1)
}
const data = JSON.parse(raw)
const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
console.log('text_preview', text.slice(0, 300))
const parsed = JSON.parse(text.includes('```') ? text.replace(/```json|```/g, '') : text)
console.log('articles', parsed.articles?.length, parsed.articles?.[0]?.title)
