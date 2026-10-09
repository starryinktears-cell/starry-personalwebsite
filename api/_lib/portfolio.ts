/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js'

const bucket = () => process.env.MEDIA_BUCKET || 'portfolio-media'

export async function signedAsset(client: SupabaseClient, raw: any) {
  if (!raw) return null
  let src = raw.storage_path ?? ''
  if (src) {
    const { data } = await client.storage.from(bucket()).createSignedUrl(src, 3600)
    src = data?.signedUrl ?? ''
  }
  return {
    id: raw.id,
    kind: raw.kind,
    name: raw.name,
    src,
    poster: raw.poster_path ? (await client.storage.from(bucket()).createSignedUrl(raw.poster_path, 3600)).data?.signedUrl : undefined,
    alt: raw.alt_text ?? '',
    status: raw.status,
    width: raw.width ?? 0,
    height: raw.height ?? 0,
    duration_ms: raw.duration_ms ?? null,
    byte_size: raw.byte_size ?? 0,
    mime_type: raw.mime_type ?? '',
    storage_path: raw.storage_path,
    processing_error: raw.processing_error ?? null,
    created_at: raw.created_at,
  }
}

export async function serializeProject(client: SupabaseClient, raw: any) {
  const entries = Array.isArray(raw?.project_assets) ? [...raw.project_assets].sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0)) : []
  const assets = (await Promise.all(entries.map((entry) => signedAsset(client, entry.asset)))).filter(Boolean)
  const cover = assets.find((asset: any) => asset.id === raw.cover_asset_id) ?? assets[0]
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    summary: raw.summary ?? '',
    body: raw.body ?? '',
    year: raw.year,
    category: raw.category,
    tags: raw.tags ?? [],
    status: raw.status,
    featured: raw.featured,
    sort_order: raw.sort_order ?? 0,
    location: raw.location,
    client: raw.client,
    cover: (cover as any)?.src ?? '',
    coverAlt: (cover as any)?.alt ?? '',
    cover_asset_id: raw.cover_asset_id,
    assets,
    updated_at: raw.updated_at,
  }
}

export function serializeInquiry(raw: any) {
  return { id: raw.id, name: raw.name, email: raw.email, project_type: raw.project_type ?? 'Other', message: raw.message, status: raw.status, private_note: raw.private_note ?? '', created_at: raw.created_at }
}

export async function serializeSettings(raw: any, client: SupabaseClient) {
  if (!raw) return null
  const seo = raw.seo && typeof raw.seo === 'object' ? raw.seo : {}
  const content = seo.content ?? { texts: {}, images: {} }
  const ids = [...new Set([raw.hero_asset_id, ...Object.values(content.images ?? {}).map((image: any) => image.assetId)].filter(Boolean))]
  const images: Record<string, any> = {}
  if (ids.length) {
    const { data, error } = await client.from('assets').select('*').eq('owner_id', raw.owner_id).eq('kind', 'image').eq('status', 'ready').in('id', ids)
    if (error) throw new Error('Unable to read site images')
    for (const asset of data ?? []) images[asset.id] = await signedAsset(client, asset)
  }
  const videoIds = [...new Set(Object.values(content.videos ?? {}).map((video: any) => video.assetId).filter(Boolean))]
  const videoAssets: Record<string, any> = {}
  if (videoIds.length) {
    const { data, error } = await client.from('assets').select('*').eq('owner_id', raw.owner_id).eq('kind', 'video').eq('status', 'ready').in('id', videoIds)
    if (error) throw new Error('Unable to read site videos')
    for (const asset of data ?? []) videoAssets[asset.id] = await signedAsset(client, asset)
  }
  const videos = Object.fromEntries(Object.entries(content.videos ?? {}).map(([key, video]: [string, any]) => [key, video.assetId ? { ...video, src: videoAssets[video.assetId]?.src ?? '' } : video]))
  const resolved = Object.fromEntries(Object.entries(content.images ?? {}).map(([key, image]: [string, any]) => [key, image.assetId ? { ...image, src: images[image.assetId]?.src ?? '' } : image]))
  return { theme: seo.theme, site_name: raw.site_name, short_bio: raw.short_bio ?? '', contact_email: raw.contact_email ?? '', hero_title: raw.hero_title ?? '', hero_subtitle: raw.hero_subtitle ?? '', accent: raw.accent ?? '#626a4c', social_links: raw.social_links ?? [], hero_asset_id: raw.hero_asset_id ?? null, hero_alt: seo.hero_alt ?? '', hero_image: raw.hero_asset_id ? images[raw.hero_asset_id]?.src ?? '' : seo.hero_image ?? '', content: { heroSlides: content.heroSlides, experienceItems: content.experienceItems, customCases: content.customCases ?? [], texts: content.texts ?? {}, images: resolved, videos } }
}
