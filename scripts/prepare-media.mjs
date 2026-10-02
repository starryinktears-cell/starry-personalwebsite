/* eslint-disable no-undef */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(process.cwd(), 'public/images')
const sources = {
  hero: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2200&q=82',
  about: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1800&q=82',
  serviceA: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=82',
  serviceB: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=82',
  contact: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=82',
  notfound: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=82',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=82',
  coastline: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=82',
  portrait: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=82',
  interior: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1800&q=82',
  camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=82',
  olive: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=82',
  shore: 'https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?auto=format&fit=crop&w=1800&q=82',
  forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1800&q=82',
  dusk: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1800&q=82',
  mountainLake: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1800&q=82',
  field: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=82',
  meadow: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1800&q=82',
  desert: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=82',
  window: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=82',
  road: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1800&q=82',
  hands: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1800&q=82',
  studio: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=82',
  wave: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=82',
}

await mkdir(root, { recursive: true })
const manifest = {}

for (const [name, url] of Object.entries(sources)) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to download ${name}: ${response.status}`)
  const source = Buffer.from(await response.arrayBuffer())
  const image = sharp(source).rotate().resize({ width: 1800, withoutEnlargement: true }).modulate({ saturation: 0.9 }).linear(1.05, -0.025)
  const metadata = await image.metadata()
  await image.clone().webp({ quality: 82 }).toFile(path.join(root, `${name}.webp`))
  await image.clone().avif({ quality: 62, effort: 4 }).toFile(path.join(root, `${name}.avif`))
  await image.clone().resize({ width: 900, withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(root, `${name}-900.webp`))
  await image.clone().resize({ width: 900, withoutEnlargement: true }).avif({ quality: 52, effort: 4 }).toFile(path.join(root, `${name}-900.avif`))
  await image.clone().resize({ width: 32 }).blur(8).jpeg({ quality: 35 }).toFile(path.join(root, `${name}-lqip.jpg`))
  manifest[name] = { src: `/images/${name}.webp`, srcSet: `/images/${name}-900.webp 900w, /images/${name}.webp 1800w`, lqip: `/images/${name}-lqip.jpg`, width: metadata.width ?? 1800, height: metadata.height ?? 1200 }
  console.log(`prepared ${name}`)
}

await writeFile(path.join(root, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
