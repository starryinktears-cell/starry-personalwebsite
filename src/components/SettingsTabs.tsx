import { useRef } from 'react'

export function SettingsTabs({ label, items, selected, onSelect, disabled = false }: { label: string; items: { id: string; label: string }[]; selected: string; onSelect: (id: string) => void; disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  return <div ref={ref} role="tablist" aria-label={label} className="settings-tab-row custom-scrollbar">
    {items.map((item, index) => <button type="button" role="tab" key={item.id} id={`section-tab-${item.id}`} aria-controls="settings-section-panel" aria-selected={selected === item.id} tabIndex={selected === item.id ? 0 : -1} disabled={disabled} onClick={() => onSelect(item.id)} onKeyDown={event => {
      const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
      if (!offset && event.key !== 'Home' && event.key !== 'End') return
      event.preventDefault()
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + offset + items.length) % items.length
      onSelect(items[next].id)
      const button = ref.current?.querySelectorAll<HTMLButtonElement>('button')[next]
      button?.focus({ preventScroll: true }); button?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }}>{item.label}</button>)}
  </div>
}
