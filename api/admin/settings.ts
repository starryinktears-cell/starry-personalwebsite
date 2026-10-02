import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest, json } from '../_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  if (req.method === 'GET') {
    const { data, error } = await auth.supabase.from('site_settings').select('*').eq('owner_id', auth.user.id).maybeSingle()
    if (error) return json(res, 500, { error: 'query_failed' })
    return json(res, 200, { settings: data })
  }
  if (req.method === 'PUT') {
    const { data, error } = await auth.supabase.from('site_settings').upsert({ ...req.body, owner_id: auth.user.id }).select().single()
    if (error) return json(res, 400, { error: 'update_failed' })
    return json(res, 200, { settings: data })
  }
  return json(res, 405, { error: 'method_not_allowed' })
}
