/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest, json } from '../_lib/supabase.js'
import { serializeProject } from '../_lib/portfolio.js'

const assetSchema = z.object({ id: z.string().uuid(), alt: z.string().max(500).optional(), position: z.number().int().min(0).optional() })
const bodySchema = z.object({ slug: z.string().trim().min(1).max(160), title: z.string().trim().min(1).max(200), summary: z.string().max(2000).optional(), body: z.string().max(100000).optional(), year: z.number().int().min(1900).max(2200).optional(), category: z.string().trim().min(1).max(80), tags: z.array(z.string().max(80)).max(30).optional(), location: z.string().max(160).optional(), client: z.string().max(160).optional(), status: z.enum(['draft', 'published', 'archived']).optional(), featured: z.boolean().optional(), sort_order: z.number().int().min(-1000000).max(1000000).optional(), cover_asset_id: z.string().uuid().nullable().optional(), assets: z.array(assetSchema).max(500).optional() })

async function validateAssets(auth: any, assets: z.infer<typeof assetSchema>[], coverAssetId: string | null | undefined, status: string) {
  const ids = assets.map((asset) => asset.id)
  if (new Set(ids).size !== ids.length) return 'duplicate_asset'
  if (ids.length) {
    const { data, error } = await auth.supabase.from('assets').select('id,status,alt_text').eq('owner_id', auth.user.id).in('id', ids)
    if (error || data?.length !== ids.length) return 'asset_not_owned'
    const byId = new Map<string, { status: string; alt_text: string }>((data ?? []).map((asset: any) => [asset.id, asset] as [string, { status: string; alt_text: string }]))
    for (const asset of assets) {
      if (asset.alt !== undefined) {
        const { error: altError } = await auth.supabase.from('assets').update({ alt_text: asset.alt }).eq('id', asset.id).eq('owner_id', auth.user.id)
        if (altError) return 'asset_update_failed'
      }
      if (status === 'published' && (byId.get(asset.id)?.status !== 'ready' || !(asset.alt ?? byId.get(asset.id)?.alt_text ?? '').trim())) return 'published_assets_incomplete'
    }
  }
  if (status === 'published' && (!coverAssetId || !ids.includes(coverAssetId) || ids.length === 0)) return 'published_cover_required'
  if (coverAssetId && !ids.includes(coverAssetId)) return 'cover_asset_not_attached'
  return null
}

async function syncAssets(auth: any, projectId: string, assets: z.infer<typeof assetSchema>[]) {
  const { error: removeError } = await auth.supabase.from('project_assets').delete().eq('project_id', projectId)
  if (removeError) return removeError
  if (!assets.length) return null
  const { error } = await auth.supabase.from('project_assets').insert(assets.map((asset, index) => ({ project_id: projectId, asset_id: asset.id, position: asset.position ?? index })))
  return error ?? null
}

async function readProject(auth: any, id: string) {
  const { data, error } = await auth.supabase.from('projects').select('*, project_assets(position, asset:assets(*))').eq('owner_id', auth.user.id).eq('id', id).is('deleted_at', null).single()
  if (error || !data) return null
  return serializeProject(auth.supabase, data)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  if (req.method === 'GET') {
    const { data, error } = await auth.supabase.from('projects').select('*, project_assets(position, asset:assets(*))').eq('owner_id', auth.user.id).is('deleted_at', null).order('sort_order', { ascending: true })
    if (error) return json(res, 500, { error: 'query_failed', detail: error.message })
    return json(res, 200, { projects: await Promise.all((data ?? []).map((project) => serializeProject(auth.supabase, project))) })
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input', fields: parsed.error.flatten().fieldErrors })
  const { assets = [], ...fields } = parsed.data
  const status = fields.status ?? 'draft'
  const assetError = await validateAssets(auth, assets, fields.cover_asset_id, status)
  if (assetError) return json(res, 400, { error: assetError })
  const { data, error } = await auth.supabase.from('projects').insert({ ...fields, status, owner_id: auth.user.id, published_at: status === 'published' ? new Date().toISOString() : null }).select('id').single()
  if (error || !data) return json(res, 400, { error: 'create_failed', detail: error?.message })
  const linkError = await syncAssets(auth, data.id, assets)
  if (linkError) { await auth.supabase.from('projects').delete().eq('id', data.id).eq('owner_id', auth.user.id); return json(res, 400, { error: 'assets_sync_failed', detail: linkError.message }) }
  const project = await readProject(auth, data.id)
  return json(res, 201, { project })
}
