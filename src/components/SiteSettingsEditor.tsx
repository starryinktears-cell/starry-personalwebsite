import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Asset, SiteImage, SiteSettings } from '../lib/types'
import { saveSettings, loadMediaLibrary, demoMode } from '../lib/portfolioApi'
import { uploadMedia } from '../lib/uploadMedia'
import { editableTexts, imageSlots, siteImage } from '../lib/siteContent'
import { copy, type Language } from '../lib/i18n'

export function SiteSettingsEditor({ settings, onSave, language, renderPreview }: {
  settings: SiteSettings; onSave: (settings: SiteSettings) => void; language: Language
  renderPreview: (draft: SiteSettings) => ReactNode
}) {
  const [draft, setDraft] = useState(settings)
  const [assets, setAssets] = useState<Asset[]>([])
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('hero')
  const [retry, setRetry] = useState<File | null>(null)
  useEffect(() => setDraft(settings), [settings])
  useEffect(() => { loadMediaLibrary().then(setAssets).catch(error => setMessage(String(error))) }, [])
  const setImage = (key: string, image: SiteImage) => {
    if (key === 'hero') setDraft(current => ({ ...current, heroImage: image.src, heroAssetId: image.assetId ?? null, heroAlt: image.alt }))
    else setDraft(current => ({ ...current, content: { texts: current.content?.texts ?? {}, images: { ...current.content?.images, [key]: image } } }))
  }
  const upload = async (file: File) => {
    setUploading(true); setProgress(0); setMessage(''); setRetry(file)
    try {
      if (!file.type.startsWith('image/')) throw new Error('请选择 JPG、PNG 或 WebP 图片。')
      const asset = await uploadMedia(file, setProgress)
      setAssets(current => [asset, ...current.filter(item => item.id !== asset.id)])
      setImage(target, { src: asset.src, assetId: demoMode ? null : asset.id, alt: asset.alt })
      setRetry(null); setMessage('图片已上传并选中；保存修改后主站生效。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '上传失败') }
    finally { setUploading(false) }
  }
  const save = async () => {
    setBusy(true); setMessage('')
    try { const saved = await saveSettings(draft); onSave(saved); setDraft(saved); setMessage(copy(language, 'Settings saved. Refresh the public site to view changes.', '设置已保存，打开或刷新主站即可查看。')) }
    catch (error) { setMessage(error instanceof Error ? error.message : '保存失败') }
    finally { setBusy(false) }
  }
  const field = (label: string, key: 'siteName' | 'shortBio' | 'contactEmail' | 'heroTitle' | 'heroSubtitle') => <label className="block" key={key}><span className="eyebrow">{label}</span><textarea className="mt-2 w-full border rule px-4 py-3" rows={key === 'shortBio' ? 4 : 2} value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} /></label>
  const selectedImage: SiteImage = target === 'hero' ? { src: draft.heroImage, assetId: draft.heroAssetId, alt: draft.heroAlt ?? '' } : siteImage(draft, target)
  return <div className="space-y-6">
    {demoMode && <p className="border rule bg-paper2 p-4 text-sm">本地演示模式：修改只保存在此浏览器，不会写入生产数据库。</p>}
    <section className="space-y-5 bg-white p-6 shadow-panel">
      <h2 className="display-title text-3xl">{copy(language, 'Brand and hero', '品牌与首屏')}</h2>
      <p className="text-sm text-muted">站点名称对应导航与页脚；简介对应关于页；首页精选作品由项目的发布、精选与展示顺序控制。</p>
      <p className="text-sm text-muted">“首页文案”可分别设置中英文首屏标题；填写后会优先使用对应语言的文案。</p>
      {field('站点名称', 'siteName')}{field('简介', 'shortBio')}{field('联系邮箱', 'contactEmail')}{field('首屏标题（中英文共用）', 'heroTitle')}{field('首屏副标题（中英文共用）', 'heroSubtitle')}
      <label className="block"><span className="eyebrow">主色</span><input type="color" className="mt-2 block h-12 w-20" value={draft.accent} onChange={event => setDraft({ ...draft, accent: event.target.value })} /></label>
      <h3 className="text-lg">社交链接</h3>
      {draft.socialLinks.map((link, index) => <div key={index} className="flex flex-wrap gap-2"><input aria-label={`社交名称 ${index + 1}`} className="border rule p-3" value={link.label} onChange={event => setDraft({ ...draft, socialLinks: draft.socialLinks.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} /><input aria-label={`社交地址 ${index + 1}`} className="min-w-0 flex-1 border rule p-3" value={link.href} onChange={event => setDraft({ ...draft, socialLinks: draft.socialLinks.map((item, i) => i === index ? { ...item, href: event.target.value } : item) })} /><button onClick={() => setDraft({ ...draft, socialLinks: draft.socialLinks.filter((_, i) => i !== index) })} className="p-3">移除链接 {index + 1}</button></div>)}
      <button disabled={draft.socialLinks.length >= 10} onClick={() => setDraft({ ...draft, socialLinks: [...draft.socialLinks, { label: '', href: 'https://' }] })} className="border rule px-4 py-3">添加链接</button>
    </section>
    <section className="space-y-4 bg-white p-6 shadow-panel">
      <h2 className="display-title text-3xl">页面图片</h2>
      <label className="block">编辑图片位置<select value={target} onChange={event => { setTarget(event.target.value); setRetry(null) }} className="ml-3 border rule p-3" disabled={uploading}><option value="hero">首页 / 首屏背景</option>{Object.entries(imageSlots).map(([key, slot]) => <option key={key} value={key}>{slot.label}</option>)}</select></label>
      <img src={selectedImage.src} alt={selectedImage.alt} className="aspect-video w-full max-w-xl object-cover" />
      <label className="block">图片描述 / Alt<input className="mt-2 w-full border rule p-3" value={selectedImage.alt} onChange={event => setImage(target, { ...selectedImage, alt: event.target.value })} /></label>
      <label className="block">图片地址（使用私有媒体时请选择下方媒体库）<input className="mt-2 w-full border rule p-3" value={selectedImage.src} onChange={event => setImage(target, { src: event.target.value, alt: selectedImage.alt, assetId: null })} /></label>
      <label className="inline-flex cursor-pointer border rule p-3">上传并替换图片<input disabled={uploading} type="file" accept="image/jpeg,image/png,image/webp" className="ml-3 max-w-64" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = '' }} /></label>
      {uploading && <div role="status">上传进度 {progress}%<progress max="100" value={progress} className="ml-3" /></div>}
      {retry && !uploading && <button onClick={() => void upload(retry)} className="border rule p-3">重试上传</button>}
      <label className="block">从我的媒体库选择<select aria-label="从我的媒体库选择" value="" className="mt-2 w-full border rule p-3" onChange={event => { const asset = assets.find(item => item.id === event.target.value); if (asset) setImage(target, { src: asset.src, assetId: demoMode ? null : asset.id, alt: asset.alt }) }}><option value="">选择可用图片（保存后将公开展示）</option>{assets.filter(asset => asset.kind === 'image' && asset.status === 'ready').map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
    </section>
    {['全站', '页脚', '首页', '关于', '服务'].map(group => <details key={group} className="bg-white p-6 shadow-panel"><summary className="cursor-pointer text-xl">{group}文案 / 中文与英文</summary><div className="mt-6 space-y-6">{Object.entries(editableTexts).filter(([, value]) => value.group === group).map(([key, fallback]) => <fieldset key={key} className="border-t rule pt-4"><legend className="px-2 text-sm text-muted">{fallback.zh.slice(0, 40)}</legend><div className="grid gap-3 md:grid-cols-2">{(['zh', 'en'] as const).map(locale => <label key={locale}>{locale === 'zh' ? '中文' : 'English'}<textarea aria-label={`${key} ${locale}`} rows={3} className="mt-2 w-full border rule p-3" value={draft.content?.texts[key]?.[locale] ?? fallback[locale]} onChange={event => setDraft(current => ({ ...current, content: { images: current.content?.images ?? {}, texts: { ...current.content?.texts, [key]: { ...fallback, ...current.content?.texts[key], [locale]: event.target.value } } } }))} /></label>)}</div></fieldset>)}</div></details>)}
    <details className="bg-white p-6 shadow-panel"><summary className="cursor-pointer text-xl">首页实际布局预览（尚未保存）</summary><div className="mt-4 max-h-[700px] overflow-auto border rule">{renderPreview(draft)}</div></details>
    <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-4 border-t rule bg-paper p-4"><p role="status" className="text-sm text-olive">{message}</p><button disabled={busy || uploading} onClick={() => void save()} className="min-h-12 bg-olive px-6 text-xs text-white disabled:opacity-50">{busy ? '保存中…' : copy(language, 'SAVE CHANGES', '保存修改')}</button></div>
  </div>
}
