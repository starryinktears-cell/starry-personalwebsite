import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Asset } from '../src/lib/types'
import { waitForAssetReady } from '../src/lib/portfolioApi'

const asset = (status: Asset['status']): Asset => ({ id: 'a-1', kind: 'video', name: 'clip.mp4', src: 'https://example.com/clip.mp4', alt: '', status, width: 0, height: 0, size: '', createdAt: '2026-10-10T00:00:00.000Z' })

describe('waitForAssetReady', () => {
  afterEach(() => vi.useRealTimers())

  it('polls until the processing asset becomes ready', async () => {
    vi.useFakeTimers()
    const load = vi.fn().mockResolvedValueOnce([asset('processing')]).mockResolvedValueOnce([{ ...asset('ready'), src: 'https://example.com/clip-h264.mp4' }])
    const promise = waitForAssetReady('a-1', { intervalMs: 1000, timeoutMs: 10000, load })
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(1000)
    await expect(promise).resolves.toMatchObject({ id: 'a-1', status: 'ready', src: 'https://example.com/clip-h264.mp4' })
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('returns a failed asset instead of throwing', async () => {
    vi.useFakeTimers()
    const load = vi.fn().mockResolvedValue([asset('failed')])
    const promise = waitForAssetReady('a-1', { intervalMs: 1000, timeoutMs: 10000, load })
    await vi.advanceTimersByTimeAsync(1000)
    await expect(promise).resolves.toMatchObject({ status: 'failed' })
  })

  it('throws when processing never finishes before the timeout', async () => {
    vi.useFakeTimers()
    const load = vi.fn().mockResolvedValue([asset('processing')])
    const promise = waitForAssetReady('a-1', { intervalMs: 1000, timeoutMs: 3000, load })
    const assertion = expect(promise).rejects.toThrow('媒体处理超时')
    await vi.advanceTimersByTimeAsync(10000)
    await assertion
  })
})