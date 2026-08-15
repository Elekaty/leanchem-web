const res = await fetch('https://leanchems.com/')
const html = await res.text()
const logo = [...html.matchAll(/src=["']([^"']*logo[^"']*)["']/gi)].map((m) => m[1])
const imgs = [...html.matchAll(/src=["']([^"']+\.(?:png|svg|webp|jpe?g)[^"']*)["']/gi)].map(
  (m) => m[1],
)
const uploads = [...html.matchAll(/https?:\/\/[^"'\\\s]+wp-content\/uploads\/[^"'\\\s]+/g)].map(
  (m) => m[0],
)
console.log('LOGO', logo)
console.log('IMGS', [...new Set(imgs)].slice(0, 40))
console.log('UPLOADS', [...new Set(uploads)].slice(0, 40))
