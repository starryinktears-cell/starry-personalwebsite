import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { SiteSettings } from '../lib/types'
import type { Language } from '../lib/i18n'
import { contentText } from '../lib/siteContent'
import { EditableContent } from './EditableContent'
import { ColorModeToggle } from './ColorMode'
import { FooterWordmark } from './FooterWordmark'

export function SiteFooter({ settings, language }: { settings: SiteSettings; language: Language }) {
  const [copied, setCopied] = useState(false)
  const copyEmail = async () => { try { await navigator.clipboard.writeText(settings.contactEmail); setCopied(true); window.setTimeout(() => setCopied(false), 1500) } catch { /* clipboard is optional */ } }
  const editable = (key: string) => <EditableContent field={key}>{contentText(settings, key, language)}</EditableContent>
  return <footer className="site-footer relative z-10 mt-24 bg-footer text-footerInk" data-motion={settings.theme?.ambientMotion !== false}>
    <div className="footer-aurora" aria-hidden="true" />
    <div className="footer-marquee relative overflow-hidden border-y border-footerInk/15 py-4">
      <div className="marquee-track flex gap-10 whitespace-nowrap mono text-[11px] tracking-[.26em] text-footerInk/70">{Array.from({ length: 4 }).map((_, index) => <span key={index} aria-hidden={index > 0 || undefined}>{editable('site.marquee')}</span>)}</div>
    </div>
    <div className="relative mx-auto max-w-[1600px] px-6 pb-10 pt-16 md:px-10 md:pt-24">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <button data-edit-key="Footer.ab353dfd" onClick={copyEmail} className="display-title text-left text-6xl leading-none transition hover:italic md:text-8xl lg:text-9xl">{copied ? 'COPIED ✓' : contentText(settings, 'Footer.ab353dfd', language)}</button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })} className="eyebrow min-h-11 shrink-0 self-start border-b border-footerInk/40 pb-2 text-footerInk">↑ {editable('Footer.48f0c1a7')}</button>
      </div>
      <div className="mt-16 grid gap-8 border-t border-footerInk/20 pt-6 text-footerInk/70 md:grid-cols-3">
        <div><span className="eyebrow text-footerInk/70">{editable('Footer.e7ef3aca')}</span><p className="mono mt-3 text-sm">{editable('site.location')}</p></div>
        <div><span className="eyebrow text-footerInk/70">{editable('Footer.0137b9ad')}</span><div data-edit-key="socialLinks" className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-sm">{settings.socialLinks.map(s => <a key={s.label} data-edit-key="socialLinks" href={s.href} target="_blank" rel="noopener noreferrer" className="under-line">{s.label} ↗</a>)}</div></div>
        <div className="md:text-right"><span data-edit-key="siteName" className="eyebrow text-footerInk/70">© {new Date().getFullYear()} {settings.siteName}</span><p className="mt-3 text-sm">{editable('Footer.fc8e4190')} · <Link to="/privacy" className="under-line">{editable('Footer.2f158034')}</Link></p></div>
      </div>
      <div className="mt-8 flex justify-end"><ColorModeToggle language={language} label /></div>
    </div>
    <FooterWordmark text={contentText(settings, 'footer.wordmark', language)} />
  </footer>
}
