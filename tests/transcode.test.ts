/* eslint-disable @typescript-eslint/no-explicit-any */
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import ffmpegStatic from 'ffmpeg-static'
import { parseMediaInfo, processVideoAsset, transcodeVideo } from '../api/_lib/transcode.js'

const run = promisify(execFile)
const ffmpegBinary = typeof ffmpegStatic === 'string' && existsSync(ffmpegStatic) ? ffmpegStatic : null
const storagePath = 'owner-test/1f5cf69e-3f8c-4c0f-9c9a-2d3f5f0d0b1a.mp4'

function stubClient(options: { download?: { data: any; error: any }; updateError?: any }) {
  const calls = { uploads: [] as { path: string; size: number; contentType: string }[], removed: [] as string[], assetUpdates: [] as any[], taskUpdates: [] as any[] }
  const client = {
    storage: {
      from: () => ({
        download: async () => options.download ?? { data: null, error: { message: 'not found' } },
        upload: async (path: string, buffer: Buffer, opts: { contentType: string }) => { calls.uploads.push({ path, size: buffer.length, contentType: opts.contentType }); return { data: { path }, error: null } },
        remove: async (paths: string[]) => { calls.removed.push(...paths); return { data: null, error: null } },
      }),
    },
    from: (table: string) => ({
      update: (patch: any) => {
        if (table === 'assets') calls.assetUpdates.push(patch)
        else calls.taskUpdates.push(patch)
        return { eq: () => ({ eq: async () => ({ error: options.updateError ?? null }) }) }
      },
    }),
  }
  return { client: client as unknown as SupabaseClient, calls }
}

describe('parseMediaInfo', () => {
  it('reads duration and dimensions from a real ffmpeg probe output', () => {
    const info = parseMediaInfo(`
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'test.mp4':
  Duration: 00:00:01.00, start: 0.000000, bitrate: 146 kb/s
  Stream #0:0[0x1](und): Video: h264 (High) (avc1 / 0x31637661), yuv420p(progressive), 320x240 [SAR 1:1 DAR 4:3], 56 kb/s, 24 fps, 24 tbr, 12288 tbn (default)
  Stream #0:1[0x2](und): Audio: aac (LC) (mp4a / 0x6134706D), 44100 Hz, mono, fltp, 70 kb/s (default)
`)
    expect(info).toEqual({ durationMs: 1000, width: 320, height: 240 })
  })

  it('returns null when the output has no video stream', () => {
    expect(parseMediaInfo('Duration: 00:00:01.00\n  Stream #0:0: Audio: aac, 44100 Hz')).toBeNull()
  })
})

describe.skipIf(!ffmpegBinary)('ffmpeg video pipeline (real binary, tiny generated clip)', () => {
  let workDir = ''
  let demoVideo: Buffer = Buffer.alloc(0)

  beforeAll(async () => {
    workDir = await mkdtemp(join(tmpdir(), 'portfolio-transcode-test-'))
    const source = join(workDir, 'demo.mp4')
    await run(ffmpegBinary!, ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc=duration=1:size=320x240:rate=24', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', source])
    demoVideo = await readFile(source)
  })

  afterAll(async () => { if (workDir) await rm(workDir, { recursive: true, force: true }) })

  it('transcodes to a web ready mp4 and extracts a poster frame', async () => {
    const pipelineDir = await mkdtemp(join(tmpdir(), 'portfolio-transcode-pipeline-'))
    try {
      const input = join(pipelineDir, 'input.mp4')
      await writeFile(input, demoVideo)
      const result = await transcodeVideo({ ffmpegBinary: ffmpegBinary!, inputPath: input, workDir: pipelineDir })
      expect(result.info.width).toBe(320)
      expect(result.info.height).toBe(240)
      expect(result.info.durationMs).toBeGreaterThanOrEqual(900)
      expect(result.info.durationMs).toBeLessThanOrEqual(1100)
      expect((await readFile(result.videoPath)).byteLength).toBeGreaterThan(0)
      expect((await readFile(result.posterPath)).byteLength).toBeGreaterThan(0)
    } finally { await rm(pipelineDir, { recursive: true, force: true }) }
  })

  it('stores the transcoded video and poster and points the asset record at them', async () => {
    const download = { data: { arrayBuffer: async () => Uint8Array.from(demoVideo).buffer }, error: null }
    const { client, calls } = stubClient({ download })
    const result = await processVideoAsset({ client, bucket: 'portfolio-media', asset: { id: 'asset-1', storage_path: storagePath }, task: { id: 'task-1', bytes_total: demoVideo.byteLength } })
    expect(result.ok).toBe(true)
    expect(calls.uploads.map(call => call.path)).toEqual(['owner-test/1f5cf69e-3f8c-4c0f-9c9a-2d3f5f0d0b1a-h264.mp4', 'owner-test/1f5cf69e-3f8c-4c0f-9c9a-2d3f5f0d0b1a-poster.jpg'])
    expect(calls.uploads.map(call => call.contentType)).toEqual(['video/mp4', 'image/jpeg'])
    expect(calls.removed).toEqual([storagePath])
    expect(calls.assetUpdates[0]).toMatchObject({ storage_path: 'owner-test/1f5cf69e-3f8c-4c0f-9c9a-2d3f5f0d0b1a-h264.mp4', poster_path: 'owner-test/1f5cf69e-3f8c-4c0f-9c9a-2d3f5f0d0b1a-poster.jpg', mime_type: 'video/mp4', width: 320, height: 240, status: 'ready', processing_error: null })
    expect(calls.assetUpdates[0].byte_size).toBeGreaterThan(0)
    expect(calls.assetUpdates[0].duration_ms).toBeGreaterThanOrEqual(900)
    expect(calls.taskUpdates[0]).toMatchObject({ status: 'ready', error: null, bytes_uploaded: demoVideo.byteLength })
  })

  it('marks the asset and task as failed when the source cannot be downloaded', async () => {
    const { client, calls } = stubClient({ download: { data: null, error: { message: 'not found' } } })
    const result = await processVideoAsset({ client, bucket: 'portfolio-media', asset: { id: 'asset-2', storage_path: storagePath }, task: { id: 'task-2', bytes_total: 100 } })
    expect(result.ok).toBe(false)
    expect(calls.uploads).toHaveLength(0)
    expect(calls.removed).toHaveLength(0)
    expect(calls.assetUpdates[0]).toMatchObject({ status: 'failed' })
    expect(calls.assetUpdates[0].processing_error).toContain('原视频下载失败')
    expect(calls.taskUpdates[0]).toMatchObject({ status: 'failed' })
  })
})