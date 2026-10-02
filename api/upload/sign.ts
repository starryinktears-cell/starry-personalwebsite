import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { getServerSupabase, json } from '../_lib/supabase.js'

const schema = z.object({ path: z.string().regex(/^[-a-zA-Z0-9_/.]+$/).max(240), contentType: z.string().max(120) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return json(res, 401, { error: 'unauthorized' })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input' })
  const supabase = getServerSupabase()
  if (!supabase) return json(res, 503, { error: 'supabase_not_configured' })
  const { data: authData, error: authError } = await supabase.auth.getUser(auth.slice('Bearer '.length))
  if (authError || !authData.user) return json(res, 401, { error: 'unauthorized' })
  if (!parsed.data.path.startsWith(`${authData.user.id}/`)) return json(res, 403, { error: 'forbidden_path' })
  const { data, error } = await supabase.storage.from(process.env.MEDIA_BUCKET ?? 'portfolio-media').createSignedUploadUrl(parsed.data.path)
  if (error) return json(res, 500, { error: 'sign_failed' })
  return json(res, 200, { ...data, expiresIn: 600 })
}
