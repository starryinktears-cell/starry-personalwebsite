import { deepColor, morandiPalettes, originalAccent, originalFooter } from '../lib/theme'
import type { SiteSettings } from '../lib/types'

export function ThemeControls({ settings, onChange, extracting, message, onExtract }: { settings: SiteSettings; onChange: (accent: string, footerColor: string, followHero: boolean) => void; extracting: boolean; message: string; onExtract: () => void }) {
  const footer = settings.theme?.footerColor ?? deepColor(settings.accent)
  const followHero = settings.theme?.followHero ?? true
  return <section aria-label="网站配色" className="space-y-4 border-y rule py-5">
    <h3 className="text-lg">网站配色</h3>
    <p className="text-sm text-muted">主色用于按钮、标签、强调文字与边框，后台左栏和深色区域使用同色系深色；页脚可单独选色。保存后全站生效。</p>
    <div className="flex flex-wrap gap-2" aria-label="莫兰迪配色">{morandiPalettes.map(palette => <button type="button" key={palette.name} aria-pressed={settings.accent === palette.accent} onClick={() => onChange(palette.accent, deepColor(palette.accent), false)} className="flex min-h-11 items-center gap-2 rounded border rule px-3 text-sm"><span className="h-5 w-5 rounded-full" style={{ backgroundColor: palette.accent }} />{palette.name}</button>)}</div>
    <div className="flex flex-wrap gap-8"><label>主色<input aria-label="主色" type="color" className="mt-2 block h-12 w-20" value={settings.accent} onInput={event => onChange(event.currentTarget.value, deepColor(event.currentTarget.value), false)} onChange={event => onChange(event.target.value, deepColor(event.target.value), false)} /><span className="mono text-xs">{settings.accent}</span></label><label>页脚背景色<input aria-label="页脚背景色" type="color" className="mt-2 block h-12 w-20" value={footer} onInput={event => onChange(settings.accent, event.currentTarget.value, false)} onChange={event => onChange(settings.accent, event.target.value, false)} /><span className="mono text-xs">{footer}</span></label></div>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={followHero} onChange={event => onChange(settings.accent, footer, event.target.checked)} />更换首页头图时，自动更新主色与页脚配色</label>
    <p className="text-xs text-muted">取色在浏览器内完成；选择预设或自定义颜色会关闭自动联动，可随时重新开启。</p>
    <div className="flex flex-wrap gap-3"><button type="button" disabled={extracting} onClick={onExtract} className="min-h-11 border rule px-4 text-sm disabled:opacity-50">{extracting ? '正在读取头图颜色…' : '从当前头图取色'}</button><button type="button" onClick={() => onChange(originalAccent, originalFooter, false)} className="min-h-11 border rule px-4 text-sm">重置为原始墨绿</button></div>
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>
}
