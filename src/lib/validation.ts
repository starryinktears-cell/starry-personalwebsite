import type { Project } from './types'

export const validateProjectForPublish = (project: Project): string[] => {
  const errors: string[] = []
  if (!project.title.trim()) errors.push('请填写项目标题')
  if (!project.slug.trim()) errors.push('请填写唯一 Slug')
  if (!project.category.trim()) errors.push('请选择分类')
  if (!project.cover) errors.push('请选择封面')
  if (!project.coverAlt.trim()) errors.push('请填写封面 Alt 文本')
  if (project.assets.filter((a) => a.status === 'ready').length === 0) errors.push('至少需要一个可用媒体')
  if (project.assets.some(asset => asset.status !== 'ready')) errors.push('请等待媒体上传完成或移除失败媒体')
  if (project.assets.some((a) => !a.alt.trim())) errors.push('所有媒体都需要 Alt 文本')
  return errors
}

export const maxMediaBytes = Math.min(2 * 1024 * 1024 * 1024, Math.max(1, Number(import.meta.env.VITE_MAX_MEDIA_BYTES) || 50 * 1024 * 1024))

export const isAllowedMedia = (file: File) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
  return allowed.includes(file.type) && file.size > 0 && file.size <= maxMediaBytes
}
