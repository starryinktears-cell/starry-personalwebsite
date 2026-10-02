import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getServerSupabase, json } from '../_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return json(res, 401, { error: 'unauthorized' })
  const supabase = getServerSupabase()
  if (!supabase) return json(res, 503, { error: 'supabase_not_configured' })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return json(res, 401, { error: 'unauthorized' })
  return json(res, 200, { user: { id: data.user.id, email: data.user.email } })
}
