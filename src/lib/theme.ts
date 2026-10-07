import type { CSSProperties } from 'react'
import type { SiteSettings } from './types'

export const originalAccent = '#626a4c'
export const originalFooter = '#3a3f2d'
export const morandiPalettes = [
  { name: '雾蓝', accent: '#728793' },
  { name: '灰粉', accent: '#9a7d83' },
  { name: '鼠尾草', accent: '#818c76' },
  { name: '燕麦', accent: '#9b8b74' },
  { name: '烟紫', accent: '#8a7f95' },
  { name: '陶土', accent: '#a18070' },
]
export function rgb(hex: string) { return [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16)) }
function hex(channels: number[]) { return `#${channels.map(value => Math.round(value).toString(16).padStart(2, '0')).join('')}` }
export function deepColor(accent: string) { return hex(rgb(accent).map(value => value * .59)) }
function luminance(color: string) {
  const values = rgb(color).map(value => { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4 })
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722
}
export function readableText(background: string) {
  const value = luminance(background)
  const darkContrast = (value + .05) / (luminance('#1c1d1a') + .05)
  const lightContrast = 1.05 / (value + .05)
  return darkContrast > lightContrast ? '#1c1d1a' : '#ffffff'
}
export function themeVariables(settings: Pick<SiteSettings, 'accent' | 'theme'>): CSSProperties {
  const accent = /^#[\da-f]{6}$/i.test(settings.accent) ? settings.accent : originalAccent
  const deep = deepColor(accent)
  const footer = settings.theme?.footerColor && /^#[\da-f]{6}$/i.test(settings.theme.footerColor) ? settings.theme.footerColor : deep
  return { '--olive': accent, '--olive-rgb': rgb(accent).join(' '), '--olive-deep': deep, '--olive-deep-rgb': rgb(deep).join(' '), '--accent-on': readableText(accent), '--footer-rgb': rgb(footer).join(' '), '--footer-ink-rgb': rgb(readableText(footer)).join(' ') } as CSSProperties
}

/** Pick a dominant color family, then soften it to a muted, medium-value palette. */
export function paletteFromPixels(pixels: ArrayLike<number>) {
  const buckets = new Map<string, { count: number; sum: number[] }>()
  for (let index = 0; index < pixels.length; index += 4) {
    const values = [pixels[index], pixels[index + 1], pixels[index + 2]]
    if (pixels[index + 3] < 128 || Math.max(...values) < 24 || Math.min(...values) > 238) continue
    const key = values.map(value => Math.floor(value / 32)).join(',')
    const bucket = buckets.get(key) ?? { count: 0, sum: [0, 0, 0] }
    bucket.count++; values.forEach((value, channel) => { bucket.sum[channel] += value }); buckets.set(key, bucket)
  }
  const dominant = [...buckets.values()].sort((a, b) => b.count - a.count)[0]
  if (!dominant) throw new Error('头图缺少可提取的颜色，请手动选择配色。')
  const values = dominant.sum.map(value => value / dominant.count)
  const mean = values.reduce((sum, value) => sum + value, 0) / 3
  const muted = values.map(value => Math.max(70, Math.min(160, 118 + (value - mean) * .42)))
  const accent = hex(muted)
  return { accent, footerColor: deepColor(accent) }
}

export async function extractHeroPalette(src: string) {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => { image.onload = null; image.onerror = null; reject(new Error('头图取色超时，已保留原配色。')) }, 10000)
    image.onload = () => { window.clearTimeout(timer); resolve() }
    image.onerror = () => { window.clearTimeout(timer); reject(new Error('无法读取头图颜色，请上传图片或手动选择配色。')) }
    image.src = src
  })
  const canvas = document.createElement('canvas'); canvas.width = 48; canvas.height = 48
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('浏览器不支持头图取色，请手动选择配色。')
  try { context.drawImage(image, 0, 0, 48, 48); return paletteFromPixels(context.getImageData(0, 0, 48, 48).data) }
  catch { throw new Error('此图片不允许跨域取色，已保留原配色；可上传到媒体库或手动选色。') }
}
