import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { SiteSettings } from '../lib/types'
import { themeVariables } from '../lib/theme'

/** Scale the real public components to fit the editor without changing their layout. */
export function SettingsPreview({ children, settings, width = 1120 }: { children: ReactNode; settings: SiteSettings; width?: number }) {
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
    <div className="settings-preview-canvas bg-paper text-ink" inert style={{ width, zoom: scale, ...themeVariables(settings) }}>
      {children}
    </div>
  </div>
}
