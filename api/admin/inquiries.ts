import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest, json } from '../_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  if (req.method === 'GET') {
    const { data, error } = await auth.supabase.from('inquiries').select('*').eq('owner_id', auth.user.id).order('created_at', { ascending: false })
    if (error) return json(res, 500, { error: 'query_failed' })
    return json(res, 200, { inquiries: data })
  }
  if (req.method === 'PATCH') {
    const { id, status, private_note } = req.body ?? {}
    const { data, error } = await auth.supabase.from('inquiries').update({ status, private_note }).eq('id', id).eq('owner_id', auth.user.id).select().single()
    if (error || !data) return json(res, 400, { error: 'update_failed' })
    return json(res, 200, { inquiry: data })
  }
  return json(res, 405, { error: 'method_not_allowed' })
}
