import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest, json } from '../_lib/supabase.js'
import { serializeInquiry } from '../_lib/portfolio.js'

const patchSchema = z.object({ id: z.string().uuid(), status: z.enum(['unread', 'read', 'archived']).optional(), private_note: z.string().max(5000).optional() }).refine((value) => value.status !== undefined || value.private_note !== undefined)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  if (req.method === 'GET') {
    const { data, error } = await auth.supabase.from('inquiries').select('*').eq('owner_id', auth.user.id).order('created_at', { ascending: false })
    if (error) return json(res, 500, { error: 'query_failed', detail: error.message })
    return json(res, 200, { inquiries: (data ?? []).map(serializeInquiry) })
  }
  if (req.method !== 'PATCH') return json(res, 405, { error: 'method_not_allowed' })
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input', fields: parsed.error.flatten().fieldErrors })
  const { id, private_note, ...changes } = parsed.data
  const { data, error } = await auth.supabase.from('inquiries').update({ ...changes, ...(private_note !== undefined ? { private_note } : {}) }).eq('id', id).eq('owner_id', auth.user.id).select('*').single()
  if (error || !data) return json(res, 404, { error: 'not_found' })
  return json(res, 200, { inquiry: serializeInquiry(data) })
}
