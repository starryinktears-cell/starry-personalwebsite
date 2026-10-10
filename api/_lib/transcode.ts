import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join, posix } from 'node:path'
import { promisify } from 'node:util'
import ffmpegStatic from 'ffmpeg-static'
import type { SupabaseClient } from '@supabase/supabase-js'

const run = promisify(execFile)

export type MediaInfo = { durationMs: number; width: number; height: number }

export function parseMediaInfo(stderr: string): MediaInfo | null {
  const duration = stderr.match(/Duration:\s*(\d+):(\d{2}):(\d{2}(?:\.\d+)?)/)
  const videoLine = stderr.split('\n').find((line) => line.includes('Video:'))
  const size = videoLine?.match(/(\d{2,5})x(\d{2,5})/)
  if (!duration || !size) return null
  const durationMs = ((Number(duration[1]) * 60 + Number(duration[2])) * 60 + Number(duration[3])) * 1000
  return { durationMs: Math.round(durationMs), width: Number(size[1]), height: Number(size[2]) }
}

export function resolveFfmpegBinary() {
  const binary = process.env.FFMPEG_BIN || ffmpegStatic
  if (!binary || !existsSync(binary)) throw new Error('ffmpeg 二进制不可用：请确认 ffmpeg-static 已安装，或配置 FFMPEG_BIN。')
  return binary
}

async function probeVideo(ffmpegBinary: string, inputPath: string) {
  let stderr = ''
  try {
    const result = await run(ffmpegBinary, ['-hide_banner', '-nostdin', '-i', inputPath], { maxBuffer: 16 * 1024 * 1024, timeout: 60_000 })
    stderr = result.stderr
  } catch (error) {
    stderr = (error as { stderr?: string }).stderr ?? ''
  }
  const info = parseMediaInfo(stderr)
  if (!info) throw new Error('无法解析视频信息，请确认文件是有效的 MP4 或 MOV。')
  return info
}

export async function transcodeVideo({ ffmpegBinary, inputPath, workDir }: { ffmpegBinary: string; inputPath: string; workDir: string }) {
  const videoPath = join(workDir, 'output.mp4')
  const posterPath = join(workDir, 'poster.jpg')
  const info = await probeVideo(ffmpegBinary, inputPath)
  const seekSeconds = info.durationMs >= 2000 ? 1 : Math.max(0, info.durationMs / 4000)
  await run(ffmpegBinary, ['-y', '-hide_banner', '-nostdin', '-ss', seekSeconds.toFixed(3), '-i', inputPath, '-frames:v', '1', '-q:v', '3', '-an', posterPath], { maxBuffer: 16 * 1024 * 1024, timeout: 120_000 })
  await run(ffmpegBinary, ['-y', '-hide_banner', '-nostdin', '-i', inputPath, '-vf', "scale='min(1280,iw)':-2", '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', videoPath], { maxBuffer: 16 * 1024 * 1024, timeout: 240_000 })
  return { videoPath, posterPath, info }
}

type VideoAssetRow = { id: string; storage_path: string }
type VideoTaskRow = { id: string; bytes_total: number | null }

function splitObjectPath(storagePath: string) {
  const folder = posix.dirname(storagePath)
  const filename = posix.basename(storagePath)
  const base = filename.slice(0, filename.length - extname(filename).length) || filename
  return { folder: folder === '.' ? '' : folder, base }
}

export async function processVideoAsset({ client, bucket, asset, task }: { client: SupabaseClient; bucket: string; asset: VideoAssetRow; task: VideoTaskRow }) {
  const workDir = await mkdtemp(join(tmpdir(), 'portfolio-transcode-'))
  try {
    const ffmpegBinary = resolveFfmpegBinary()
    const { data: source, error: downloadError } = await client.storage.from(bucket).download(asset.storage_path)
    if (downloadError || !source) throw new Error(`原视频下载失败：${downloadError?.message ?? '未找到文件'}`)
    const inputPath = join(workDir, `source${extname(asset.storage_path).toLowerCase() || '.mp4'}`)
    await writeFile(inputPath, Buffer.from(await source.arrayBuffer()))

    const { videoPath, posterPath, info } = await transcodeVideo({ ffmpegBinary, inputPath, workDir })
    const [videoBuffer, posterBuffer] = await Promise.all([readFile(videoPath), readFile(posterPath)])
    const { folder, base } = splitObjectPath(asset.storage_path)
    const videoObject = folder ? posix.join(folder, `${base}-h264.mp4`) : `${base}-h264.mp4`
    const posterObject = folder ? posix.join(folder, `${base}-poster.jpg`) : `${base}-poster.jpg`

    const videoUpload = await client.storage.from(bucket).upload(videoObject, videoBuffer, { contentType: 'video/mp4', upsert: true })
    if (videoUpload.error) throw new Error(`转码视频保存失败：${videoUpload.error.message}`)
    const posterUpload = await client.storage.from(bucket).upload(posterObject, posterBuffer, { contentType: 'image/jpeg', upsert: true })
    if (posterUpload.error) throw new Error(`封面帧保存失败：${posterUpload.error.message}`)

    const { error: assetError } = await client.from('assets').update({
      storage_path: videoObject, poster_path: posterObject, mime_type: 'video/mp4', byte_size: videoBuffer.byteLength,
      width: info.width, height: info.height, duration_ms: info.durationMs, status: 'ready', processing_error: null,
    }).eq('id', asset.id)
    if (assetError) throw new Error(`媒体记录更新失败：${assetError.message}`)
    await client.from('upload_tasks').update({ status: 'ready', bytes_uploaded: task.bytes_total ?? videoBuffer.byteLength, error: null }).eq('id', task.id)
    // The original upload is replaced by the transcoded file only after the record points at it.
    await client.storage.from(bucket).remove([asset.storage_path])
    return { ok: true as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[transcode] failed', asset.id, message)
    try { await client.from('assets').update({ status: 'failed', processing_error: message.slice(0, 1000) }).eq('id', asset.id) } catch { /* keep original error */ }
    try { await client.from('upload_tasks').update({ status: 'failed', error: message.slice(0, 1000) }).eq('id', task.id) } catch { /* best effort */ }
    return { ok: false as const, error: message }
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}