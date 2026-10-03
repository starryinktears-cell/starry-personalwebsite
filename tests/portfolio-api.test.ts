import { describe, expect, it } from 'vitest'
import { normalizeProject, normalizeSettings } from '../src/lib/portfolioApi'

describe('portfolio API mappers', () => {
  it('maps Supabase project rows and keeps asset order and cover metadata', () => {
    const project = normalizeProject({ id: 'p-1', slug: 'story', title: 'Story', status: 'published', category: 'Film', cover_asset_id: 'a-2', project_assets: [{ position: 2, asset: { id: 'a-1', kind: 'image', name: 'one', storage_path: 'one', status: 'ready', alt_text: 'one' } }, { position: 1, asset: { id: 'a-2', kind: 'video', name: 'two', storage_path: 'two', status: 'ready', alt_text: 'two' } }] })
    expect(project.assets.map((asset) => asset.id)).toEqual(['a-2', 'a-1'])
    expect(project.cover).toBe('two')
    expect(project.coverAlt).toBe('two')
  })

  it('accepts database snake_case settings while preserving defaults', () => {
    const settings = normalizeSettings({ site_name: 'QA', contact_email: 'qa@example.com', hero_title: 'A title', social_links: [{ label: 'Site', href: '/' }] })
    expect(settings.siteName).toBe('QA')
    expect(settings.contactEmail).toBe('qa@example.com')
    expect(settings.heroSubtitle).toBe('Photography / Film / Stories')
    expect(settings.socialLinks[0].label).toBe('Site')
  })
})
