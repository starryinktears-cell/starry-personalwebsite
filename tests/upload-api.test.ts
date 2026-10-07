/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runtime = vi.hoisted(() => ({ auth: null as any }))
vi.mock('../api/_lib/supabase.js', () => ({
  authenticateRequest: async () => runtime.auth,
  json: (res: any, code: number, body: any) => res.status(code).json(body),
}))
let inserts: { table: string; row: Record<string, unknown> }[]
let sign: ReturnType<typeof vi.fn>
beforeEach(() => {
  vi.resetModules()
  // Deployed environments may still contain the previous 50 MB value.
  vi.stubEnv('MAX_MEDIA_BYTES', '52428800')
  inserts = []
  sign = vi.fn(async () => ({ data: { token: 'test-only-token', signedUrl: 'https://example.com/upload' }, error: null }))
  runtime.auth = { user: { id: 'owner-test' }, supabase: {
    storage: { from: () => ({ createSignedUploadUrl: sign }) },
    from: (table: string) => ({ insert: (row: Record<string, unknown>) => {
      inserts.push({ table, row })
      return { select: () => ({ single: async () => ({ data: { id: `${table}-id` }, error: null }) }) }
    } }),
  } }
})
afterEach(() => vi.unstubAllEnvs())
function response() {
  const res: any = { code: 0, body: null, status(code: number) { this.code = code; return this }, json(body: any) { this.body = body } }
  return res
}

describe('Node upload size validation (mock storage and database)', () => {
  it.each(['image/jpeg', 'video/mp4'])('accepts exactly 5 MB for %s and keeps owner-scoped task creation', async contentType => {
    const { default: handler } = await import('../api/upload/sign')
    const res = response()
    await handler({ method: 'POST', body: { filename: contentType.startsWith('image') ? 'photo.jpg' : 'film.mp4', contentType, size: 5242880 } } as any, res)
    expect(res.code).toBe(200)
    expect(inserts).toHaveLength(2)
    expect(inserts[0].row).toMatchObject({ owner_id: 'owner-test', byte_size: 5242880 })
    expect(inserts[1].row).toMatchObject({ owner_id: 'owner-test', bytes_total: 5242880 })
    expect(res.body.path).toMatch(/^owner-test\//)
  })

  it('rejects 5 MB plus one byte before signing or creating records, even with the old environment override', async () => {
    const { default: handler } = await import('../api/upload/sign')
    const res = response()
    await handler({ method: 'POST', body: { filename: 'photo.jpg', contentType: 'image/jpeg', size: 5242881 } } as any, res)
    expect(res.code).toBe(400)
    expect(res.body.fields.size).toBeTruthy()
    expect(sign).not.toHaveBeenCalled()
    expect(inserts).toHaveLength(0)
  })
})
