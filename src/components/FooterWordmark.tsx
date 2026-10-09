import { useContext, useEffect, useId, useRef, type PointerEvent } from 'react'
import { PreviewEditing } from './EditableContent'

/** Two text layers: a permanent outline and a pointer-lit fill, without intercepting scrolling. */
export function FooterWordmark({ text }: { text: string }) {
  const editing = useContext(PreviewEditing)
  const id = useId().replace(/:/g, '')
  const root = useRef<HTMLDivElement>(null)
  const spotlight = useRef<SVGRadialGradientElement>(null)
  const frame = useRef(0)
  const point = useRef({ x: 800, y: 180 })
  const canTrack = useRef(false)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => { canTrack.current = !editing && !reduced.matches && fine.matches; if (root.current) root.current.dataset.active = 'false' }
    update(); reduced.addEventListener?.('change', update); fine.addEventListener?.('change', update)
    return () => { cancelAnimationFrame(frame.current); reduced.removeEventListener?.('change', update); fine.removeEventListener?.('change', update) }
  }, [editing])
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!canTrack.current || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    point.current = { x: (event.clientX - bounds.left) / bounds.width * 1600, y: (event.clientY - bounds.top) / bounds.height * 340 }
    event.currentTarget.dataset.active = 'true'
    if (frame.current) return
    frame.current = requestAnimationFrame(() => { spotlight.current?.setAttribute('cx', String(point.current.x)); spotlight.current?.setAttribute('cy', String(point.current.y)); frame.current = 0 })
  }
  return <div ref={root} className="footer-wordmark" role="img" aria-label={text} tabIndex={editing ? undefined : 0} data-edit-key="footer.wordmark" onPointerMove={move} onPointerLeave={event => { event.currentTarget.dataset.active = 'false' }} onFocus={event => { spotlight.current?.setAttribute('cx', '800'); spotlight.current?.setAttribute('cy', '180'); event.currentTarget.dataset.active = 'true' }} onBlur={event => { event.currentTarget.dataset.active = 'false' }}>
    <svg viewBox="0 0 1600 340" aria-hidden="true" className="block h-auto w-full" focusable="false">
      <defs>
        <radialGradient id={`${id}-spot`} ref={spotlight} gradientUnits="userSpaceOnUse" cx="800" cy="180" r="310"><stop offset="0" stopColor="white" /><stop offset=".4" stopColor="white" stopOpacity=".95" /><stop offset="1" stopColor="white" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="rgb(var(--aurora-rgb))" /><stop offset=".48" stopColor="var(--olive)" /><stop offset="1" stopColor="rgb(var(--footer-ink-rgb))" /></linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="340"><rect width="1600" height="340" fill={`url(#${id}-spot)`} /></mask>
      </defs>
      <text className="footer-wordmark-outline" x="800" y="266" textAnchor="middle" fontSize="300" textLength="1500" lengthAdjust="spacingAndGlyphs">{text}</text>
      <text className="footer-wordmark-fill" x="800" y="266" textAnchor="middle" fontSize="300" textLength="1500" lengthAdjust="spacingAndGlyphs" fill={`url(#${id}-ink)`} mask={`url(#${id}-mask)`}>{text}</text>
    </svg>
  </div>
}
