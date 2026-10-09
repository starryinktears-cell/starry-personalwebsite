import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import { atmosphereVariables, themeVariables, type ColorMode } from '../lib/theme'
import type { SiteSettings } from '../lib/types'
import { copy, type Language } from '../lib/i18n'

const ModeContext = createContext<{ mode: ColorMode; toggle: () => void }>({ mode: 'light', toggle: () => undefined })
export const useColorMode = () => useContext(ModeContext)
const storageKey = 'starry-color-mode'
export function ColorModeProvider({ settings, children }: { settings: SiteSettings; children: ReactNode }) {
  const [choice, setChoice] = useState<ColorMode | null>(() => { try { const value = localStorage.getItem(storageKey); return value === 'light' || value === 'dark' ? value : null } catch { return null } })
  const mode = choice ?? settings.theme?.defaultMode ?? 'light'
  useEffect(() => {
    for (const [key, value] of Object.entries({ ...themeVariables(settings, mode), ...atmosphereVariables(settings, mode) })) document.documentElement.style.setProperty(key, String(value))
    document.documentElement.style.colorScheme = mode
    document.documentElement.dataset.colorMode = mode
  }, [settings, mode])
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === storageKey) setChoice(event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null) }
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync)
  }, [])
  const toggle = () => { const next = mode === 'light' ? 'dark' : 'light'; setChoice(next); try { localStorage.setItem(storageKey, next) } catch { /* A blocked storage must not prevent switching. */ } }
  return <ModeContext.Provider value={{ mode, toggle }}>{children}</ModeContext.Provider>
}
export function ColorModeToggle({ language = 'zh', label = false }: { language?: Language; label?: boolean }) {
  const { mode, toggle } = useColorMode()
  const text = mode === 'light' ? copy(language, 'Switch to night', '切换夜间模式') : copy(language, 'Switch to day', '切换日间模式')
  return <button type="button" onClick={toggle} aria-label={text} title={text} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-full border border-current/20 px-3 transition hover:opacity-70">{mode === 'light' ? <Moon size={17} /> : <Sun size={17} />}{label && <span className="text-xs tracking-wider">{text}</span>}</button>
}
