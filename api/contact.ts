import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { getServerSupabase, json } from './_lib/supabase.js'

const inquirySchema = z.object({ name: z.string().trim().min(1).max(120), email: z.string().email(), projectType: z.string().max(80).optional(), message: z.string().trim().min(1).max(5000), budget: z.number().int().min(0).max(100000000).optional(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')), consent: z.literal(true) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const parsed = inquirySchema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input', fields: parsed.error.flatten().fieldErrors })
  const supabase = getServerSupabase()
  if (!supabase) return json(res, 202, { ok: true, mode: 'demo', message: 'Inquiry accepted in local demo mode.' })
  const ownerId = process.env.SITE_OWNER_ID
  if (!ownerId) return json(res, 500, { error: 'site_owner_not_configured' })
  const { data, error } = await supabase.from('inquiries').insert({ owner_id: ownerId, name: parsed.data.name, email: parsed.data.email, project_type: parsed.data.projectType ?? 'Other', budget: parsed.data.budget === undefined ? null : String(parsed.data.budget), desired_date: parsed.data.date || null, message: parsed.data.message, consent_at: new Date().toISOString(), status: 'unread' }).select('*').single()
  if (error || !data) return json(res, 500, { error: 'storage_failed', detail: error?.message })
  return json(res, 201, { ok: true, inquiry: { id: data.id, name: data.name, email: data.email, project_type: data.project_type, message: data.message, status: data.status, created_at: data.created_at } })
}
