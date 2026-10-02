import { describe, expect, it } from 'vitest'
import { validateProjectForPublish } from '../src/lib/validation'
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
