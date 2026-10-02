import type { VercelRequest, VercelResponse } from '@vercel/node'
import { json } from './_lib/supabase.js'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return json(res, 200, { ok: true, service: 'studio-01-api', timestamp: new Date().toISOString() })
}
