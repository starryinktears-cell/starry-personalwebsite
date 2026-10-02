import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest, json } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const { taskId, assetId, status = 'uploaded' } = req.body ?? {}
  if (taskId) await auth.supabase.from('upload_tasks').update({ status }).eq('id', taskId).eq('owner_id', auth.user.id)
  if (assetId) await auth.supabase.from('assets').update({ status }).eq('id', assetId).eq('owner_id', auth.user.id)
  return json(res, 200, { ok: true, status })
}
