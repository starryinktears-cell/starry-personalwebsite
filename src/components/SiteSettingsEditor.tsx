import { addExperience, experienceItems } from '../data/workExperience'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Asset, SiteImage, SiteSettings } from '../lib/types'
import { saveSettings, loadMediaLibrary, demoMode } from '../lib/portfolioApi'
import { uploadMedia } from '../lib/uploadMedia'
import { contentPages, contentText, imageSlots, siteImage } from '../lib/siteContent'
import { getContentSections, sectionGroup, contentSectionId, type ContentPage, type ContentSection } from '../lib/siteContentCatalog'
import { SettingsTabs } from './SettingsTabs'
import { MediaPicker } from './MediaPicker'
import { HeroSlideControls } from './HeroSlideControls'
import { ensureHeroSlides } from '../lib/heroSlides'
import { SocialLinksEditor } from './SocialLinksEditor'
import { SettingsPreview } from './SettingsPreview'
import { ThemeControls } from './ThemeControls'
import { extractHeroPalette } from '../lib/theme'
import { copy, type Language } from '../lib/i18n'
import { maxMediaBytes } from '../lib/validation'
import { SiteVideoEditor } from './SiteVideoEditor'
import { applyPersonalDraft } from '../data/personalContent'
import { addCustomCase, getCaseDefinitions, safeSocialUrl, safeExternalUrl } from '../data/caseCatalog'

export function SiteSettingsEditor({ settings, onSave, language, renderPreview }: {
  settings: SiteSettings; onSave: (settings: SiteSettings) => void; language: Language
  renderPreview: (draft: SiteSettings, section: ContentSection) => ReactNode
}) {
  const [draft, setDraft] = useState(() => ensureHeroSlides(settings))
  const [page, setPage] = useState<ContentPage>('首页')
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light')
  const [activeSectionId, setActiveSectionId] = useState('home.heroTitle')
  const editor = useRef<HTMLDivElement>(null)
  const sharedFields = useRef<HTMLDetailsElement>(null)
  const sectionTabs = useRef<HTMLDivElement>(null)
  const [newCaseName, setNewCaseName] = useState('')
  const [focusKey, setFocusKey] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadError, setUploadError] = useState(false)
  const [target, setTarget] = useState('hero')
  const [retry, setRetry] = useState<File | null>(null)
  const [paletteSource, setPaletteSource] = useState<{ src: string } | null>(null)
  const [paletteBusy, setPaletteBusy] = useState(false)
  const [paletteMessage, setPaletteMessage] = useState('')
  useEffect(() => setDraft(ensureHeroSlides(settings)), [settings])
  useEffect(() => { loadMediaLibrary().then(setAssets).catch(error => setMessage(String(error))) }, [])
  useEffect(() => {
    if (!paletteSource) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      void extractHeroPalette(paletteSource.src).then(palette => {
        if (cancelled) return
        setDraft(current => current.heroImage === paletteSource.src ? { ...current, accent: palette.accent, theme: { ...current.theme, footerColor: palette.footerColor, light: { ...current.theme?.light, accent: palette.accent, footer: palette.footerColor }, dark: { ...current.theme?.dark, accent: palette.accent, footer: palette.footerColor }, followHero: true } } : current)
        setPaletteMessage('头图配色已更新到预览，保存后全站生效。')
      }).catch(error => { if (!cancelled) setPaletteMessage(error instanceof Error ? error.message : '取色失败，已保留原配色。') })
        .finally(() => { if (!cancelled) setPaletteBusy(false) })
    }, 350)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [paletteSource])
  const takeHeroColor = (src: string) => { setPaletteBusy(true); setPaletteMessage(''); setPaletteSource({ src }) }
  const changeTheme = (accent: string, footerColor: string, followHero: boolean, syncAccent = false) => {
    setPaletteSource(null); setPaletteBusy(false); setPaletteMessage('')
    setDraft(current => ({ ...current, accent, theme: { ...current.theme, footerColor, light: { ...current.theme?.light, ...(syncAccent ? { accent } : {}), footer: footerColor }, dark: { ...current.theme?.dark, ...(syncAccent ? { accent } : {}), footer: footerColor }, followHero } }))
  }
  const image = (key: string): SiteImage => key === 'hero' ? { src: draft.heroImage, assetId: draft.heroAssetId, alt: draft.heroAlt ?? '' } : siteImage(draft, key)
  const imageLabel = (key: string) => {
    if (key === 'hero') return '首页 / 首屏背景'
    if (key.startsWith('hero.')) return '此屏独立背景图片'
    const section = getContentSections(draft).find(item => item.images.includes(key))
    if (section?.caseId) return `案例 / ${getCaseDefinitions(draft).find(item => item.id === section.caseId)?.name} / ${key.endsWith('.cover') ? '封面' : key.endsWith('.photo1') ? '配图 1' : '配图 2'}`
    if (section?.fields[0]?.key.startsWith('home.capability.')) return `${section.title} / 配图 ${section.images.indexOf(key) + 1}`
    return imageSlots[key]?.label ?? key
  }
  const sectionTitle = (section: ContentSection) => section.title
  const contentSections = getContentSections(draft)
  const sections = contentSections.filter(section => section.page === page)
  const activeSection = sections.find(section => contentSectionId(section) === activeSectionId) ?? sections[0]
  const selectSection = (section: ContentSection, scroll = true) => {
    setActiveSectionId(contentSectionId(section)); setTarget(section.images[0] ?? 'hero')
    setRetry(null); setUploadMessage('')
    if (scroll) editor.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' })
  }
  const group = sectionGroup(activeSection, draft)
  const groups = [...new Map(sections.map(section => { const item = sectionGroup(section, draft); return [item.id, item] })).values()]
  const children = sections.filter(section => sectionGroup(section, draft).id === group.id)
  const selectPreview = (key: string) => {
    if (uploading) return
    if (key === 'siteName' || key === 'contactEmail') {
      if (sharedFields.current) { sharedFields.current.open = true; sharedFields.current.scrollIntoView?.({ block: 'start', behavior: 'smooth' }); sharedFields.current.querySelector<HTMLTextAreaElement>(`[data-field-key="${key}"] textarea`)?.focus({ preventScroll: true }) }
      return
    }
    const section = contentSections.find(item => contentSectionId(item) === key || item.fields.some(field => field.key === key) || item.images.includes(key) || item.videos?.includes(key))
    if (!section) return
    setPage(section.page); selectSection(section, false)
    if (section.images.includes(key)) setTarget(key)
    setFocusKey(key)
  }
  useEffect(() => {
    if (!focusKey) return
    const field = [...(editor.current?.querySelectorAll<HTMLElement>('[data-field-key]') ?? [])].find(element => element.dataset.fieldKey === focusKey)
    field?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
    field?.querySelector<HTMLElement>('textarea, input, select')?.focus({ preventScroll: true })
    setFocusKey('')
  }, [focusKey, activeSectionId])
  const addCase = () => {
    const name = newCaseName.trim()
    if (!name) return
    const next = addCustomCase(draft, name)
    const id = next.content!.customCases!.at(-1)!.id
    setDraft(next); setNewCaseName(''); setActiveSectionId(`case.${id}.visible`); setTarget(`case.${id}.cover`)
    setMessage('案例已加入草稿，内容和媒体组已建立。补充后开启“显示此案例”并保存。')
  }
  const setText = (key: string, locale: Language, value: string) => setDraft(current => ({ ...current, content: { ...current.content, images: current.content?.images ?? {}, texts: { ...current.content?.texts, [key]: { en: contentText(current, key, 'en'), zh: contentText(current, key, 'zh'), [locale]: value } } } }))
  const setLegacy = (key: 'siteName' | 'shortBio' | 'contactEmail' | 'heroTitle' | 'heroSubtitle', value: string) => setDraft(current => {
    const contentKey = key === 'heroTitle' ? 'home.heroTitle' : key === 'heroSubtitle' ? 'home.heroSubtitle' : key === 'shortBio' ? 'AboutPage.92bac68a' : null
    return { ...current, [key]: value, ...(contentKey ? { content: { ...current.content, images: current.content?.images ?? {}, texts: { ...current.content?.texts, [contentKey]: { zh: value, en: value } } } } : {}) }
  })
  const setImage = (key: string, image: SiteImage) => {
    if (key === 'hero') {
      setDraft(current => ({ ...current, heroImage: image.src, heroAssetId: image.assetId ?? null, heroAlt: image.alt }))
      if (image.src !== draft.heroImage && (draft.theme?.followHero ?? true)) takeHeroColor(image.src)
    }
    else setDraft(current => ({ ...current, content: { ...current.content, texts: current.content?.texts ?? {}, images: { ...current.content?.images, [key]: image } } }))
  }
  const upload = async (file: File) => {
    const uploadTarget = target
    setUploading(true); setProgress(0); setMessage(''); setUploadMessage(''); setUploadError(false); setRetry(file)
    try {
      if (!file.type.startsWith('image/')) throw new Error('请选择 JPG、PNG 或 WebP 图片。')
      const asset = await uploadMedia(file, setProgress)
      setAssets(current => [asset, ...current.filter(item => item.id !== asset.id)])
      setImage(uploadTarget, { src: asset.src, assetId: demoMode ? null : asset.id, alt: asset.alt })
      setRetry(null); setUploadMessage('图片已上传并选中；保存修改后主站生效。')
    } catch (error) { setUploadError(true); setUploadMessage(error instanceof Error ? error.message : '上传失败') }
    finally { setUploading(false) }
  }
  const save = async () => {
    setBusy(true); setMessage('')
    try {
      if (draft.socialLinks.some(link => !link.label.trim() || !safeSocialUrl(link.href))) throw new Error('社交平台请填写名称和完整 HTTPS 主页网址。')
      const invalid = Object.entries(draft.content?.texts ?? {}).find(([key, value]) => key.startsWith('case.') && /(?:Url|\.url)$/.test(key) && Object.values(value).some(url => url.trim() && !safeExternalUrl(url)))
      if (invalid) throw new Error('案例链接请填写完整 HTTPS 地址，或留空。')
      const saved = await saveSettings(draft); onSave(saved); setDraft(saved); setMessage(copy(language, 'Settings saved. Refresh the public site to view changes.', '设置已保存，打开或刷新主站即可查看。'))
    }
    catch (error) { setMessage(error instanceof Error ? error.message : '保存失败') }
    finally { setBusy(false) }
  }
  const field = (label: string, key: 'siteName' | 'shortBio' | 'contactEmail' | 'heroTitle' | 'heroSubtitle') => <label data-field-key={key} className="block" key={key}><span className="eyebrow">{label}</span><textarea className="mt-2 w-full border rule px-4 py-3" rows={key === 'shortBio' ? 4 : 2} value={draft[key]} onChange={event => setLegacy(key, event.target.value)} /></label>
  const selectedImage: SiteImage = target === 'hero' ? { src: draft.heroImage, assetId: draft.heroAssetId, alt: draft.heroAlt ?? '' } : siteImage(draft, target)
  return <div className="space-y-6">
    {demoMode && <p className="border rule bg-paper2 p-4 text-sm">本地演示模式：修改只保存在此浏览器，不会写入生产数据库。</p>}
    <p className="text-sm text-muted">按页面和区块编辑主站。作品本身在“项目”中管理；下面编辑页面文案与配图。切换页面保留未保存修改，完成后点击“保存修改”。</p>
    <details className="border rule p-4"><summary className="cursor-pointer text-sm">个人内容初稿</summary><p className="my-4 text-sm text-muted">载入已整理的 Starry 双语文案与案例到编辑草稿，可在右侧预览后保存。保留现有照片、配色、联系方式和项目数据；再次载入会覆盖对应文案。</p><button type="button" disabled={busy || uploading} className="border rule px-4 py-3" onClick={() => { const next = applyPersonalDraft(draft); setDraft(next); setMessage('个人内容已载入草稿，请检查各页面后保存修改。') }}>载入 Starry 内容初稿</button></details>
    <nav aria-label="编辑页面" className="settings-page-tabs sticky top-0 z-20 flex gap-2 overflow-x-auto border rule bg-paper p-3">{contentPages.map(item => <button key={item} disabled={uploading} aria-pressed={page === item} className={`min-h-11 shrink-0 px-5 text-sm ${page === item ? 'bg-olive text-white' : 'border rule bg-white'}`} onClick={() => { setPage(item); selectSection(contentSections.find(section => section.page === item)!); sectionTabs.current?.scrollTo?.({ left: 0 }) }}>{item}内容</button>)}</nav>
    <details ref={sharedFields} className="space-y-5 bg-white p-6 shadow-panel">
      <summary className="cursor-pointer text-xl">品牌、联系与共用字段</summary>
      {field('站点名称', 'siteName')}{field('联系邮箱', 'contactEmail')}
      <details><summary className="cursor-pointer">中英文共用文案（兼容入口）</summary><p className="my-4 text-sm text-muted">修改共用字段会同时更新两种语言。分别修改中文和英文，请使用下方页面区块。</p>{field('简介', 'shortBio')}{field('首屏标题（中英文共用）', 'heroTitle')}{field('首屏副标题（中英文共用）', 'heroSubtitle')}</details>
      <ThemeControls settings={draft} onChange={changeTheme} onThemeChange={theme => setDraft(current => ({ ...current, theme }))} extracting={paletteBusy} message={paletteMessage} onExtract={() => takeHeroColor(draft.heroImage)} />
      <button type="button" className="border rule px-4 py-3" onClick={() => selectPreview('socialLinks')}>管理页脚社交平台与主页链接</button>
    </details>
    <div ref={sectionTabs} className="settings-section-tabs sticky z-20 border-b rule bg-paper">
      <SettingsTabs label={`${page}子模块`} items={groups} selected={group.id} disabled={uploading} onSelect={id => selectSection(sections.find(section => sectionGroup(section, draft).id === id)!)} />
      {children.length > 1 && <SettingsTabs label={`${group.label}子模块`} items={children.map(section => ({ id: contentSectionId(section), label: sectionGroup(section, draft).child }))} selected={contentSectionId(activeSection)} disabled={uploading} onSelect={id => selectSection(children.find(section => contentSectionId(section) === id)!)} />}
    </div>
    <div ref={editor} className="settings-workspace">
    {[activeSection].map(section => <section key={contentSectionId(section)} id="settings-section-panel" role="tabpanel" aria-labelledby={`section-tab-${children.length > 1 ? contentSectionId(section) : group.id}`} className="settings-editor-fields min-w-0 space-y-5 bg-white p-5 shadow-panel md:p-6">
      <h2 className="display-title text-3xl">{section.page} / {sectionTitle(section)}</h2>
      {(section.slideId || contentSectionId(section) === 'hero.overview') && <HeroSlideControls settings={draft} slideId={section.slideId} onChange={setDraft} onSelect={id => selectSection(contentSections.find(item => item.slideId === id) ?? { id: `hero.${id}`, page: '首页', title: '新轮播屏', slideId: id, fields: [], images: [`hero.${id}.cover`] })} />}
      {contentSectionId(section) === 'experience.heading' && <button type="button" disabled={experienceItems(draft).length >= 30} className="bg-olive px-5 py-3 text-white disabled:opacity-40" onClick={() => { const next = addExperience(draft); setDraft(next); setActiveSectionId(`experience.${next.content!.experienceItems!.at(-1)!.id}`) }}>添加工作经历</button>}
      {contentSectionId(section).startsWith('experience.') && contentSectionId(section) !== 'experience.heading' && <div className="flex gap-3">{[-1, 1].map(offset => { const items = experienceItems(draft); const index = items.findIndex(item => `experience.${item.id}` === contentSectionId(section)); return <button type="button" key={offset} disabled={index + offset < 0 || index + offset >= items.length} className="border rule px-4 py-2 disabled:opacity-40" onClick={() => { const next = [...items]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; setDraft(current => ({ ...current, content: { ...current.content!, experienceItems: next } })) }}>{offset < 0 ? '前移' : '后移'}</button> })}</div>}
      {section.title === '精选作品'  && <p className="text-sm text-muted">作品内容、封面、精选与排序，请在项目编辑器中修改。</p>}
      {section.title === '地点与时间' && <p className="text-sm text-muted">UTC 时差同时控制页头和联系页的实时钟。页头城市与时区文字在“全站内容 / 导航状态”修改，页脚地点在“页脚内容 / 页脚文字”修改。</p>}
      {section.caseId && <p className="text-sm text-muted">此案例可整体替换文案和素材；固定访问路径为 /cases/{section.caseId}。中英文内容分别编辑，显示开关同时控制中英文页面。外部链接会在新标签页打开。<a className="ml-2 underline" href={`/cases/${section.caseId}`} target="_blank" rel="noreferrer">查看已保存页面 ↗</a></p>}
      {contentSectionId(section) === 'cases.enabled' && <div className="space-y-4 border-y rule py-5">
        <label className="block text-sm">新案例名称<input aria-label="新案例名称" maxLength={80} className="mt-2 w-full border rule p-3" placeholder="例如：城市旅居企划" value={newCaseName} onChange={event => setNewCaseName(event.target.value)} /></label>
        <button type="button" disabled={!newCaseName.trim() || (draft.content?.customCases?.length ?? 0) >= 18} onClick={addCase} className="bg-olive px-5 py-3 text-sm text-white disabled:opacity-50">添加案例</button>
        <p className="text-sm text-muted">自动建立独立案例页、内容和媒体组。新增案例默认隐藏，填好后开启显示并保存；已有案例保留。</p>
        <div className="space-y-2">{getCaseDefinitions(draft).map(item => <button type="button" key={item.id} className="flex w-full justify-between gap-4 border-b rule py-3 text-left text-sm" onClick={() => selectPreview(`case.${item.id}.visible`)}><span>{item.name}</span><span className="text-muted">{contentText(draft, `case.${item.id}.visible`, 'zh') === '1' ? '显示' : '隐藏'} · 编辑</span></button>)}</div>
      </div>}
      {contentSectionId(section) === 'socialLinks' && <SocialLinksEditor links={draft.socialLinks} onChange={socialLinks => setDraft(current => ({ ...current, socialLinks }))} />}
      {section.fields.map(({ key, label }) => key === 'cases.enabled' || key.endsWith('.visible') ? <label key={key} className="flex min-h-11 items-center gap-3 border-t rule pt-4"><input type="checkbox" checked={contentText(draft, key, 'zh') === '1'} onChange={event => { const value = event.target.checked ? '1' : '0'; setText(key, 'zh', value); setText(key, 'en', value) }} />{label}</label> : <fieldset key={key} data-field-key={key} className="min-w-0 border-t rule pt-4"><legend className="px-2 text-sm">{label}</legend><div className="settings-language-fields grid gap-3">{(['zh', 'en'] as const).map(locale => <label key={locale}>{locale === 'zh' ? '中文' : 'English'}<textarea aria-label={`${section.title} · ${label}（${locale === 'zh' ? '中文' : 'English'}）`} rows={key.endsWith('.deliverables') ? 4 : 3} className="mt-2 w-full border rule p-3" value={contentText(draft, key, locale)} onChange={event => setText(key, locale, event.target.value)} /></label>)}</div></fieldset>)}
      {section.videos?.map((slot, index) => <SiteVideoEditor key={slot} slot={slot} index={index} value={draft.content?.videos?.[slot]} assets={assets} disabled={uploading || busy} onBusy={setUploading} onAsset={asset => setAssets(current => [asset, ...current.filter(item => item.id !== asset.id)])} onChange={video => setDraft(current => ({ ...current, content: { ...current.content, texts: current.content?.texts ?? {}, images: current.content?.images ?? {}, videos: { ...current.content?.videos, [slot]: video } } }))} />)}
      {section.images.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{section.images.map(key => <button key={key} disabled={uploading} aria-pressed={target === key} onClick={() => { setTarget(key); setRetry(null); setUploadMessage('') }} className={`border p-3 text-left ${target === key ? 'border-olive' : 'rule'}`}><img src={image(key).src} alt="" className="aspect-video w-full object-cover" /><span className="mt-2 block text-sm">编辑 {imageLabel(key)}</span></button>)}</div>}
      {section.images.includes(target) && <div data-field-key={target} className="space-y-4 border-t rule pt-5">
      <label className="block">编辑图片位置<select value={target} onChange={event => { setTarget(event.target.value); setRetry(null); setUploadMessage('') }} className="mt-2 w-full border rule p-3" disabled={uploading}>{section.images.map(key => <option key={key} value={key}>{imageLabel(key)}</option>)}</select></label>
      <p className="text-sm text-muted">当前修改：{imageLabel(target)}。上传或选择后，点击“保存修改”才会在主站生效。</p>
      <img src={selectedImage.src} alt={selectedImage.alt} className="aspect-video w-full max-w-xl object-cover" />
      <label className="block">图片描述 / Alt<input className="mt-2 w-full border rule p-3" value={selectedImage.alt} onChange={event => setImage(target, { ...selectedImage, alt: event.target.value })} /></label>
      <label className="block">图片地址（使用私有媒体时请选择下方媒体库）<input className="mt-2 w-full border rule p-3" value={selectedImage.src} onChange={event => setImage(target, { src: event.target.value, alt: selectedImage.alt, assetId: null })} /></label>
      <p className="text-sm text-muted">支持 JPG、PNG、WebP，每张最大 {Math.round(maxMediaBytes / 1024 / 1024)} MB。{demoMode ? '本地文件保存在此浏览器，刷新后仍可读取。' : '上传到私有媒体库，保存修改后用于主站展示。'}</p>
      <label className="inline-flex cursor-pointer border rule p-3">上传并替换图片<input disabled={uploading} type="file" accept="image/jpeg,image/png,image/webp" className="ml-3 max-w-64" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = '' }} /></label>
      {uploading && <div role="status">上传进度 {progress}%<progress max="100" value={progress} className="ml-3" /></div>}
      {uploadMessage && <p role={uploadError ? 'alert' : 'status'} className={`text-sm ${uploadError ? 'text-red-600' : 'text-olive'}`}>{uploadMessage}</p>}
      {retry && !uploading && <button onClick={() => void upload(retry)} className="border rule p-3">重试上传</button>}
      <MediaPicker assets={assets} disabled={uploading} selectedSrc={selectedImage.src} onSelect={asset => setImage(target, { src: asset.src, assetId: demoMode ? null : asset.id, alt: asset.alt })} />
      </div>}
    </section>)}
    <aside aria-label="区块预览" className="settings-preview-panel min-w-0 self-start border rule bg-white shadow-panel">
      <div className="space-y-2 border-b rule p-5"><h2 className="text-base font-medium">{page}实际布局预览（尚未保存）</h2><p className="text-sm text-olive">{page} / {sectionTitle(activeSection)}</p><p className="text-xs text-muted">点击预览文字或图片可定位左侧编辑项 · {language === 'zh' ? '中文' : 'English'} · 编辑即时预览</p></div>
      <div className="flex gap-3 border-b rule px-5 py-3" aria-label="预览模式">{(['light', 'dark'] as const).map(mode => <button type="button" key={mode} aria-pressed={previewMode === mode} onClick={() => setPreviewMode(mode)} className={`border rule px-4 py-2 text-sm ${previewMode === mode ? 'bg-olive text-white' : ''}`}>{mode === 'light' ? '日间预览' : '夜间预览'}</button>)}</div>
      <SettingsPreview home={page === '首页'} key={group.id} mode={previewMode} onSelect={selectPreview} settings={draft} width={activeSectionId.startsWith('services.item.') ? 680 : 1120}>{renderPreview(draft, activeSection)}</SettingsPreview>
    </aside>
    </div>
    <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-4 border-t rule bg-paper p-4"><p role="status" className="text-sm text-olive">{message || (paletteBusy ? '正在从头图更新配色…' : '')}</p><button disabled={busy || uploading || paletteBusy} onClick={() => void save()} className="min-h-12 bg-olive px-6 text-xs text-white disabled:opacity-50">{busy ? '保存中…' : copy(language, 'SAVE CHANGES', '保存修改')}</button></div>
  </div>
}
