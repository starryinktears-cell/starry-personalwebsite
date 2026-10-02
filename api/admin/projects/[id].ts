import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest, json } from '../../_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  const id = String(req.query.id)
  if (req.method === 'GET') {
    const { data, error } = await auth.supabase.from('projects').select('*, project_assets(position, asset:assets(*))').eq('owner_id', auth.user.id).eq('id', id).is('deleted_at', null).single()
    if (error || !data) return json(res, 404, { error: 'not_found' })
    return json(res, 200, { project: data })
  }
  if (req.method === 'PATCH') {
    const { data, error } = await auth.supabase.from('projects').update({ ...req.body, owner_id: auth.user.id }).eq('id', id).eq('owner_id', auth.user.id).select().single()
    if (error || !data) return json(res, 400, { error: 'update_failed' })
    return json(res, 200, { project: data })
  }
  if (req.method === 'DELETE') {
    const { error } = await auth.supabase.from('projects').update({ deleted_at: new Date().toISOString(), status: 'archived' }).eq('id', id).eq('owner_id', auth.user.id)
    if (error) return json(res, 400, { error: 'archive_failed' })
    return json(res, 200, { ok: true })
  }
  return json(res, 405, { error: 'method_not_allowed' })
}

