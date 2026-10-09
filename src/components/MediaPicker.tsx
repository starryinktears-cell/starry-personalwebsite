import { useState } from 'react'
import type { Asset } from '../lib/types'

export function MediaPicker({ assets, selectedSrc, disabled, onSelect }: { assets: Asset[]; selectedSrc?: string; disabled?: boolean; onSelect: (asset: Asset) => void }) {
  const [query, setQuery] = useState('')
  const images = assets.filter(asset => asset.kind === 'image' && asset.status === 'ready' && `${asset.name} ${asset.alt}`.toLowerCase().includes(query.toLowerCase()))
  return <section aria-label="从我的媒体库选择" className="space-y-3 border-t rule pt-5">
    <h3>从我的媒体库选择</h3>
    <p className="text-sm text-muted">点击缩略图选择；保存后将公开展示。上传的图片也会出现在这里。</p>
    <input type="search" aria-label="搜索媒体图片" placeholder="搜索名称或图片描述" className="w-full border rule p-3" value={query} onChange={event => setQuery(event.target.value)} />
    <div className="grid max-h-[440px] grid-cols-2 gap-3 overflow-y-auto p-1" data-lenis-prevent>
      {images.map(asset => <button key={asset.id} type="button" disabled={disabled} aria-label={`选择图片：${asset.name}`} aria-pressed={selectedSrc === asset.src} onClick={() => onSelect(asset)} className={`min-w-0 border p-2 text-left ${selectedSrc === asset.src ? 'border-olive ring-2 ring-olive' : 'rule'}`}>
        <img src={asset.src} alt={asset.alt || asset.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        <span className="mt-2 block truncate text-xs" title={asset.name}>{asset.name}</span>
        {selectedSrc === asset.src && <span className="text-xs text-olive">已选择</span>}
      </button>)}
    </div>
    {!images.length && <p className="text-sm text-muted">{query ? '没有匹配的图片。' : '还没有可用图片，请先上传。'}</p>}
  </section>
}
