import { EditableContent } from './EditableContent'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SiteSettings } from '../lib/types'
import { copy, type Language } from '../lib/i18n'
import { contentText, imageVariants, siteImage } from '../lib/siteContent'
import { ensureHeroSlides } from '../lib/heroSlides'

/** Auto-advance is local to the visible hero; wheel gestures never change routes. */
export function HeroCarousel({ settings: inputSettings, language, introOnly = false, previewSlideId }: { settings: SiteSettings; language: Language; introOnly?: boolean; previewSlideId?: string }) {
  const settings = ensureHeroSlides(inputSettings)
  const [activeId, setActiveId] = useState('intro')
  const root = useRef<HTMLElement>(null)
  const wheel = useRef({ last: 0, amount: 0, locked: false, pageScrolling: false })
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(query.matches)
    query.addEventListener?.('change', change)
    return () => query.removeEventListener?.('change', change)
  }, [])
  useEffect(() => {
    if (!root.current || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .55), { threshold: [.55] })
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [])
  const [documentVisible, setDocumentVisible] = useState(!document.hidden)
  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  const touch = useRef<{ x: number; y: number } | null>(null)
  const definitions = settings.content!.heroSlides!
  const visibleSlides = definitions.filter(slide => slide.visible).map(slide => slide.id)
  const slides = introOnly ? [previewSlideId ?? 'intro'] : visibleSlides.length ? visibleSlides : ['intro']
  // If a saved update hides the current case, show the introduction instead.
  const index = Math.max(0, slides.indexOf(activeId))
  const id = slides[index]
  const isIntro = id === 'intro'
  const caseId = definitions.find(slide => slide.id === id)?.caseId
  const linkedCase = caseId && contentText(settings, 'cases.enabled', 'zh') === '1' && contentText(settings, `case.${caseId}.visible`, 'zh') === '1' ? caseId : undefined
  const t = (key: string) => contentText(settings, key, language)
  const titleFor = (slide: string) => t(slide === 'intro' ? 'home.heroTitle' : `hero.${slide}.title`)
  const title = titleFor(id)
  const media = isIntro ? { src: settings.heroImage, alt: settings.heroAlt || t('HomePage.0cd34940') } : siteImage(settings, `hero.${id}.cover`)
  const src = media.src || settings.heroImage
  const variants = imageVariants(src)
  const select = (next: number) => setActiveId(slides[(next + slides.length) % slides.length])
  const controls = slides.length > 1

  const slideKey = slides.join('|')
  const playing = controls && !paused && !reduced && visible && documentVisible && !introOnly
  useEffect(() => {
    setProgress(0)
    if (!playing) return
    const started = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started
      if (elapsed >= 13000) {
        window.clearInterval(timer)
        const items = slideKey.split('|')
        setActiveId(items[(index + 1) % items.length])
      } else setProgress(elapsed / 13000)
    }, 100)
    return () => window.clearInterval(timer)
  }, [playing, index, slideKey])
  useEffect(() => {
    const element = root.current
    if (!element || !controls || introOnly) return
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      const now = Date.now()
      const gesture = wheel.current
      if (now - gesture.last > 220) { gesture.amount = 0; gesture.locked = false; gesture.pageScrolling = false }
      gesture.last = now
      const rect = element.getBoundingClientRect()
      // Return all the way to the top before consuming wheel input for slides.
      // A page-scroll gesture keeps ownership through its trailing inertia.
      if (Math.abs(rect.top) > 1 || rect.bottom < window.innerHeight * .75) {
        gesture.amount = 0
        gesture.locked = false
        gesture.pageScrolling = true
        return
      }
      if (gesture.pageScrolling) return
      if (gesture.locked) { event.preventDefault(); return }
      const items = slideKey.split('|')
      const next = index + (event.deltaY > 0 ? 1 : -1)
      // At either end, a fresh gesture scrolls the page normally.
      if (next < 0 || next >= items.length) return
      event.preventDefault()
      gesture.amount += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1)
      if (Math.abs(gesture.amount) >= 60) { gesture.locked = true; setActiveId(items[next]) }
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [controls, introOnly, index, slideKey])

  return <section ref={root} data-edit-key={isIntro ? 'hero' : `hero.${id}.cover`} data-lenis-prevent-wheel onFocusCapture={event => { if (!(event.target as HTMLElement).closest('[data-playback]')) setPaused(true) }} className="hero-carousel relative isolate overflow-hidden bg-night text-ivory" role="region" aria-roledescription={copy(language, 'carousel', '轮播')} aria-label={copy(language, 'Homepage carousel', '首页轮播')}
    onKeyDown={event => {
      if (!controls || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'ArrowRight') { event.preventDefault(); select(index + 1) }
      if (event.key === 'ArrowLeft') { event.preventDefault(); select(index - 1) }
    }}
    onTouchStart={event => {
      touch.current = event.touches.length === 1 && !(event.target as HTMLElement).closest('a, button') ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null
    }}
    onTouchCancel={() => { touch.current = null }}
    onTouchEnd={event => {
      const start = touch.current; touch.current = null
      if (!start || !controls || !event.changedTouches[0]) return
      const dx = event.changedTouches[0].clientX - start.x
      const dy = event.changedTouches[0].clientY - start.y
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) select(index + (dx < 0 ? 1 : -1))
    }}>
    <picture data-edit-key={isIntro ? 'hero' : `hero.${id}.cover`} key={src} className="hero-carousel-image absolute inset-0">
      {variants.srcSet && <source srcSet={variants.srcSet.replace(/\.webp/g, '.avif')} type="image/avif" />}
      <img src={src} srcSet={variants.srcSet} sizes="100vw" alt={media.alt} width="1800" height="1100" loading="eager" fetchPriority={isIntro ? 'high' : 'auto'} className="h-full w-full object-cover" style={variants.lqip ? { backgroundImage: `url(${variants.lqip})`, backgroundSize: 'cover' } : undefined} />
    </picture>
    <div aria-hidden="true" className="hero-shade pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(14,15,13,.78),rgba(14,15,13,.2)),linear-gradient(0deg,rgba(14,15,13,.65),transparent_45%)]" />
    <div className="absolute inset-x-0 top-28 z-10 mx-auto flex max-w-[1600px] justify-between gap-8 px-6 mono text-[11px] tracking-[.12em] text-ivory/75 md:px-10">
      <span data-edit-key={isIntro ? 'home.scene' : `hero.${id}.kicker`}>{isIntro ? t('home.scene') : t(`hero.${id}.kicker`)}<br /><EditableContent field={isIntro ? 'home.coordinates' : `hero.${id}.mediaNote`}>{isIntro ? t('home.coordinates') : t(`hero.${id}.mediaNote`)}</EditableContent></span>
      <span className="hidden shrink-0 text-right md:block"><EditableContent field={'home.exposure'}>{t('home.exposure')}</EditableContent><br /><EditableContent field={'home.frame'}>{t('home.frame')}</EditableContent></span>
    </div>
    <div id="hero-carousel-slide" role="group" aria-roledescription={copy(language, 'slide', '幻灯片')} aria-label={`${index + 1} / ${slides.length}`} className="hero-carousel-content relative z-10 mx-auto flex max-w-[1600px] flex-col justify-center px-6 md:px-10">
      <div key={id} className="hero-carousel-copy max-w-[950px]">
        {isIntro && <p className="mono text-xs leading-relaxed tracking-[.16em] text-ivory/80"><EditableContent field={'home.heroSubtitle'}>{t('home.heroSubtitle')}</EditableContent></p>}
        <h1 data-edit-key={isIntro ? 'home.heroTitle' : `hero.${id}.title`} className={`display-title mt-6 break-words leading-[1.05] ${isIntro ? 'max-w-4xl text-[clamp(3.5rem,9vw,9rem)]' : 'max-w-4xl text-[clamp(3rem,7vw,7.5rem)]'}`}>{title}</h1>
        {!isIntro && <>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory/85 md:text-lg"><EditableContent field={`hero.${id}.intro`}>{t(`hero.${id}.intro`)}</EditableContent></p>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1"><span className="display-title text-4xl md:text-5xl"><EditableContent field={`hero.${id}.metric`}>{t(`hero.${id}.metric`)}</EditableContent></span><span className="text-sm text-ivory/85"><EditableContent field={`hero.${id}.metricLabel`}>{t(`hero.${id}.metricLabel`)}</EditableContent></span></div>
          <p className="mt-2 text-xs leading-relaxed text-ivory/75"><EditableContent field={`hero.${id}.note`}>{t(`hero.${id}.note`)}</EditableContent></p>
        </>}
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
          <Link data-edit-key={isIntro ? 'HomePage.3e1e9eba' : `hero.${id}.title`} to={linkedCase ? `/cases/${linkedCase}` : '/work'} className="inline-flex min-h-12 items-center gap-5 bg-ivory px-6 py-3 text-xs tracking-[.15em] text-[#1c1d1a] transition-colors hover:bg-white">{isIntro ? t('HomePage.3e1e9eba') : linkedCase ? copy(language, 'VIEW PROJECT', '查看案例') : copy(language, 'ALL PROJECTS', '全部作品')}</Link>
          <Link data-edit-key={isIntro ? 'HomePage.a08934e1' : `hero.${id}.title`} to={isIntro ? '/contact' : '/work'} className="under-line inline-flex min-h-11 items-center gap-3 py-3 text-xs tracking-[.15em] text-ivory">{isIntro ? t('HomePage.a08934e1') : copy(language, 'ALL PROJECTS', '全部作品')}</Link>
        </div>
      </div>
    </div>
    {controls && <div className="hero-playback absolute inset-x-0 bottom-5 z-10 mx-auto flex max-w-[1600px] items-center gap-6 px-6 md:bottom-7 md:px-10">
      <div className="flex max-w-xl flex-1 gap-2" role="group" aria-label={copy(language, 'Choose slide', '选择轮播页')}>
        {slides.map((slide, i) => <button key={slide} type="button" aria-label={copy(language, `Show slide: ${titleFor(slide)}`, `切换轮播：${titleFor(slide)}`)} aria-current={i === index ? 'true' : undefined} aria-controls="hero-carousel-slide" onClick={() => select(i)} className="hero-progress-segment group relative flex min-h-11 min-w-0 flex-1 items-center">
          <span className="relative h-px w-full overflow-hidden bg-ivory/25"><span className="absolute inset-y-0 left-0 bg-ivory transition-[width] duration-100 ease-linear" style={{ width: `${i === index ? (playing ? progress * 100 : 100) : 0}%` }} /></span>
        </button>)}
      </div>
      <button type="button" data-playback aria-label={copy(language, playing ? 'Pause slideshow' : 'Play slideshow', playing ? '暂停轮播' : '播放轮播')} onClick={() => { setPaused(playing); if (reduced) setReduced(false) }} className="min-h-11 px-2 text-[11px] tracking-widest text-ivory/70 hover:text-ivory">{copy(language, playing ? 'Pause' : 'Play', playing ? '暂停' : '播放')}</button>
    </div>}
    {!introOnly && <button type="button" aria-label={copy(language, 'Go to next section', '向下浏览下一模块')} onClick={() => {
      setPaused(true)
      root.current?.nextElementSibling?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
    }} className="hero-scroll-down absolute bottom-20 left-1/2 z-20 flex min-h-14 min-w-16 -translate-x-1/2 flex-col items-center justify-center gap-3 text-ivory/80 transition hover:text-ivory" title={copy(language, 'Explore below', '向下浏览')}><span className="mono text-[10px] uppercase tracking-[.24em]">{t('home.scroll') || copy(language, 'SCROLL', '向下浏览')}</span><span aria-hidden="true" className="hero-scroll-line h-8 w-px bg-current opacity-60" /></button>}
    <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">{index + 1} / {slides.length} · {title}</span>
  </section>
}
