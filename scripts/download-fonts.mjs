/* eslint-disable no-undef */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(process.cwd(), 'public/fonts')
const cssUrl = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap'
const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'
const fonts = [
  ['cormorant-italic-400.woff2', 'Cormorant Garamond', 'italic', '400'],
  ['cormorant-regular-300.woff2', 'Cormorant Garamond', 'normal', '300'],
  ['cormorant-regular-400.woff2', 'Cormorant Garamond', 'normal', '400'],
  ['dm-sans-400.woff2', 'DM Sans', 'normal', '400'],
  ['dm-sans-500.woff2', 'DM Sans', 'normal', '500'],
  ['dm-sans-600.woff2', 'DM Sans', 'normal', '600'],
  ['plex-mono-400.woff2', 'IBM Plex Mono', 'normal', '400'],
  ['plex-mono-500.woff2', 'IBM Plex Mono', 'normal', '500'],
]

await mkdir(root, { recursive: true })
const cssResponse = await fetch(cssUrl, { headers: { 'User-Agent': userAgent } })
if (!cssResponse.ok) throw new Error(`Unable to download font CSS: ${cssResponse.status}`)
const css = await cssResponse.text()
const blocks = [...css.matchAll(/@font-face\s*{([\s\S]*?)}/g)].map((match) => match[1])

for (const [name, family, style, weight] of fonts) {
  const block = blocks.find((candidate) => candidate.includes(`font-family: '${family}'`) && candidate.includes(`font-style: ${style}`) && candidate.includes(`font-weight: ${weight}`) && candidate.includes('unicode-range: U+0000-00FF'))
  const url = block?.match(/src: url\(([^)]+\.woff2)\)/)?.[1]
  if (!url) throw new Error(`Unable to resolve latin ${family} ${style} ${weight}`)
  const fontResponse = await fetch(url)
  if (!fontResponse.ok) throw new Error(`Unable to download ${name}: ${fontResponse.status}`)
  await writeFile(path.join(root, name), Buffer.from(await fontResponse.arrayBuffer()))
  console.log(`downloaded ${name}`)
}
