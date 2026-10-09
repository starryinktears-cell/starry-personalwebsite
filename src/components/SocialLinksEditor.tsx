import type { SiteSettings } from '../lib/types'

export function SocialLinksEditor({ links, onChange }: { links: SiteSettings['socialLinks']; onChange: (links: SiteSettings['socialLinks']) => void }) {
  return <div data-field-key="socialLinks" className="space-y-5">
    <p className="text-sm text-muted">填写显示名称和主页网址。保存后同步到页脚、关于页和联系页；链接会在新标签页打开。</p>
    {links.map((link, index) => <fieldset key={index} className="space-y-3 border-t rule pt-4"><legend className="pr-3 text-sm">{link.label || '新平台'}</legend>
      <label className="block text-sm">平台 / 账号名称<input aria-label={`社交名称 ${index + 1}`} maxLength={40} className="mt-2 w-full border rule p-3" value={link.label} onChange={event => onChange(links.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} /></label>
      <label className="block text-sm">主页网址<input aria-label={`社交地址 ${index + 1}`} type="url" placeholder="https://" className="mt-2 w-full border rule p-3" value={link.href} onChange={event => onChange(links.map((item, i) => i === index ? { ...item, href: event.target.value } : item))} /></label>
      <button type="button" onClick={() => onChange(links.filter((_, i) => i !== index))} className="text-sm underline underline-offset-4">移除链接 {index + 1}</button>
    </fieldset>)}
    <button type="button" disabled={links.length >= 10} onClick={() => onChange([...links, { label: '', href: '' }])} className="border rule px-4 py-3 disabled:opacity-50">添加社交平台</button>
  </div>
}
