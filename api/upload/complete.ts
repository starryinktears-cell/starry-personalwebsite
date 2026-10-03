import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest, json } from '../_lib/supabase.js'

const schema = z.object({ taskId: z.string().uuid(), assetId: z.string().uuid(), status: z.enum(['ready', 'failed', 'cancelled']).default('ready'), alt: z.string().max(500).optional(), error: z.string().max(1000).optional() })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input', fields: parsed.error.flatten().fieldErrors })
  const { data: task } = await auth.supabase.from('upload_tasks').select('id,storage_path,bytes_total').eq('id', parsed.data.taskId).eq('owner_id', auth.user.id).single()
  const { data: asset } = await auth.supabase.from('assets').select('*').eq('id', parsed.data.assetId).eq('owner_id', auth.user.id).single()
  if (!task || !asset || task.storage_path !== asset.storage_path) return json(res, 404, { error: 'upload_not_found' })
  let status = parsed.data.status
  if (status === 'ready') {
    const bucket = process.env.MEDIA_BUCKET ?? 'portfolio-media'
    const folder = task.storage_path.split('/').slice(0, -1).join('/')
    const name = task.storage_path.split('/').pop() ?? ''
    const { data: objects, error: listError } = await auth.supabase.storage.from(bucket).list(folder, { search: name, limit: 10 })
    if (listError || !(objects ?? []).some((object) => object.name === name)) status = 'failed'
  }
  const assetUpdate = { status, ...(parsed.data.alt !== undefined ? { alt_text: parsed.data.alt } : {}), ...(parsed.data.error ? { processing_error: parsed.data.error } : {}) }
  const { data: updated, error: assetError } = await auth.supabase.from('assets').update(assetUpdate).eq('id', asset.id).eq('owner_id', auth.user.id).select('*').single()
  await auth.supabase.from('upload_tasks').update({ status, bytes_uploaded: status === 'ready' ? task.bytes_total : 0, error: status === 'failed' ? (parsed.data.error ?? 'Object was not found after upload') : null }).eq('id', task.id).eq('owner_id', auth.user.id)
  if (assetError || !updated) return json(res, 500, { error: 'asset_update_failed' })
  return json(res, status === 'failed' ? 422 : 200, { ok: status !== 'failed', status, asset: updated })
}
