import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { authenticateRequest, json } from '../_lib/supabase.js'

const schema = z.object({ filename: z.string().trim().min(1).max(180), contentType: z.string().regex(/^(image\/(jpeg|png|webp)|video\/(mp4|quicktime))$/), size: z.number().int().positive().max(2 * 1024 * 1024 * 1024) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input', fields: parsed.error.flatten().fieldErrors })
  const extension = parsed.data.filename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const path = `${auth.user.id}/${randomUUID()}.${extension}`
  const bucket = process.env.MEDIA_BUCKET ?? 'portfolio-media'
  const { data: signed, error: signError } = await auth.supabase.storage.from(bucket).createSignedUploadUrl(path)
  if (signError || !signed) return json(res, 500, { error: 'sign_failed', detail: signError?.message })
  const kind = parsed.data.contentType.startsWith('video/') ? 'video' : 'image'
  const { data: asset, error: assetError } = await auth.supabase.from('assets').insert({ owner_id: auth.user.id, kind, name: parsed.data.filename, storage_path: path, mime_type: parsed.data.contentType, byte_size: parsed.data.size, status: 'uploading' }).select('id').single()
  if (assetError || !asset) return json(res, 500, { error: 'asset_create_failed', detail: assetError?.message })
  const { data: task, error: taskError } = await auth.supabase.from('upload_tasks').insert({ owner_id: auth.user.id, asset_id: asset.id, storage_path: path, status: 'uploading', bytes_total: parsed.data.size }).select('id').single()
  if (taskError || !task) { await auth.supabase.from('assets').delete().eq('id', asset.id).eq('owner_id', auth.user.id); return json(res, 500, { error: 'task_create_failed', detail: taskError?.message }) }
  return json(res, 200, { path, token: signed.token, signedUrl: signed.signedUrl, assetId: asset.id, taskId: task.id, expiresIn: 600 })
}
