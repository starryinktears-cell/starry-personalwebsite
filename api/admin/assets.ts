import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest, json } from '../_lib/supabase.js'
import { signedAsset } from '../_lib/portfolio.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return json(res, 405, { error: 'method_not_allowed' })
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  const { data, error } = await auth.supabase.from('assets').select('*').eq('owner_id', auth.user.id).order('created_at', { ascending: false })
  if (error) return json(res, 500, { error: 'query_failed', detail: error.message })
  return json(res, 200, { assets: await Promise.all((data ?? []).map(asset => signedAsset(auth.supabase, asset))) })
}
