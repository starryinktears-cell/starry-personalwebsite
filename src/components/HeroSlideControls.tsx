import type { SiteSettings } from '../lib/types'
import { addHeroSlide } from '../lib/heroSlides'
import { getCaseDefinitions } from '../data/caseCatalog'

export function HeroSlideControls({ settings, slideId, onChange, onSelect }: { settings: SiteSettings; slideId?: string; onChange: (value: SiteSettings) => void; onSelect: (id: string) => void }) {
  const slides = settings.content!.heroSlides!
  const active = slides.find(slide => slide.id === slideId)
  const index = slides.findIndex(slide => slide.id === slideId)
  const update = (changes: Partial<typeof slides[number]>) => onChange({ ...settings, content: { ...settings.content!, heroSlides: slides.map(slide => slide.id === slideId ? { ...slide, ...changes } : slide) } })
  const move = (offset: number) => {
    const next = [...slides]; [next[index], next[index + offset]] = [next[index + offset], next[index]]
    onChange({ ...settings, content: { ...settings.content!, heroSlides: next } })
  }
  return <div className="space-y-4 border-y rule py-5">
    <p className="text-sm text-muted">每屏图片和文案独立保存，修改案例封面不会影响轮播。每 13 秒自动轮播；观众可直接点向下按钮进入下一模块。关联案例只控制跳转。</p>
    {active ? <>
      <label className="flex items-center gap-3"><input type="checkbox" checked={active.visible} onChange={event => update({ visible: event.target.checked })} />首页显示这一屏</label>
      <label className="block">关联案例<select aria-label="关联案例" className="mt-2 w-full border rule p-3" value={active.caseId ?? ''} onChange={event => update({ caseId: event.target.value || undefined })}><option value="">不关联（进入全部作品）</option>{getCaseDefinitions(settings).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <p className="text-xs text-muted">关联案例若未公开，按钮将进入全部作品，避免跳到不存在的页面。</p>
      <div className="flex gap-3"><button type="button" disabled={index === 0} className="border rule px-4 py-2 disabled:opacity-40" onClick={() => move(-1)}>前移一屏</button><button type="button" disabled={index === slides.length - 1} className="border rule px-4 py-2 disabled:opacity-40" onClick={() => move(1)}>后移一屏</button></div>
    </> : <>
      <button type="button" disabled={slides.length >= 25} className="bg-olive px-5 py-3 text-white disabled:opacity-40" onClick={() => { const next = addHeroSlide(settings); onChange(next); onSelect(next.content!.heroSlides!.at(-1)!.id) }}>添加轮播屏</button>
      <p className="text-sm text-muted">新屏默认隐藏。编辑好图片和文字后开启显示；关闭所有屏时保留介绍首屏。</p>
      {slides.map((slide, i) => <button type="button" className="flex w-full items-center justify-between border-b rule py-3 text-left" key={slide.id} onClick={() => onSelect(slide.id)}><span>第 {i + 1} 屏</span><span className="text-sm text-muted">{slide.visible ? '显示' : '隐藏'} · 编辑</span></button>)}
    </>}
  </div>
}
