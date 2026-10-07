import { describe, expect, it } from 'vitest'
import { deepColor, originalAccent, originalFooter, paletteFromPixels, themeVariables } from '../src/lib/theme'
import { formatSiteTime } from '../src/lib/siteClock'

describe('site color and clock configuration', () => {
  it('preserves the original green and lets footer colors override the derived deep color', () => {
    expect(deepColor(originalAccent)).toBe(originalFooter)
    expect(themeVariables({ accent: originalAccent })['--footer-rgb' as keyof ReturnType<typeof themeVariables>]).toBe('58 63 45')
    const light = themeVariables({ accent: '#728793', theme: { footerColor: '#eee6dd' } })
    expect(light).toMatchObject({ '--footer-rgb': '238 230 221', '--footer-ink-rgb': '28 29 26', '--olive-deep': '#435057' })
    expect(themeVariables({ accent: '#728793', theme: { footerColor: '#112233' } })).toMatchObject({ '--footer-ink-rgb': '255 255 255' })
  })
  it('uses the dominant color instead of washing contrasting photos into the same mean color', () => {
    const blue = paletteFromPixels(new Uint8ClampedArray([30, 90, 220, 255, 30, 90, 220, 255, 220, 50, 30, 255, 255, 255, 255, 255]))
    const red = paletteFromPixels(new Uint8ClampedArray([220, 50, 30, 255, 220, 50, 30, 255, 30, 90, 220, 255]))
    expect(blue.accent).not.toBe(red.accent)
    expect(parseInt(blue.accent.slice(5), 16)).toBeGreaterThan(parseInt(blue.accent.slice(1, 3), 16))
    expect(blue.footerColor).toBe(deepColor(blue.accent))
    expect(() => paletteFromPixels([0, 0, 0, 0, 255, 255, 255, 255])).toThrow('缺少可提取')
  })
  it('shows the configured time independent of the visitor timezone, with safe invalid-offset fallback', () => {
    const now = new Date('2026-10-08T20:30:00Z')
    expect(formatSiteTime(now)).toBe('04:30')
    expect(formatSiteTime(now, '-05:00')).toBe('15:30')
    expect(formatSiteTime(now, '+05:30')).toBe('02:00')
    expect(formatSiteTime(now, 'broken')).toBe('04:30')
    expect(formatSiteTime(now, '+14:59')).toBe('04:30')
  })
})
