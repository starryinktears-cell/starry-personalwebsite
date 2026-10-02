import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { getServerSupabase, json } from './_lib/supabase'

const inquirySchema = z.object({ name: z.string().min(1).max(120), email: z.string().email(), projectType: z.string().max(80).optional(), message: z.string().min(1).max(5000), consent: z.literal(true) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const parsed = inquirySchema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input', fields: parsed.error.flatten().fieldErrors })
  const supabase = getServerSupabase()
  if (!supabase) return json(res, 202, { ok: true, mode: 'demo', message: 'Inquiry accepted in local demo mode.' })
  const { error } = await supabase.from('inquiries').insert({ owner_id: process.env.SITE_OWNER_ID ?? null, name: parsed.data.name, email: parsed.data.email, project_type: parsed.data.projectType ?? 'Other', message: parsed.data.message, consent_at: new Date().toISOString(), status: 'unread' })
  if (error) return json(res, 500, { error: 'storage_failed' })
  return json(res, 201, { ok: true })
}
