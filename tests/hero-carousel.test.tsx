import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HeroCarousel } from '../src/components/HeroCarousel'
import { applyPersonalDraft } from '../src/data/personalContent'
import { siteSettings } from '../src/lib/mockData'
import { ensureHeroSlides } from '../src/lib/heroSlides'

beforeEach(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) })
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })
const renderHero = () => render(<MemoryRouter><HeroCarousel settings={applyPersonalDraft(siteSettings)} language="zh" /></MemoryRouter>)
const title = () => screen.getByRole('heading', { level: 1 })

describe('homepage carousel', () => {
  it('freezes legacy case images, supports independent copy/order/visibility and safe case links', () => {
    const settings = ensureHeroSlides(applyPersonalDraft(siteSettings))
    const original = settings.content!.images['hero.creator.cover'].src
    settings.content!.images['case.creator.cover'] = { src: '/images/forest.webp', alt: '新的案例封面' }
    settings.content!.texts['case.creator.title'] = { zh: '案例新标题', en: 'Case title' }
    settings.content!.texts['hero.creator.title'] = { zh: '独立轮播标题', en: 'Independent slide' }
    settings.content!.heroSlides = [{ id: 'creator', caseId: 'creator', visible: true }, { id: 'intro', visible: false }]
    const view = render(<MemoryRouter><HeroCarousel settings={settings} language="zh" /></MemoryRouter>)
    expect(title()).toHaveTextContent('独立轮播标题')
    expect(screen.getByRole('img')).toHaveAttribute('src', original)
    expect(screen.getByRole('link', { name: '查看案例' })).toHaveAttribute('href', '/cases/creator')
    settings.content!.texts['case.creator.visible'] = { zh: '0', en: '0' }
    view.rerender(<MemoryRouter><HeroCarousel settings={settings} language="zh" /></MemoryRouter>)
    expect(title()).toHaveTextContent('独立轮播标题')
    expect(screen.queryByRole('link', { name: '查看案例' })).not.toBeInTheDocument()
  })
  it('scrolls straight to the next module without exhausting slides and previews a chosen screen', () => {
    const settings = ensureHeroSlides(applyPersonalDraft(siteSettings))
    const view = render(<MemoryRouter><HeroCarousel settings={settings} language="zh" /><section data-testid="next" /></MemoryRouter>)
    const scroll = vi.fn(); screen.getByTestId('next').scrollIntoView = scroll
    fireEvent.click(screen.getByRole('button', { name: '向下浏览下一模块' }))
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(title()).toHaveTextContent('让想法被看见')
    view.rerender(<MemoryRouter><HeroCarousel settings={settings} language="zh" introOnly previewSlideId="plugin" /></MemoryRouter>)
    expect(title()).toHaveTextContent('把审美语言变成工具')
    expect(screen.queryByRole('button', { name: '向下浏览下一模块' })).not.toBeInTheDocument()
  })
  it('advances at 13 seconds, updates links and pauses without arrow chrome', () => {
    vi.useFakeTimers(); renderHero()
    expect(title()).toHaveTextContent('让想法被看见')
    expect(screen.queryByRole('button', { name: '下一张' })).not.toBeInTheDocument()
    expect(screen.getByRole('region').querySelector('svg')).toBeNull()
    act(() => vi.advanceTimersByTime(12900))
    expect(title()).toHaveTextContent('让想法被看见')
    act(() => vi.advanceTimersByTime(100))
    expect(title()).toHaveTextContent('个人 IP 与内容运营')
    expect(screen.getByRole('link', { name: '查看案例' })).toHaveAttribute('href', '/cases/creator')
    fireEvent.click(screen.getByRole('button', { name: '暂停轮播' }))
    act(() => vi.advanceTimersByTime(26000))
    expect(title()).toHaveTextContent('个人 IP 与内容运营')
    fireEvent.click(screen.getByRole('button', { name: '播放轮播' }))
    act(() => vi.advanceTimersByTime(13000))
    expect(screen.getByRole('link', { name: '查看案例' })).toHaveAttribute('href', '/cases/plugin')
  })
  it('handles each wheel gesture once and releases page scrolling at the edges', () => {
    vi.useFakeTimers(); renderHero()
    const hero = screen.getByRole('region')
    vi.spyOn(hero, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: window.innerHeight } as DOMRect)
    expect(fireEvent.wheel(hero, { deltaY: -100 })).toBe(true)
    expect(fireEvent.wheel(hero, { deltaY: 100 })).toBe(false)
    expect(title()).toHaveTextContent('个人 IP 与内容运营')
    fireEvent.wheel(hero, { deltaY: 200 })
    expect(title()).toHaveTextContent('个人 IP 与内容运营')
    act(() => vi.advanceTimersByTime(300))
    fireEvent.wheel(hero, { deltaY: 100 })
    expect(screen.getByRole('link', { name: '查看案例' })).toHaveAttribute('href', '/cases/plugin')
    fireEvent.click(screen.getByRole('button', { name: '切换轮播：把专业内容讲得亲近' }))
    act(() => vi.advanceTimersByTime(300))
    expect(fireEvent.wheel(hero, { deltaY: 100 })).toBe(true)
    vi.mocked(hero.getBoundingClientRect).mockReturnValue({ top: -500, bottom: 200 } as DOMRect)
    expect(fireEvent.wheel(hero, { deltaY: -100 })).toBe(true)
  })
  it('returns to the page top before changing slides and lets the same scroll gesture finish', () => {
    vi.useFakeTimers(); renderHero()
    const hero = screen.getByRole('region')
    const rect = vi.spyOn(hero, 'getBoundingClientRect')
    fireEvent.click(screen.getByRole('button', { name: '切换轮播：把审美语言变成工具' }))
    for (const offset of [150, 78, 2]) {
      rect.mockReturnValue({ top: -offset, bottom: window.innerHeight - offset } as DOMRect)
      expect(fireEvent.wheel(hero, { deltaY: -80 })).toBe(true)
      expect(title()).toHaveTextContent('把审美语言变成工具')
    }
    rect.mockReturnValue({ top: 0, bottom: window.innerHeight } as DOMRect)
    expect(fireEvent.wheel(hero, { deltaY: -80 })).toBe(true)
    expect(title()).toHaveTextContent('把审美语言变成工具')
    act(() => vi.advanceTimersByTime(300))
    expect(fireEvent.wheel(hero, { deltaY: -80 })).toBe(false)
    expect(title()).toHaveTextContent('个人 IP 与内容运营')
  })
  it('releases a locked carousel gesture when the page is away from the top', () => {
    vi.useFakeTimers(); renderHero()
    const hero = screen.getByRole('region')
    const rect = vi.spyOn(hero, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: window.innerHeight } as DOMRect)
    expect(fireEvent.wheel(hero, { deltaY: 100 })).toBe(false)
    rect.mockReturnValue({ top: -78, bottom: window.innerHeight - 78 } as DOMRect)
    expect(fireEvent.wheel(hero, { deltaY: -100 })).toBe(true)
    rect.mockReturnValue({ top: 0, bottom: window.innerHeight } as DOMRect)
    expect(fireEvent.wheel(hero, { deltaY: -100 })).toBe(true)
    expect(title()).toHaveTextContent('个人 IP 与内容运营')
    act(() => vi.advanceTimersByTime(300))
    expect(fireEvent.wheel(hero, { deltaY: -100 })).toBe(false)
    expect(title()).toHaveTextContent('让想法被看见')
    act(() => vi.advanceTimersByTime(300))
    expect(fireEvent.wheel(hero, { deltaY: -100 })).toBe(true)
  })
  it('respects reduced motion, keyboard/touch controls and hidden bilingual case updates', () => {
    vi.useFakeTimers()
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList)
    const settings = applyPersonalDraft(siteSettings)
    const view = render(<MemoryRouter><HeroCarousel settings={settings} language="zh" /></MemoryRouter>)
    act(() => vi.advanceTimersByTime(30000))
    expect(title()).toHaveTextContent('让想法被看见')
    const hero = screen.getByRole('region')
    fireEvent.touchStart(hero, { touches: [{ clientX: 300, clientY: 400 }] })
    fireEvent.touchEnd(hero, { changedTouches: [{ clientX: 90, clientY: 410 }] })
    expect(title()).toHaveTextContent('个人 IP 与内容运营')
    fireEvent.keyDown(hero, { key: 'ArrowRight' })
    expect(screen.getByRole('link', { name: '查看案例' })).toHaveAttribute('href', '/cases/plugin')
    const updated = structuredClone(settings)
    updated.content!.texts['case.plugin.title'] = { zh: '更新项目', en: 'Updated project' }
    view.rerender(<MemoryRouter><HeroCarousel settings={updated} language="en" /></MemoryRouter>)
    expect(title()).toHaveTextContent('Updated project')
    updated.content!.texts['case.plugin.visible'] = { zh: '0', en: '0' }
    view.rerender(<MemoryRouter><HeroCarousel settings={updated} language="en" /></MemoryRouter>)
    expect(title()).toHaveTextContent('Make ideas seen.')
    expect(within(screen.getByRole('group', { name: 'Choose slide' })).getAllByRole('button')).toHaveLength(6)
  })
  it('stops auto-advancing when the browser tab is hidden', () => {
    vi.useFakeTimers(); renderHero()
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    fireEvent(document, new Event('visibilitychange'))
    act(() => vi.advanceTimersByTime(26000))
    expect(title()).toHaveTextContent('让想法被看见')
  })
})
