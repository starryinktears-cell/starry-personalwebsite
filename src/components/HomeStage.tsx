import { useEffect, useRef, type ReactNode } from 'react'

/** Content remains normal interactive DOM, independent of the shared decorative backdrop. */
export function HomeStage({ children, motion = true }: { children: ReactNode; motion?: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!motion || !root.current || typeof IntersectionObserver === 'undefined') return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations = new Set<Animation>()
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        if (preference.matches || typeof entry.target.animate !== 'function') continue
        const animation = entry.target.animate([{ opacity: .5, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 750, easing: 'cubic-bezier(.22,1,.36,1)' })
        animations.add(animation)
        animation.onfinish = () => animations.delete(animation)
      }
    }, { threshold: .08 })
    root.current.querySelectorAll(':scope > section:not(.hero-carousel) > div').forEach(element => observer.observe(element))
    const reduce = () => { if (preference.matches) animations.forEach(animation => animation.cancel()) }
    preference.addEventListener?.('change', reduce)
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); preference.removeEventListener?.('change', reduce) }
  }, [motion])
  return <div ref={root} className="home-stage">{children}</div>
}
