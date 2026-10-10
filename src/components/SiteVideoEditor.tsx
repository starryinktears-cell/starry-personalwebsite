import { useState } from 'react'
import type { Asset, SiteImage } from '../lib/types'
import { demoMode, waitForAssetReady } from '../lib/portfolioApi'
import { uploadMedia } from '../lib/uploadMedia'
import { maxMediaBytes } from '../lib/validation'

export function SiteVideoEditor({ slot, index, value, assets, disabled, onChange, onAsset, onBusy }: { slot: string; index: number; value?: SiteImage; assets: Asset[]; disabled: boolean; onChange: (value: SiteImage) => void; onAsset: (asset: Asset) => void; onBusy: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [retry, setRetry] = useState<File | null>(null)
  const select = (asset: Asset) => onChange({ src: asset.src, assetId: demoMode ? null : asset.id, alt: asset.alt })
  const upload = async (file: File) => {
    setBusy(true); onBusy(true); setProgress(0); setMessage(''); setRetry(file)
    try {
      if (!file.type.startsWith('video/')) throw new Error('请选择 MP4 或 MOV 视频。')
      const uploaded = await uploadMedia(file, setProgress)
      let asset = uploaded
      if (uploaded.status === 'processing') {
        setMessage('视频已上传，正在后台转码并生成封面帧…')
        asset = await waitForAssetReady(uploaded.id)
      }
      if (asset.status !== 'ready') throw new Error(asset.error ? `视频处理失败：${asset.error}` : '视频处理失败，请重新上传。')
      onAsset(asset); select(asset); setRetry(null); setMessage('视频已选中，保存修改后生效。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '上传失败') }
    finally { setBusy(false); onBusy(false) }
  }
  return <fieldset className="space-y-4 border-t rule pt-5"><legend>视频 {index + 1} / 上传与替换</legend>
    <p className="text-sm text-muted">没有选择文件时显示占位视频；外部页面链接可填写 B 站等视频页面。上传文件上限 {Math.round(maxMediaBytes / 1024 / 1024)} MB，更大的视频可使用外部页面链接。</p>
    <video key={value?.src} src={value?.src || '/videos/placeholder.mp4'} controls playsInline preload="metadata" className="aspect-video w-full bg-night" aria-label={`视频 ${index + 1} 文件预览`} />
    <label className="block">视频 {index + 1} 描述<input className="mt-2 w-full border rule p-3" value={value?.alt ?? ''} onChange={event => onChange({ src: value?.src ?? '', assetId: value?.assetId, alt: event.target.value })} /></label>
    <label className="block">上传视频 {index + 1}<input type="file" disabled={busy || disabled} accept="video/mp4,video/quicktime" className="mt-2 block max-w-full" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = '' }} /></label>
    <label className="block">视频 {index + 1} 从媒体库选择<select className="mt-2 w-full border rule p-3" disabled={busy || disabled} value="" onChange={event => { const asset = assets.find(item => item.id === event.target.value); if (asset) select(asset) }}><option value="">选择可用视频</option>{assets.filter(asset => asset.kind === 'video' && asset.status === 'ready').map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
    <button type="button" disabled={busy || disabled} className="border rule px-4 py-2" onClick={() => onChange({ src: '', alt: '' })}>视频 {index + 1} 恢复占位</button>
    {busy && <progress aria-label={`${slot} 上传进度`} max="100" value={progress} />}
    {message && <p role="status" className="text-sm">{message}</p>}
    {retry && !busy && <button type="button" disabled={disabled} className="border rule px-4 py-2" onClick={() => void upload(retry)}>重试上传视频 {index + 1}</button>}
  </fieldset>
}
