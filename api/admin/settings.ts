import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest, json } from '../_lib/supabase.js'
import { serializeSettings } from '../_lib/portfolio.js'

const schema = z.object({ siteName: z.string().trim().min(1).max(120), shortBio: z.string().max(2000).optional(), contactEmail: z.string().email().max(320), heroTitle: z.string().max(500), heroSubtitle: z.string().max(240), heroImage: z.string().max(2000), accent: z.string().regex(/^#[0-9a-f]{6}$/i), socialLinks: z.array(z.object({ label: z.string().max(40), href: z.string().max(1000) })).max(10) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  if (req.method === 'GET') {
    const { data, error } = await auth.supabase.from('site_settings').select('*').eq('owner_id', auth.user.id).maybeSingle()
    if (error) return json(res, 500, { error: 'query_failed', detail: error.message })
    return json(res, 200, { settings: serializeSettings(data) })
  }
  if (req.method !== 'PUT') return json(res, 405, { error: 'method_not_allowed' })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input', fields: parsed.error.flatten().fieldErrors })
  const { data: current } = await auth.supabase.from('site_settings').select('seo').eq('owner_id', auth.user.id).maybeSingle()
  const { data, error } = await auth.supabase.from('site_settings').upsert({ owner_id: auth.user.id, site_name: parsed.data.siteName, short_bio: parsed.data.shortBio ?? '', contact_email: parsed.data.contactEmail, hero_title: parsed.data.heroTitle, hero_subtitle: parsed.data.heroSubtitle, accent: parsed.data.accent, social_links: parsed.data.socialLinks, seo: { ...(current?.seo ?? {}), hero_image: parsed.data.heroImage } }).select('*').single()
  if (error) return json(res, 400, { error: 'update_failed', detail: error.message })
  return json(res, 200, { settings: serializeSettings(data) })
}
