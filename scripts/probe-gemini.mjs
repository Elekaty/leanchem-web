const key = process.env.GEMINI_API_KEY
if (!key) {
  console.log('NO_KEY')
  process.exit(1)
}

const models = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-2.5-flash-lite',
  'gemini-pro-latest',
]

for (const model of models) {
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    model +
    ':generateContent?key=' +
    encodeURIComponent(key)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Return JSON {"ok":true}' }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 32 },
    }),
  })
  const t = await res.text()
  console.log(model, res.status, t.slice(0, 200).replace(/\n/g, ' '))
  if (res.ok) break
}
