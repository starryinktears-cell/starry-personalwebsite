import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Asset, SiteImage, SiteSettings } from '../lib/types'
import { saveSettings, loadMediaLibrary, demoMode } from '../lib/portfolioApi'
import { uploadMedia } from '../lib/uploadMedia'
import { contentPages, contentSections, contentText, imageSlots, siteImage } from '../lib/siteContent'
import { contentSectionId, type ContentPage, type ContentSection } from '../lib/siteContentCatalog'
import { SettingsPreview } from './SettingsPreview'
import { ThemeControls } from './ThemeControls'
import { extractHeroPalette } from '../lib/theme'
import { copy, type Language } from '../lib/i18n'
import { maxMediaBytes } from '../lib/validation'

export function SiteSettingsEditor({ settings, onSave, language, renderPreview }: {
  settings: SiteSettings; onSave: (settings: SiteSettings) => void; language: Language
  renderPreview: (draft: SiteSettings, section: ContentSection) => ReactNode
}) {
  const [draft, setDraft] = useState(settings)
  const [page, setPage] = useState<ContentPage>('首页')
  const [activeSectionId, setActiveSectionId] = useState('home.heroTitle')
  const editor = useRef<HTMLDivElement>(null)
  const sectionTabs = useRef<HTMLDivElement>(null)
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
  useEffect(() => setDraft(settings), [settings])
  useEffect(() => { loadMediaLibrary().then(setAssets).catch(error => setMessage(String(error))) }, [])
  useEffect(() => {
    if (!paletteSource) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      void extractHeroPalette(paletteSource.src).then(palette => {
        if (cancelled) return
        setDraft(current => current.heroImage === paletteSource.src ? { ...current, accent: palette.accent, theme: { ...current.theme, footerColor: palette.footerColor, followHero: true } } : current)
        setPaletteMessage('头图配色已更新到预览，保存后全站生效。')
      }).catch(error => { if (!cancelled) setPaletteMessage(error instanceof Error ? error.message : '取色失败，已保留原配色。') })
        .finally(() => { if (!cancelled) setPaletteBusy(false) })
    }, 350)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [paletteSource])
  const takeHeroColor = (src: string) => { setPaletteBusy(true); setPaletteMessage(''); setPaletteSource({ src }) }
  const changeTheme = (accent: string, footerColor: string, followHero: boolean) => {
    setPaletteSource(null); setPaletteBusy(false); setPaletteMessage('')
    setDraft(current => ({ ...current, accent, theme: { ...current.theme, footerColor, followHero } }))
  }
  const image = (key: string): SiteImage => key === 'hero' ? { src: draft.heroImage, assetId: draft.heroAssetId, alt: draft.heroAlt ?? '' } : siteImage(draft, key)
  const imageLabel = (key: string) => key === 'hero' ? '首页 / 首屏背景' : imageSlots[key].label
  const sections = contentSections.filter(section => section.page === page)
  const activeSection = sections.find(section => contentSectionId(section) === activeSectionId) ?? sections[0]
  const selectSection = (section: ContentSection, scroll = true) => {
    setActiveSectionId(contentSectionId(section)); setTarget(section.images[0] ?? 'hero')
    setRetry(null); setUploadMessage('')
    if (scroll) editor.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' })
  }
  const setText = (key: string, locale: Language, value: string) => setDraft(current => ({ ...current, content: { images: current.content?.images ?? {}, texts: { ...current.content?.texts, [key]: { en: contentText(current, key, 'en'), zh: contentText(current, key, 'zh'), [locale]: value } } } }))
  const setLegacy = (key: 'siteName' | 'shortBio' | 'contactEmail' | 'heroTitle' | 'heroSubtitle', value: string) => setDraft(current => {
    const contentKey = key === 'heroTitle' ? 'home.heroTitle' : key === 'heroSubtitle' ? 'home.heroSubtitle' : key === 'shortBio' ? 'AboutPage.92bac68a' : null
    return { ...current, [key]: value, ...(contentKey ? { content: { images: current.content?.images ?? {}, texts: { ...current.content?.texts, [contentKey]: { zh: value, en: value } } } } : {}) }
  })
  const setImage = (key: string, image: SiteImage) => {
    if (key === 'hero') {
      setDraft(current => ({ ...current, heroImage: image.src, heroAssetId: image.assetId ?? null, heroAlt: image.alt }))
      if (image.src !== draft.heroImage && (draft.theme?.followHero ?? true)) takeHeroColor(image.src)
    }
    else setDraft(current => ({ ...current, content: { texts: current.content?.texts ?? {}, images: { ...current.content?.images, [key]: image } } }))
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
    try { const saved = await saveSettings(draft); onSave(saved); setDraft(saved); setMessage(copy(language, 'Settings saved. Refresh the public site to view changes.', '设置已保存，打开或刷新主站即可查看。')) }
    catch (error) { setMessage(error instanceof Error ? error.message : '保存失败') }
    finally { setBusy(false) }
  }
  const field = (label: string, key: 'siteName' | 'shortBio' | 'contactEmail' | 'heroTitle' | 'heroSubtitle') => <label className="block" key={key}><span className="eyebrow">{label}</span><textarea className="mt-2 w-full border rule px-4 py-3" rows={key === 'shortBio' ? 4 : 2} value={draft[key]} onChange={event => setLegacy(key, event.target.value)} /></label>
  const selectedImage: SiteImage = target === 'hero' ? { src: draft.heroImage, assetId: draft.heroAssetId, alt: draft.heroAlt ?? '' } : siteImage(draft, target)
  return <div className="space-y-6">
    {demoMode && <p className="border rule bg-paper2 p-4 text-sm">本地演示模式：修改只保存在此浏览器，不会写入生产数据库。</p>}
    <p className="text-sm text-muted">按页面和区块编辑主站。作品本身在“项目”中管理；下面编辑页面文案与配图。切换页面保留未保存修改，完成后点击“保存修改”。</p>
    <nav aria-label="编辑页面" className="settings-page-tabs sticky top-0 z-20 flex gap-2 overflow-x-auto border rule bg-paper p-3">{contentPages.map(item => <button key={item} disabled={uploading} aria-pressed={page === item} className={`min-h-11 shrink-0 px-5 text-sm ${page === item ? 'bg-olive text-white' : 'border rule bg-white'}`} onClick={() => { setPage(item); selectSection(contentSections.find(section => section.page === item)!); sectionTabs.current?.scrollTo?.({ left: 0 }) }}>{item}内容</button>)}</nav>
    <details className="space-y-5 bg-white p-6 shadow-panel">
      <summary className="cursor-pointer text-xl">品牌、联系与共用字段</summary>
      {field('站点名称', 'siteName')}{field('联系邮箱', 'contactEmail')}
      <details><summary className="cursor-pointer">中英文共用文案（兼容入口）</summary><p className="my-4 text-sm text-muted">修改共用字段会同时更新两种语言。分别修改中文和英文，请使用下方页面区块。</p>{field('简介', 'shortBio')}{field('首屏标题（中英文共用）', 'heroTitle')}{field('首屏副标题（中英文共用）', 'heroSubtitle')}</details>
      <ThemeControls settings={draft} onChange={changeTheme} extracting={paletteBusy} message={paletteMessage} onExtract={() => takeHeroColor(draft.heroImage)} />
      <h3 className="text-lg">社交链接</h3>
      {draft.socialLinks.map((link, index) => <div key={index} className="flex flex-wrap gap-2"><input aria-label={`社交名称 ${index + 1}`} className="border rule p-3" value={link.label} onChange={event => setDraft({ ...draft, socialLinks: draft.socialLinks.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} /><input aria-label={`社交地址 ${index + 1}`} className="min-w-0 flex-1 border rule p-3" value={link.href} onChange={event => setDraft({ ...draft, socialLinks: draft.socialLinks.map((item, i) => i === index ? { ...item, href: event.target.value } : item) })} /><button onClick={() => setDraft({ ...draft, socialLinks: draft.socialLinks.filter((_, i) => i !== index) })} className="p-3">移除链接 {index + 1}</button></div>)}
      <button disabled={draft.socialLinks.length >= 10} onClick={() => setDraft({ ...draft, socialLinks: [...draft.socialLinks, { label: '', href: 'https://' }] })} className="border rule px-4 py-3">添加链接</button>
    </details>
    <div ref={sectionTabs} role="tablist" aria-label={`${page}子模块`} className="settings-section-tabs custom-scrollbar sticky z-20 flex gap-2 overflow-x-auto border-b rule bg-paper py-3">
      {sections.map((section, index) => <button type="button" role="tab" key={contentSectionId(section)} id={`section-tab-${contentSectionId(section)}`} aria-controls="settings-section-panel" aria-selected={section === activeSection} tabIndex={section === activeSection ? 0 : -1} disabled={uploading} onClick={() => selectSection(section)} onKeyDown={event => {
        const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
        if (!offset && event.key !== 'Home' && event.key !== 'End') return
        event.preventDefault()
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : (index + offset + sections.length) % sections.length
        selectSection(sections[next])
        const button = sectionTabs.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]
        button?.focus({ preventScroll: true }); button?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
      }} className={`min-h-11 shrink-0 rounded-md px-4 text-sm transition-colors ${section === activeSection ? 'bg-olive/10 font-medium text-olive' : 'text-muted hover:bg-white'}`}>{section.title}</button>)}
    </div>
    <div ref={editor} className="settings-workspace">
    {[activeSection].map(section => <section key={contentSectionId(section)} id="settings-section-panel" role="tabpanel" aria-labelledby={`section-tab-${contentSectionId(section)}`} className="settings-editor-fields min-w-0 space-y-5 bg-white p-5 shadow-panel md:p-6">
      <h2 className="display-title text-3xl">{section.page} / {section.title}</h2>
      {section.title === '精选作品' && <p className="text-sm text-muted">作品内容、封面、精选与排序，请在项目编辑器中修改。</p>}
      {section.title === '地点与时间' && <p className="text-sm text-muted">UTC 时差同时控制页头和联系页的实时钟。页头城市与时区文字在“全站内容 / 导航状态”修改，页脚地点在“页脚内容 / 页脚文字”修改。</p>}
      {section.fields.map(({ key, label }) => <fieldset key={key} className="min-w-0 border-t rule pt-4"><legend className="px-2 text-sm">{label}</legend><div className="settings-language-fields grid gap-3">{(['zh', 'en'] as const).map(locale => <label key={locale}>{locale === 'zh' ? '中文' : 'English'}<textarea aria-label={`${section.title} · ${label}（${locale === 'zh' ? '中文' : 'English'}）`} rows={key.endsWith('.deliverables') ? 4 : 3} className="mt-2 w-full border rule p-3" value={contentText(draft, key, locale)} onChange={event => setText(key, locale, event.target.value)} /></label>)}</div></fieldset>)}
      {section.images.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{section.images.map(key => <button key={key} disabled={uploading} aria-pressed={target === key} onClick={() => { setTarget(key); setRetry(null); setUploadMessage('') }} className={`border p-3 text-left ${target === key ? 'border-olive' : 'rule'}`}><img src={image(key).src} alt="" className="aspect-video w-full object-cover" /><span className="mt-2 block text-sm">编辑 {imageLabel(key)}</span></button>)}</div>}
      {section.images.includes(target) && <div className="space-y-4 border-t rule pt-5">
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
      <label className="block">从我的媒体库选择<select aria-label="从我的媒体库选择" value="" className="mt-2 w-full border rule p-3" onChange={event => { const asset = assets.find(item => item.id === event.target.value); if (asset) setImage(target, { src: asset.src, assetId: demoMode ? null : asset.id, alt: asset.alt }) }}><option value="">选择可用图片（保存后将公开展示）</option>{assets.filter(asset => asset.kind === 'image' && asset.status === 'ready').map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
      </div>}
    </section>)}
    <aside aria-label="区块预览" className="settings-preview-panel min-w-0 self-start border rule bg-white shadow-panel">
      <div className="space-y-2 border-b rule p-5"><h2 className="text-base font-medium">{page}实际布局预览（尚未保存）</h2><p className="text-sm text-olive">{page} / {activeSection.title}</p><p className="text-xs text-muted">跟随当前子模块 · {language === 'zh' ? '中文' : 'English'} · 编辑即时预览</p></div>
      <SettingsPreview key={activeSectionId} settings={draft} width={activeSectionId.startsWith('services.item.') ? 680 : 1120}>{renderPreview(draft, activeSection)}</SettingsPreview>
    </aside>
    </div>
    <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-4 border-t rule bg-paper p-4"><p role="status" className="text-sm text-olive">{message || (paletteBusy ? '正在从头图更新配色…' : '')}</p><button disabled={busy || uploading || paletteBusy} onClick={() => void save()} className="min-h-12 bg-olive px-6 text-xs text-white disabled:opacity-50">{busy ? '保存中…' : copy(language, 'SAVE CHANGES', '保存修改')}</button></div>
  </div>
}
