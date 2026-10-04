import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { VercelRequest } from '@vercel/node'

let cached: SupabaseClient | null = null

export function getServerSupabase() {
  if (cached) return cached
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return cached
}

export function json(res: { status: (code: number) => { json: (body: unknown) => void }; setHeader?: (name: string, value: string) => unknown }, status: number, body: unknown) {
  res.setHeader?.('Cache-Control', 'private, no-store')
  return res.status(status).json(body)
}

export async function authenticateRequest(req: VercelRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  const supabase = getServerSupabase()
  if (!token || !supabase) return null
  const { data, error } = await supabase.auth.getUser(token)
  return error || !data.user ? null : { user: data.user, supabase }
}
