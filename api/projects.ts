import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getServerSupabase, json } from './_lib/supabase.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabase = getServerSupabase()
  if (!supabase) return json(res, 200, { projects: [], mode: 'demo' })
  const { data, error } = await supabase.from('projects').select('*, project_assets(position, asset:assets(*))').eq('status', 'published').order('sort_order', { ascending: true })
  if (error) return json(res, 500, { error: 'query_failed' })
  return json(res, 200, { projects: data })
}
