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

export function serializeSettings(raw: any) {
  if (!raw) return null
  const seo = raw.seo && typeof raw.seo === 'object' ? raw.seo : {}
  return { site_name: raw.site_name, short_bio: raw.short_bio ?? '', contact_email: raw.contact_email ?? '', hero_title: raw.hero_title ?? '', hero_subtitle: raw.hero_subtitle ?? '', accent: raw.accent ?? '#626a4c', social_links: raw.social_links ?? [], hero_image: seo.hero_image ?? '', seo }
}
