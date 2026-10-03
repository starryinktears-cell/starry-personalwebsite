/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Asset, Inquiry, Project, SiteSettings } from './types'
import { inquiries as seedInquiries, projects as seedProjects, siteSettings as seedSettings } from './mockData'
import { supabase } from './supabase'

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
    heroImage: raw?.heroImage ?? raw?.hero_image ?? seedSettings.heroImage,
    accent: raw?.accent ?? seedSettings.accent,
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
  try { localStorage.setItem(`studio-demo-${key}`, JSON.stringify(value)) } catch { /* storage is optional in private browsing */ }
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
  const response = await fetch(path, { ...init, headers })
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) throw new Error(`Unexpected response from ${path}`)
  const payload = await response.json() as T & { detail?: string; error?: string }
  if (!response.ok) throw new Error(payload.detail ?? payload.error ?? `Request failed (${response.status})`)
  return payload as T
}

export async function loadPublicData() {
  try {
    const payload = await apiRequest<{ projects?: any[]; settings?: any }>('/api/projects')
    return { projects: (payload.projects ?? []).map(normalizeProject), settings: normalizeSettings(payload.settings) }
  } catch {
    return { projects: demoMode ? readDemo('projects', seedProjects) : [], settings: demoMode ? normalizeSettings(readDemo('settings', seedSettings)) : seedSettings }
  }
}

export async function loadAdminData() {
  if (demoMode) return { projects: readDemo('projects', seedProjects), inquiries: readDemo('inquiries', seedInquiries), settings: normalizeSettings(readDemo('settings', seedSettings)) }
  const [projectPayload, inquiryPayload, settingsPayload] = await Promise.all([
    apiRequest<{ projects: any[] }>('/api/admin/projects'),
    apiRequest<{ inquiries: any[] }>('/api/admin/inquiries'),
    apiRequest<{ settings: any }>('/api/admin/settings'),
  ])
  return { projects: (projectPayload.projects ?? []).map(normalizeProject), inquiries: (inquiryPayload.inquiries ?? []).map(normalizeInquiry), settings: normalizeSettings(settingsPayload.settings) }
}

function projectPayload(project: Project, status = project.status) {
  const coverAsset = project.assets.find((asset) => asset.src === project.cover || asset.id === project.cover)
  return { slug: project.slug, title: project.title, summary: project.summary, body: project.body, year: project.year, category: project.category, tags: project.tags, location: project.location, client: project.client, status, featured: project.featured, cover_asset_id: coverAsset?.id ?? null, assets: project.assets.map((asset, position) => ({ id: asset.id, name: asset.name, kind: asset.kind, alt: asset.id === coverAsset?.id && project.coverAlt ? project.coverAlt : asset.alt, status: asset.status, position })) }
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
