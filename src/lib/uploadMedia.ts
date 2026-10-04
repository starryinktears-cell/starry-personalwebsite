import { Upload } from 'tus-js-client'
import type { Asset } from './types'
import { apiRequest, demoMode, normalizeAsset } from './portfolioApi'
import { supabase, supabaseUrl, getSupabaseSessionToken } from './supabase'
import { isAllowedMedia } from './validation'

export async function uploadMedia(file: File, onProgress: (percent: number) => void): Promise<Asset> {
  if (!isAllowedMedia(file)) throw new Error('文件类型或大小不符合要求。')
  const alt = file.name.replace(/\.[^.]+$/, '')
  if (demoMode) {
    // Persist small demo images across page refreshes; blobs are document-scoped.
    if (file.size > 2 * 1024 * 1024) throw new Error('本地演示仅保存 2 MB 以下的媒体；大文件需要配置真实 Supabase。')
    const src = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) })
    onProgress(100)
    const asset = normalizeAsset({ id: crypto.randomUUID(), kind: file.type.startsWith('video/') ? 'video' : 'image', name: file.name, src, alt, mime_type: file.type, byte_size: file.size, status: 'ready' })
    const stored = JSON.parse(localStorage.getItem('studio-demo-assets') ?? '[]') as Asset[]
    localStorage.setItem('studio-demo-assets', JSON.stringify([asset, ...stored]))
    return asset
  }
  const accessToken = await getSupabaseSessionToken()
  if (!supabase || !supabaseUrl || !accessToken) throw new Error('登录会话已失效，请重新登录。')
  const { data: sessionData } = await supabase.auth.getSession()
  type UploadTask = { assetId: string; taskId: string; path: string; bucket: string }
  const taskKey = `studio-upload-task-${sessionData.session?.user.id}-${file.name}-${file.size}-${file.lastModified}`
  let cached: UploadTask | null = null
  try { cached = JSON.parse(localStorage.getItem(taskKey) ?? 'null') as UploadTask | null } catch { /* unavailable storage only disables cross-reload resumption */ }
  const signature = cached ?? await apiRequest<UploadTask>('/api/upload/sign', { method: 'POST', body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }) })
  try { localStorage.setItem(taskKey, JSON.stringify({ assetId: signature.assetId, taskId: signature.taskId, path: signature.path, bucket: signature.bucket })) } catch { /* Tus still retries within this session */ }
  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `${supabaseUrl}/storage/v1/upload/resumable`, retryDelays: [0, 3000, 5000, 10000, 20000], chunkSize: 6 * 1024 * 1024,
      uploadDataDuringCreation: true, removeFingerprintOnSuccess: true,
      // Each signed task has a unique object path. Never resume a different task's object.
      fingerprint: async () => `portfolio-${signature.path}-${file.size}-${file.lastModified}`,
      headers: { authorization: `Bearer ${accessToken}` }, metadata: { bucketName: signature.bucket, objectName: signature.path, contentType: file.type, cacheControl: '3600' },
      onError: reject, onProgress: (uploaded, total) => onProgress(Math.round(uploaded / total * 100)), onSuccess: () => resolve(),
    })
    upload.findPreviousUploads().then(previous => { if (previous.length) upload.resumeFromPreviousUpload(previous[0]); upload.start() }).catch(reject)
  })
  const completed = await apiRequest<{ asset: unknown }>('/api/upload/complete', { method: 'POST', body: JSON.stringify({ taskId: signature.taskId, assetId: signature.assetId, status: 'ready', alt }) })
  const url = await supabase.storage.from(signature.bucket).createSignedUrl(signature.path, 3600)
  if (url.error || !url.data) throw new Error(url.error?.message ?? '图片读取失败')
  onProgress(100)
  localStorage.removeItem(taskKey)
  return normalizeAsset({ ...(completed.asset as object), src: url.data.signedUrl })
}
