import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { SiteSettings } from '../lib/types'
import { atmosphereVariables, themeVariables } from '../lib/theme'
import { PreviewEditing } from './EditableContent'

/** Scale the real public components to fit the editor without changing their layout. */
export function SettingsPreview({ children, settings, onSelect, width = 1120, mode = 'light', home = false }: { children: ReactNode; settings: SiteSettings; width?: number; mode?: 'light' | 'dark'; home?: boolean; onSelect?: (key: string) => void }) {
  const container = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const element = container.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [width])
  return <div ref={container} data-lenis-prevent className="settings-preview-viewport custom-scrollbar">
    <div data-home={home || undefined} className="settings-preview-canvas atmosphere-surface bg-paper text-ink" style={{ width, zoom: scale, colorScheme: mode, ...themeVariables(settings, mode), ...atmosphereVariables(settings, mode) }}
      onClickCapture={event => {
        event.preventDefault(); event.stopPropagation()
        const key = (event.target as HTMLElement).closest<HTMLElement>('[data-edit-key]')?.dataset.editKey
        if (key) onSelect?.(key)
      }} onKeyDownCapture={event => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault(); event.stopPropagation()
        const key = (event.target as HTMLElement).closest<HTMLElement>('[data-edit-key]')?.dataset.editKey
        if (key) onSelect?.(key)
      }} onSubmitCapture={event => event.preventDefault()}>
      <PreviewEditing.Provider value={true}>{children}</PreviewEditing.Provider>
    </div>
  </div>
}
