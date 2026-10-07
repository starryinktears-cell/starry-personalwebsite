import { describe, expect, it } from 'vitest'
import { isAllowedMedia, maxMediaBytes, validateProjectForPublish } from '../src/lib/validation'
import { projects } from '../src/lib/mockData'

describe('publish validation', () => {
  it('accepts a ready project with cover and alt text', () => {
    expect(validateProjectForPublish(projects[0])).toEqual([])
  })

  it('blocks drafts without a cover or alt text', () => {
    const errors = validateProjectForPublish({ ...projects[3], cover: '' })
    expect(errors).toContain('请选择封面')
    expect(errors).toContain('所有媒体都需要 Alt 文本')
  })
})

describe('media size limit', () => {
  it('accepts up to 5 MB and rejects the next byte for images and videos', () => {
    expect(maxMediaBytes).toBe(5242880)
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']) {
      expect(isAllowedMedia({ type, size: 5242880 } as File)).toBe(true)
      expect(isAllowedMedia({ type, size: 5242881 } as File)).toBe(false)
    }
  })
})
