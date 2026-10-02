import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest, json } from '../_lib/supabase.js'

const bodySchema = z.object({ slug: z.string().min(1), title: z.string().min(1), summary: z.string().optional(), body: z.string().optional(), year: z.number().int().optional(), category: z.string().min(1), tags: z.array(z.string()).optional(), status: z.enum(['draft', 'published', 'archived']).optional(), featured: z.boolean().optional(), cover_asset_id: z.string().uuid().nullable().optional() })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  if (req.method === 'GET') {
    const { data, error } = await auth.supabase.from('projects').select('*, project_assets(position, asset:assets(*))').eq('owner_id', auth.user.id).is('deleted_at', null).order('sort_order', { ascending: true })
    if (error) return json(res, 500, { error: 'query_failed' })
    return json(res, 200, { projects: data })
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input', fields: parsed.error.flatten().fieldErrors })
  const { data, error } = await auth.supabase.from('projects').insert({ ...parsed.data, owner_id: auth.user.id }).select().single()
  if (error) return json(res, 400, { error: 'create_failed', detail: error.message })
  return json(res, 201, { project: data })
}
