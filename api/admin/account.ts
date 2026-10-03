import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest, getServerSupabase, json } from '../_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return json(res, 405, { error: 'method_not_allowed' })
  if (req.body?.confirm !== true) return json(res, 400, { error: 'confirmation_required' })
  const auth = await authenticateRequest(req)
  const service = getServerSupabase()
  if (!auth || !service) return json(res, 401, { error: 'unauthorized' })
  const { error } = await service.auth.admin.deleteUser(auth.user.id)
  if (error) return json(res, 500, { error: 'delete_failed', detail: error.message })
  return json(res, 200, { ok: true })
}
