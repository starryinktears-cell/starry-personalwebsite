/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const runtime = vi.hoisted(() => ({ auth: null as any, waited: [] as Promise<unknown>[] }))

vi.mock('../api/_lib/supabase.js', () => ({
  authenticateRequest: async () => runtime.auth,
  json: (res: any, code: number, body: any) => res.status(code).json(body),
}))
vi.mock('@vercel/functions', () => ({ waitUntil: (promise: Promise<unknown>) => { runtime.waited.push(promise) } }))
vi.mock('../api/_lib/transcode.js', () => ({ processVideoAsset: vi.fn(async () => ({ ok: true })) }))

type State = { asset: any; task: any; objects: { name: string }[]; updates: { table: string; patch: any }[] }

function authFor(state: State) {
  const table = (name: string) => ({
    select: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: name === 'assets' ? state.asset : state.task, error: null }) }) }) }),
    update: (patch: any) => {
      state.updates.push({ table: name, patch })
      return { eq: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: { ...state.asset, ...patch }, error: null }) }) }) }) }
    },
  })
  return { user: { id: 'owner-test' }, supabase: { from: table, storage: { from: () => ({ list: async () => ({ data: state.objects, error: null }) }) } } }
}

function response() {
  const res: any = { code: 0, body: null, status(code: number) { this.code = code; return this }, json(body: any) { this.body = body } }
  return res
}

const baseAsset = { id: '2f8c2c58-6d9c-4a48-8a3b-8f9a1d1a6a01', kind: 'video', storage_path: 'owner-test/clip.mp4', status: 'uploading' }
const baseTask = { id: '9bd9b2f4-0c98-4c5a-8bd5-6a4a0c1d6c02', storage_path: 'owner-test/clip.mp4', bytes_total: 1024 }

let state: State
beforeEach(() => {
  runtime.waited = []
  state = { asset: { ...baseAsset }, task: { ...baseTask }, objects: [{ name: 'clip.mp4' }], updates: [] }
  runtime.auth = authFor(state)
})

async function call(body: Record<string, unknown>) {
  const { default: handler } = await import('../api/upload/complete')
  const res = response()
  await handler({ method: 'POST', body: { taskId: baseTask.id, assetId: baseAsset.id, status: 'ready', alt: 'Clip', ...body } } as any, res)
  return res
}

describe('upload complete handler (mock storage and database)', () => {
  it('moves ready videos into processing and starts the background transcode', async () => {
    const { processVideoAsset } = await import('../api/_lib/transcode.js')
    const res = await call({})
    expect(res.code).toBe(200)
    expect(res.body.status).toBe('processing')
    expect(state.updates).toEqual([
      { table: 'assets', patch: { status: 'processing', alt_text: 'Clip' } },
      { table: 'upload_tasks', patch: { status: 'processing', bytes_uploaded: 1024, error: null } },
    ])
    expect(runtime.waited).toHaveLength(1)
    expect(vi.mocked(processVideoAsset)).toHaveBeenCalledWith(expect.objectContaining({
      bucket: 'portfolio-media',
      asset: { id: baseAsset.id, storage_path: 'owner-test/clip.mp4' },
      task: { id: baseTask.id, bytes_total: 1024 },
    }))
    await runtime.waited[0]
  })

  it('keeps pending video records when the uploaded object is missing', async () => {
    state.objects = []
    const res = await call({})
    expect(res.code).toBe(422)
    expect(res.body.status).toBe('failed')
    expect(state.updates[0]).toEqual({ table: 'assets', patch: { status: 'failed', alt_text: 'Clip' } })
    expect(runtime.waited).toHaveLength(0)
  })

  it('finishes ready images without starting a transcode', async () => {
    state.asset = { ...baseAsset, kind: 'image' }
    state.task = { ...baseTask, storage_path: 'owner-test/clip.jpg' }
    state.asset.storage_path = 'owner-test/clip.jpg'
    state.objects = [{ name: 'clip.jpg' }]
    const res = await call({})
    expect(res.code).toBe(200)
    expect(res.body.status).toBe('ready')
    expect(state.updates[0]).toEqual({ table: 'assets', patch: { status: 'ready', alt_text: 'Clip' } })
    expect(runtime.waited).toHaveLength(0)
  })
})