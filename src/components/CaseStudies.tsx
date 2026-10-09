import { EditableContent } from './EditableContent'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import type { SiteSettings } from '../lib/types'
import type { Language } from '../lib/i18n'
import { copy } from '../lib/i18n'
import { contentText, siteImage } from '../lib/siteContent'
import { getCaseDefinitions, safeExternalUrl } from '../data/caseCatalog'

export const casesEnabled = (settings: SiteSettings) => contentText(settings, 'cases.enabled', 'zh') === '1'
export function CaseCollection({ settings, language, preview = false }: { settings: SiteSettings; language: Language; preview?: boolean }) {
  if (!preview && !casesEnabled(settings)) return null
  const items = getCaseDefinitions(settings).filter(item => contentText(settings, `case.${item.id}.visible`, 'zh') === '1')
  return <section className="case-collection mx-auto max-w-[1600px] px-6 py-20 md:px-10 md:py-28" aria-label={copy(language, 'Selected projects', '项目案例')}>
    <span className="eyebrow">STARRY / SELECTED PRACTICE</span>
    <h2 className="display-title mt-5 text-5xl md:text-7xl"><EditableContent field={'cases.heading'}>{contentText(settings, 'cases.heading', language)}</EditableContent></h2>
    <p className="mt-6 max-w-2xl text-muted"><EditableContent field={'cases.intro'}>{contentText(settings, 'cases.intro', language)}</EditableContent></p>
    <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => {
      const { id } = item
      const t = (key: string) => contentText(settings, `case.${item.id}.${key}`, language)
      const cover = siteImage(settings, `case.${item.id}.cover`)
      return <Link key={item.id} to={`/cases/${item.id}`} className="group min-w-0 border-t rule pt-5">
        <div className="flex items-center justify-between gap-4"><span className="eyebrow"><EditableContent field={`case.${id}.${'kicker'}`}>{t('kicker')}</EditableContent></span><ArrowRight size={18} className="shrink-0" /></div>
        <div className="relative mt-5 aspect-[4/3] overflow-hidden bg-paper2"><img data-edit-key={`case.${item.id}.cover`} src={cover.src} alt={cover.alt} loading="lazy" width="720" height="540" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />{t('mediaNote') && <span className="absolute bottom-3 left-3 right-3 w-fit bg-paper/95 px-3 py-1 text-xs text-ink"><EditableContent field={`case.${id}.${'mediaNote'}`}>{t('mediaNote')}</EditableContent></span>}</div>
        <div className="mt-5"><span className="display-title text-4xl text-olive"><EditableContent field={`case.${id}.${'metric'}`}>{t('metric')}</EditableContent></span><span className="ml-3 text-sm text-muted"><EditableContent field={`case.${id}.${'metricLabel'}`}>{t('metricLabel')}</EditableContent></span></div>
        <h3 className="display-title mt-4 text-3xl leading-tight"><EditableContent field={`case.${id}.${'title'}`}>{t('title')}</EditableContent></h3><p className="mt-3 text-sm leading-relaxed text-muted"><EditableContent field={`case.${id}.${'note'}`}>{t('note')}</EditableContent></p>
      </Link>
    })}</div>
  </section>
}

function CaseVideo({ settings, language, id, index }: { settings: SiteSettings; language: Language; id: string; index: number }) {
  const key = `case.${id}.video.${index}`
  const url = safeExternalUrl(contentText(settings, `${key}.url`, language))
  const media = settings.content?.videos?.[key]
  const [failed, setFailed] = useState(false)
  // Uploaded media use renewed owner-scoped URLs. External video pages stay outbound links.
  const src = media?.src || '/videos/placeholder.mp4'
  const placeholder = !media?.src
  return <figure data-edit-key={key} className="min-w-0">
    <div className="relative aspect-video bg-night">
      <video data-edit-key={key} key={src} src={src} controls playsInline preload="metadata" aria-label={contentText(settings, `${key}.title`, language)} className="h-full w-full object-contain" onError={() => setFailed(true)} onLoadedData={() => setFailed(false)} />
      {placeholder && <span className="pointer-events-none absolute left-3 top-3 bg-paper/95 px-3 py-1 text-xs text-ink">{copy(language, 'Placeholder video · not project footage', '占位视频 · 非项目成片')}</span>}
    </div>
    <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3"><span><EditableContent field={`${key}.title`}>{contentText(settings, `${key}.title`, language)}</EditableContent></span>{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 border-b border-olive text-sm">{copy(language, 'Watch on original page', '打开原视频页面')}<ExternalLink size={14} /></a> : <span className="text-sm text-muted">{copy(language, 'Video link to follow', '视频链接待补充')}</span>}</figcaption>
    {failed && <p role="status" className="mt-3 text-sm text-muted">{copy(language, 'Video unavailable. Please use the original page link or try again later.', '暂时无法播放，请使用原视频链接或稍后重试。')}</p>}
  </figure>
}

export function CasePage({ settings, language, caseId, previewSection }: { settings: SiteSettings; language: Language; caseId?: string; previewSection?: string }) {
  const params = useParams()
  const id = caseId ?? params.caseId
  const item = getCaseDefinitions(settings).find(entry => entry.id === id)
  const preview = !!caseId
  if (!item || (!preview && (!casesEnabled(settings) || contentText(settings, `case.${id}.visible`, 'zh') !== '1'))) return <section className="mx-auto max-w-5xl px-6 py-24"><h1 className="display-title text-6xl">{copy(language, 'Project unavailable', '案例暂未公开')}</h1><Link className="mt-8 inline-block underline" to="/work">{copy(language, 'Back to work', '返回作品')}</Link></section>
  const t = (key: string) => contentText(settings, `case.${id}.${key}`, language)
  const cover = siteImage(settings, `case.${id}.cover`)
  const link = safeExternalUrl(t('linkUrl'))
  const mediaOnly = previewSection?.includes('.video.')
  const routeOnly = previewSection?.includes('.route.')
  return <article className="case-page mx-auto max-w-[1500px] px-6 py-16 md:px-10 md:py-24">
    {!mediaOnly && !routeOnly && <>
      <Link to="/work" className="eyebrow inline-block py-3">← {copy(language, 'All projects', '全部作品')}</Link>
      <div className="mt-8 grid gap-10 border-b rule pb-12 md:grid-cols-[1.5fr_1fr]">
        <div><span className="eyebrow"><EditableContent field={`case.${id}.${'kicker'}`}>{t('kicker')}</EditableContent></span><h1 className="display-title mt-6 text-[clamp(3rem,6vw,6rem)] leading-tight"><EditableContent field={`case.${id}.${'title'}`}>{t('title')}</EditableContent></h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted"><EditableContent field={`case.${id}.${'intro'}`}>{t('intro')}</EditableContent></p></div>
        <div className="self-end border-l border-olive/30 pl-8"><strong className="display-title block text-7xl font-normal text-olive"><EditableContent field={`case.${id}.${'metric'}`}>{t('metric')}</EditableContent></strong><p className="mt-4 text-sm"><EditableContent field={`case.${id}.${'metricLabel'}`}>{t('metricLabel')}</EditableContent></p><p className="mt-3 text-sm text-muted"><EditableContent field={`case.${id}.${'note'}`}>{t('note')}</EditableContent></p></div>
      </div>
      <figure className="mt-10"><img data-edit-key={`case.${id}.cover`} src={cover.src} alt={cover.alt} width="1500" height="750" className="max-h-[600px] w-full object-cover" />{t('mediaNote') && <figcaption className="mt-3 text-xs text-muted"><EditableContent field={`case.${id}.${'mediaNote'}`}>{t('mediaNote')}</EditableContent></figcaption>}</figure>
      <section className="grid gap-10 py-16 md:grid-cols-[1.4fr_1fr]"><div><h2 className="eyebrow">{copy(language, 'PROJECT OVERVIEW', '项目概览')}</h2><p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted"><EditableContent field={`case.${id}.${'body'}`}>{t('body')}</EditableContent></p>{link && <a href={link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-3 border-b border-olive"><EditableContent field={`case.${id}.${'linkLabel'}`}>{t('linkLabel')}</EditableContent> <ExternalLink size={16} /></a>}</div><div><h2 className="eyebrow">{copy(language, 'CONTENT & SCOPE', '内容与范围')}</h2><ul data-edit-key={`case.${id}.outputs`} className="mt-5">{t('outputs').split('\n').filter(Boolean).map((line, i) => <li key={i} className="border-b rule py-3">{line}</li>)}</ul></div></section>
    </>}
    {!routeOnly && <section className="border-t rule py-12"><h2 className="display-title mb-8 text-4xl">{copy(language, 'Films & stories', '视频与故事')}</h2><div className="grid gap-10 md:grid-cols-2">{[0, 1].map(i => <CaseVideo key={`${id}-${i}`} settings={settings} language={language} id={item.id} index={i} />)}</div><div className="mt-12 grid gap-6 md:grid-cols-2">{['photo1', 'photo2'].map(slot => { const image = siteImage(settings, `case.${id}.${slot}`); return <figure key={slot}><img data-edit-key={`case.${id}.${slot}`} src={image.src} alt={image.alt} loading="lazy" width="720" height="540" className="aspect-[4/3] w-full object-cover" />{t('mediaNote') && <figcaption className="mt-3 text-xs text-muted"><EditableContent field={`case.${id}.${'mediaNote'}`}>{t('mediaNote')}</EditableContent></figcaption>}</figure> })}</div></section>}
    {id === 'travel' && !mediaOnly && <section className="border-t rule py-12"><h2 className="display-title text-4xl">{copy(language, 'Along the route', '沿着路线，慢慢走')}</h2><ol className="mt-8 grid gap-8 md:grid-cols-3">{[0, 1, 2].map(i => { const routeLink = safeExternalUrl(t(`route.${i}.url`)); return <li key={i} className="border-t border-olive/40 pt-5"><span className="mono text-olive">0{i + 1}</span><h3 className="display-title mt-4 text-2xl"><EditableContent field={`case.${id}.${`route.${i}.title`}`}>{t(`route.${i}.title`)}</EditableContent></h3><p className="mt-4 whitespace-pre-line text-muted"><EditableContent field={`case.${id}.${`route.${i}.body`}`}>{t(`route.${i}.body`)}</EditableContent></p>{routeLink && <a href={routeLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block min-h-11 border-b border-olive py-3">{copy(language, 'View route ↗', '查看路线 ↗')}</a>}</li> })}</ol></section>}
    <Link to="/contact" className="inline-flex min-h-12 items-center gap-5 border-b border-olive text-lg">{copy(language, 'Start a conversation', '聊聊合作')}<ArrowRight size={18} /></Link>
  </article>
}
