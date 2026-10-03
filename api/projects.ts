import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getServerSupabase, json } from './_lib/supabase.js'
import { serializeProject, serializeSettings } from './_lib/portfolio.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabase = getServerSupabase()
  if (!supabase) return json(res, 200, { projects: [], settings: null, mode: 'demo' })
  const ownerId = process.env.SITE_OWNER_ID
  if (!ownerId) return json(res, 500, { error: 'site_owner_not_configured' })
  const [{ data: projects, error: projectError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase.from('projects').select('*, project_assets(position, asset:assets(*))').eq('owner_id', ownerId).eq('status', 'published').is('deleted_at', null).order('sort_order', { ascending: true }),
    supabase.from('site_settings').select('*').eq('owner_id', ownerId).maybeSingle(),
  ])
  if (projectError || settingsError) return json(res, 500, { error: 'query_failed' })
  return json(res, 200, { projects: await Promise.all((projects ?? []).map((project) => serializeProject(supabase, project))), settings: serializeSettings(settings) })
}
