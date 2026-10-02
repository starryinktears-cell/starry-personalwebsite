import { useEffect } from 'react'

export function MotionRuntime() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return

    let cancelled = false
    let cleanup: (() => void) | undefined
    const start = async () => {
      const [{ default: Lenis }, gsapModule, scrollTriggerModule] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      const gsap = gsapModule.gsap
      const ScrollTrigger = scrollTriggerModule.default ?? scrollTriggerModule.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
      const onScroll = () => ScrollTrigger.update()
      const raf = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', onScroll)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(0)
      cleanup = () => { lenis.off('scroll', onScroll); gsap.ticker.remove(raf); lenis.destroy() }
    }
    const idle = window.setTimeout(() => { void start() }, 250)
    return () => {
      cancelled = true
      window.clearTimeout(idle)
      cleanup?.()
    }
  }, [])
  return null
}
