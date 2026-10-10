/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Asset, Inquiry, Project, SiteSettings } from './types'
import { inquiries as seedInquiries, projects as seedProjects, siteSettings as seedSettings } from './mockData'
import { supabase } from './supabase'
import { resolveDemoMedia, serializeDemoMedia } from './demoMedia'

export const demoMode = !supabase

function toDate(value: unknown) {
  if (!value) return new Date().toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

export function normalizeAsset(raw: any): Asset {
  const src = raw.src ?? raw.url ?? raw.publicUrl ?? raw.public_url ?? raw.storage_path ?? ''
  return {
    id: String(raw.id),
    kind: raw.kind === 'video' ? 'video' : 'image',
    name: raw.name ?? 'Untitled media',
    src,
    poster: raw.poster ?? raw.poster_url ?? undefined,
    alt: raw.alt ?? raw.alt_text ?? '',
    status: raw.status ?? 'ready',
    width: Number(raw.width ?? 0),
    height: Number(raw.height ?? 0),
    duration: raw.duration ?? (raw.duration_ms ? `${Math.floor(Number(raw.duration_ms) / 60000)}:${String(Math.floor((Number(raw.duration_ms) % 60000) / 1000)).padStart(2, '0')}` : undefined),
    size: raw.size ?? (raw.byte_size ? `${(Number(raw.byte_size) / 1024 / 1024).toFixed(1)} MB` : ''),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    storagePath: raw.storagePath ?? raw.storage_path,
    mimeType: raw.mimeType ?? raw.mime_type,
    error: raw.error ?? raw.processing_error,
  }
}

export function normalizeProject(raw: any): Project {
  const nested = Array.isArray(raw.assets) ? raw.assets : (raw.project_assets ?? []).sort((a: any, b: any) => Number(a.position ?? 0) - Number(b.position ?? 0)).map((entry: any) => entry.asset).filter(Boolean)
  const assets: Asset[] = nested.map(normalizeAsset)
  const coverAsset = assets.find((asset) => asset.id === raw.cover_asset_id) ?? assets[0]
  return {
    id: String(raw.id),
    slug: raw.slug ?? '',
    title: raw.title ?? '',
    summary: raw.summary ?? '',
    body: raw.body ?? '',
    year: Number(raw.year ?? new Date().getFullYear()),
    category: raw.category ?? 'Photography',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    status: raw.status ?? 'draft',
    featured: Boolean(raw.featured),
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0),
    coverAssetId: raw.coverAssetId ?? raw.cover_asset_id ?? coverAsset?.id,
    location: raw.location ?? undefined,
    client: raw.client ?? undefined,
    cover: raw.cover ?? coverAsset?.src ?? '',
    coverAlt: raw.coverAlt ?? raw.cover_alt ?? coverAsset?.alt ?? '',
    coverLqip: raw.coverLqip,
    coverSrcSet: raw.coverSrcSet,
    coords: raw.coords,
    camera: raw.camera,
    format: raw.format,
    credits: raw.credits,
    assets,
    updatedAt: toDate(raw.updatedAt ?? raw.updated_at),
  }
}

export function normalizeInquiry(raw: any): Inquiry {
  return { id: String(raw.id), name: raw.name ?? '', email: raw.email ?? '', projectType: raw.projectType ?? raw.project_type ?? 'Other', message: raw.message ?? '', status: raw.status ?? 'unread', createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(), note: raw.note ?? raw.private_note ?? '' }
}

export function normalizeSettings(raw: any): SiteSettings {
  return {
    siteName: raw?.siteName ?? raw?.site_name ?? seedSettings.siteName,
    shortBio: raw?.shortBio ?? raw?.short_bio ?? seedSettings.shortBio,
    contactEmail: raw?.contactEmail ?? raw?.contact_email ?? seedSettings.contactEmail,
    heroTitle: raw?.heroTitle ?? raw?.hero_title ?? seedSettings.heroTitle,
    heroSubtitle: raw?.heroSubtitle ?? raw?.hero_subtitle ?? seedSettings.heroSubtitle,
    heroImage: (raw?.heroImage ?? raw?.hero_image) || seedSettings.heroImage,
    heroAssetId: raw?.heroAssetId ?? raw?.hero_asset_id ?? null,
    heroAlt: raw?.heroAlt ?? raw?.hero_alt ?? '',
    content: raw?.content ?? { texts: {}, images: {} },
    accent: raw?.accent ?? seedSettings.accent,
    theme: raw?.theme ?? raw?.seo?.theme,
    socialLinks: Array.isArray(raw?.socialLinks) ? raw.socialLinks : (Array.isArray(raw?.social_links) ? raw.social_links : seedSettings.socialLinks),
  }
}

function readDemo<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`studio-demo-${key}`)
    return value ? JSON.parse(value) as T : fallback
  } catch { return fallback }
}

function writeDemo<T>(key: string, value: T) {
  localStorage.setItem(`studio-demo-${key}`, serializeDemoMedia(value))
  localStorage.setItem('studio-content-updated', String(Date.now()))
}

async function token() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = await token()
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json')
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)
  const response = await fetch(path, { cache: 'no-store', ...init, headers })
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) throw new Error(`Unexpected response from ${path}`)
  const payload = await response.json() as T & { detail?: string; error?: string; fields?: Record<string, string[]> }
  if (!response.ok) {
    const messages: Record<string, string> = { site_image_not_owned_or_not_ready: '图片不属于当前账号或尚未上传完成。', select_private_image_from_library: '私有图片请从媒体库选择，不能永久保存临时签名地址。', site_image_not_owned: '图片不属于当前账号。', unauthorized: '登录会话已失效，请重新登录。' }
    const fields = payload.fields ? Object.entries(payload.fields).map(([key, errors]) => `${key}: ${errors.join('，')}`).join('；') : ''
    throw new Error(payload.detail ?? messages[payload.error ?? ''] ?? (fields || payload.error || `Request failed (${response.status})`))
  }
  return payload as T
}

export async function loadPublicData() {
  if (demoMode) {
    const [projects, settings] = await Promise.all([
      resolveDemoMedia(readDemo('projects', seedProjects).filter(project => project.status === 'published').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))),
      resolveDemoMedia(readDemo('settings', seedSettings)),
    ])
    return { projects, settings: normalizeSettings(settings) }
  }
  try {
    const payload = await apiRequest<{ projects?: any[]; settings?: any }>('/api/projects')
    return { projects: (payload.projects ?? []).map(normalizeProject), settings: normalizeSettings(payload.settings) }
  } catch (error) { throw new Error(`主站数据读取失败：${error instanceof Error ? error.message : String(error)}`) }
}

export async function loadAdminData() {
  if (demoMode) {
    const [projects, settings] = await Promise.all([resolveDemoMedia(readDemo('projects', seedProjects)), resolveDemoMedia(readDemo('settings', seedSettings))])
    return { projects, inquiries: readDemo('inquiries', seedInquiries), settings: normalizeSettings(settings) }
  }
  const [projectPayload, inquiryPayload, settingsPayload] = await Promise.all([
    apiRequest<{ projects: any[] }>('/api/admin/projects'),
    apiRequest<{ inquiries: any[] }>('/api/admin/inquiries'),
    apiRequest<{ settings: any }>('/api/admin/settings'),
  ])
  return { projects: (projectPayload.projects ?? []).map(normalizeProject), inquiries: (inquiryPayload.inquiries ?? []).map(normalizeInquiry), settings: normalizeSettings(settingsPayload.settings) }
}

export function projectPayload(project: Project, status = project.status) {
  const coverAsset = project.assets.find((asset) => asset.id === project.coverAssetId) ?? project.assets.find((asset) => asset.src === project.cover || asset.id === project.cover)
  return { slug: project.slug, title: project.title, summary: project.summary, body: project.body, year: project.year, category: project.category, tags: project.tags, location: project.location, client: project.client, sort_order: project.sortOrder ?? 0, status, featured: project.featured, cover_asset_id: coverAsset?.id ?? null, assets: project.assets.map((asset, position) => ({ id: asset.id, name: asset.name, kind: asset.kind, alt: asset.id === coverAsset?.id ? project.coverAlt : asset.alt, status: asset.status, position })) }
}

export async function saveProject(project: Project, status = project.status, forceCreate = false) {
  if (demoMode) {
    const next = { ...project, status, updatedAt: new Date().toISOString().slice(0, 10) }
    const current = readDemo('projects', seedProjects)
    writeDemo('projects', current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [next, ...current])
    return next
  }
  const payload = projectPayload(project, status)
  const response = !forceCreate && project.id && /^[0-9a-f-]{36}$/i.test(project.id) ? await apiRequest<{ project: any }>(`/api/admin/projects/${project.id}`, { method: 'PATCH', body: JSON.stringify(payload) }) : await apiRequest<{ project: any }>('/api/admin/projects', { method: 'POST', body: JSON.stringify(payload) })
  return normalizeProject(response.project)
}

export async function saveSettings(settings: SiteSettings) {
  if (demoMode) { writeDemo('settings', settings); return settings }
  const response = await apiRequest<{ settings: any }>('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) })
  return normalizeSettings(response.settings)
}

export async function loadMediaLibrary(): Promise<Asset[]> {
  if (demoMode) {
    const attached = readDemo('projects', seedProjects).flatMap(project => project.assets)
    return resolveDemoMedia([...new Map([...readDemo<Asset[]>('assets', []), ...attached].map(asset => [asset.id, asset])).values()])
  }
  const payload = await apiRequest<{ assets: unknown[] }>('/api/admin/assets')
  return payload.assets.map(normalizeAsset)
}

export async function waitForAssetReady(assetId: string, options: { intervalMs?: number; timeoutMs?: number; load?: () => Promise<Asset[]> } = {}): Promise<Asset> {
  const { intervalMs = 3000, timeoutMs = 240000, load = loadMediaLibrary } = options
  const deadline = Date.now() + timeoutMs
  for (;;) {
    if (Date.now() >= deadline) throw new Error('媒体处理超时，请稍后在媒体库中查看结果。')
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
    const asset = (await load()).find((item) => item.id === assetId)
    if (asset && asset.status !== 'processing' && asset.status !== 'uploading' && asset.status !== 'uploaded') return asset
  }
}

export async function updateInquiry(id: string, patch: { status?: Inquiry['status']; note?: string }) {
  if (demoMode) { const next = readDemo('inquiries', seedInquiries).map((item) => item.id === id ? { ...item, ...patch } : item); writeDemo('inquiries', next); return next.find((item) => item.id === id)! }
  const response = await apiRequest<{ inquiry: any }>('/api/admin/inquiries', { method: 'PATCH', body: JSON.stringify({ id, status: patch.status, private_note: patch.note }) })
  return normalizeInquiry(response.inquiry)
}

export async function submitInquiry(payload: { name: string; email: string; projectType: string; message: string; budget: number; date: string }) {
  if (demoMode) { const item: Inquiry = { id: crypto.randomUUID(), ...payload, projectType: payload.projectType, status: 'unread', createdAt: new Date().toISOString() }; const next = [item, ...readDemo('inquiries', seedInquiries)]; writeDemo('inquiries', next); return item }
  const response = await apiRequest<{ inquiry?: any }>('/api/contact', { method: 'POST', body: JSON.stringify({ ...payload, consent: true }) })
  return response.inquiry ? normalizeInquiry(response.inquiry) : null
}
