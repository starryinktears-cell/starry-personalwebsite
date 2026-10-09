import { describe, expect, it } from 'vitest'
import { atmosphereVariables, modePalette, deepColor, originalAccent, originalFooter, paletteFromPixels, themeVariables } from '../src/lib/theme'
import { formatSiteTime } from '../src/lib/siteClock'

describe('site color and clock configuration', () => {
  it('resolves independent day/night accents and glows without changing a legacy footer', () => {
    const settings = { accent: '#004d99', theme: { footerColor: '#002d5a', light: { accent: '#315674', glow: '#83acbc' }, dark: { accent: '#8dabc4', glow: '#345e80', footer: '#071325' } } }
    expect(themeVariables(settings, 'light')).toMatchObject({ '--olive': '#315674', '--footer-rgb': '0 45 90' })
    expect(themeVariables(settings, 'dark')).toMatchObject({ '--olive': '#8dabc4', '--footer-rgb': '7 19 37' })
    expect(atmosphereVariables(settings, 'dark')).toMatchObject({ '--aurora-rgb': '52 94 128' })
    expect(themeVariables({ accent: '#004d99' }, 'dark')).toMatchObject({ '--olive': '#004d99' })
  })
  it('uses a light day section and opt-out night atmosphere while preserving custom palettes', () => {
    const settings = { accent: originalAccent, theme: {} }
    expect(modePalette(settings, 'light').section).toBe('#e5e9e8')
    expect(themeVariables(settings, 'light')).toMatchObject({ '--section-ink-rgb': '28 29 26' })
    expect(atmosphereVariables(settings, 'light')).toMatchObject({ '--atmosphere-image': 'none' })
    expect(atmosphereVariables({ theme: { nightAtmosphere: false } }, 'dark')).toMatchObject({ '--atmosphere-image': 'none' })
    expect(Object.values(atmosphereVariables({ theme: { nightGlow: '#112233' } }, 'dark'))[0]).toContain('17 34 51')
    expect(modePalette({ ...settings, theme: { light: { section: '#dddddd' } } }, 'light').section).toBe('#dddddd')
  })
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
