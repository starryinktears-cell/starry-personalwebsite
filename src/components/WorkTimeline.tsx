import type { SiteSettings } from '../lib/types'
import type { Language } from '../lib/i18n'
import { contentText } from '../lib/siteContent'
import { experienceItems } from '../data/workExperience'
import { EditableContent } from './EditableContent'

export function WorkTimeline({ settings, language, previewId }: { settings: SiteSettings; language: Language; previewId?: string }) {
  const items = experienceItems(settings).filter(item => previewId ? item.id === previewId : contentText(settings, `experience.${item.id}.visible`, 'zh') !== '0')
  return <section aria-label={contentText(settings, 'experience.heading', language)} className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-28">
    <h2 className="display-title mb-14 text-5xl md:text-7xl"><EditableContent field="experience.heading">{contentText(settings, 'experience.heading', language)}</EditableContent></h2>
    <ol className="ml-2 border-l rule">{items.map(item => <li key={item.id} className="relative pb-14 pl-8 last:pb-0 md:grid md:grid-cols-[220px_1fr] md:gap-12 md:pl-12">
      <span aria-hidden="true" className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full bg-olive ring-4 ring-paper" />
      <p className="mono pt-1 text-sm text-muted"><EditableContent field={`experience.${item.id}.date`}>{contentText(settings, `experience.${item.id}.date`, language)}</EditableContent></p>
      <div className="mt-4 max-w-3xl md:mt-0"><h3 className="display-title text-3xl md:text-4xl"><EditableContent field={`experience.${item.id}.company`}>{contentText(settings, `experience.${item.id}.company`, language)}</EditableContent></h3><p className="mt-3 text-sm text-olive"><EditableContent field={`experience.${item.id}.role`}>{contentText(settings, `experience.${item.id}.role`, language)}</EditableContent></p><p className="mt-5 text-base leading-loose text-muted"><EditableContent field={`experience.${item.id}.description`}>{contentText(settings, `experience.${item.id}.description`, language)}</EditableContent></p></div>
    </li>)}</ol>
  </section>
}
