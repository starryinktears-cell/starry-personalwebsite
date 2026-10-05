/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import settingsHandler from '../api/admin/settings'
import publicHandler from '../api/projects'
import { serializeSettings } from '../api/_lib/portfolio'
import { normalizeSettings } from '../src/lib/portfolioApi'
import { editableTexts } from '../src/lib/siteContentCatalog'

const runtime = vi.hoisted(() => ({ auth: null as any, client: null as any }))
vi.mock('../api/_lib/supabase.js', () => ({
  authenticateRequest: async () => runtime.auth,
  getServerSupabase: () => runtime.client,
  json: (res: any, code: number, body: any) => res.status(code).json(body),
}))
const owner = 'd7e02365-db65-48cc-a93a-c632d6cea2fc'
const ownImage = 'b89947a0-cf35-4ebf-bf21-8dd6f0a480c5'
const otherImage = '4eba3260-c5ec-4027-948b-10683b80c000'
let tables: Record<string, any[]>
let signVersion: number
let queries: any[]
function query(table: string) {
  const filters: ((row: any) => boolean)[] = []
  const trace: any = { table, filters: [] }; queries.push(trace)
  let mutation: any
  const result = () => {
    if (mutation) { const previous = tables[table].find(row => row.owner_id === mutation.owner_id); if (previous) Object.assign(previous, mutation); else tables[table].push(mutation) }
    return { data: tables[table].filter(row => filters.every(filter => filter(row))), error: null }
  }
  const builder: any = {
    select: () => builder,
    eq: (key: string, value: any) => { trace.filters.push([key, value]); filters.push(row => row[key] === value); return builder },
    is: (key: string, value: any) => { filters.push(row => row[key] === value); return builder },
    in: (key: string, values: any[]) => { filters.push(row => values.includes(row[key])); return builder },
    order: () => builder,
    upsert: (value: any) => { mutation = value; return builder },
    maybeSingle: async () => { const value = result(); return { ...value, data: value.data[0] ?? null } },
    single: async () => { const value = result(); return { ...value, data: value.data[0] ?? null } },
    then: (resolve: any) => Promise.resolve(result()).then(resolve),
  }
  return builder
}
function response() { const res: any = { code: 0, body: null, status(code: number) { this.code = code; return this }, json(body: any) { this.body = body } }; return res }
const basic = { siteName: '星光', shortBio: '真实简介', contactEmail: 'test@example.com', heroTitle: '真实首页', heroSubtitle: '摄影', heroImage: 'https://example.com/photo.webp', accent: '#7caed5', socialLinks: [] }
beforeEach(() => {
  signVersion = 1; queries = []
  tables = { site_settings: [{ owner_id: owner, seo: { existing_seo: 'preserved' }, hero_asset_id: null }], projects: [], assets: [
    { id: ownImage, owner_id: owner, kind: 'image', status: 'ready', storage_path: `${owner}/hero.webp`, alt_text: '海岸' },
    { id: otherImage, owner_id: 'different-owner', kind: 'image', status: 'ready', storage_path: 'different-owner/private.webp' },
  ] }
  runtime.client = { from: query, storage: { from: () => ({ createSignedUrl: async (path: string) => ({ data: { signedUrl: `https://storage.example/${path}?v=${signVersion}` }, error: null }) }) } }
  runtime.auth = { user: { id: owner }, supabase: runtime.client }
  process.env.SITE_OWNER_ID = owner
})

describe('Node settings API and public read contract (mock database)', () => {
  it('round trips the full page catalog and all screenshot image slots through the existing JSONB contract', async () => {
    const texts = Object.fromEntries(Object.entries(editableTexts).map(([key, value]) => [key, { en: value.en, zh: value.zh }]))
    texts['services.item.0.deliverables'] = { zh: '创意方案\n成片交付', en: 'Proposal\nFinal film' }
    const images = Object.fromEntries(['portrait', 'window', 'dusk', 'mountainLake', 'olive', 'studio', 'forest', 'shore', 'about', 'serviceA', 'serviceB'].map(key => [key, { assetId: ownImage, src: '', alt: `配图 ${key}` }]))
    const res = response()
    await settingsHandler({ method: 'PUT', body: { ...basic, content: { texts, images } } } as any, res)
    expect(res.code).toBe(200)
    const publicRes = response()
    await publicHandler({ method: 'GET' } as any, publicRes)
    expect(publicRes.code).toBe(200)
    const settings = normalizeSettings(publicRes.body.settings)
    expect(settings.content?.texts).toEqual(texts)
    expect(settings.content?.images.about).toMatchObject({ assetId: ownImage, alt: '配图 about', src: expect.stringContaining('storage.example') })
    expect(tables.site_settings[0].seo.existing_seo).toBe('preserved')
  })
  it('writes asset references, preserves existing SEO, and renews URLs on public reads', async () => {
    const res = response()
    await settingsHandler({ method: 'PUT', body: { ...basic, heroAssetId: ownImage, heroAlt: '海岸首屏', content: { texts: { 'home.heroTitle': { zh: '中文', en: 'English' } }, images: { portrait: { assetId: ownImage, src: 'https://old.example/expiring', alt: '肖像' } } } } } as any, res)
    expect(res.code).toBe(200)
    const saved = tables.site_settings[0]
    expect(saved.hero_asset_id).toBe(ownImage)
    expect(saved.seo).toMatchObject({ existing_seo: 'preserved', hero_image: '', content: { images: { portrait: { assetId: ownImage, src: '' } } } })
    signVersion = 2
    const publicRes = response()
    await publicHandler({ method: 'GET' } as any, publicRes)
    expect(publicRes.code).toBe(200)
    const mapped = normalizeSettings(publicRes.body.settings)
    expect(mapped.heroImage).toContain('?v=2')
    expect(mapped.content?.images.portrait.src).toContain('?v=2')
    expect(mapped.content?.texts['home.heroTitle'].zh).toBe('中文')
    expect(queries.filter(trace => trace.table === 'assets').every(trace => trace.filters.some(([key, value]: any[]) => key === 'owner_id' && value === owner))).toBe(true)
  })

  it('rejects another owner’s image without updating site settings', async () => {
    const res = response()
    await settingsHandler({ method: 'PUT', body: { ...basic, heroAssetId: otherImage } } as any, res)
    expect(res.code).toBe(400)
    expect(res.body.error).toBe('site_image_not_owned_or_not_ready')
    expect(tables.site_settings[0].hero_asset_id).toBeNull()
  })

  it('rejects incomplete uploads and executable social URLs', async () => {
    tables.assets[0].status = 'uploading'
    const mediaRes = response()
    await settingsHandler({ method: 'PUT', body: { ...basic, heroAssetId: ownImage } } as any, mediaRes)
    expect(mediaRes.code).toBe(400)
    const unsafeRes = response()
    await settingsHandler({ method: 'PUT', body: { ...basic, socialLinks: [{ label: 'Unsafe', href: 'javascript:alert(1)' }] } } as any, unsafeRes)
    expect(unsafeRes.code).toBe(400)
  })

  it('does not sign or disclose another owner’s asset during reads', async () => {
    const settings = await serializeSettings({ owner_id: owner, hero_asset_id: otherImage, seo: {} }, runtime.client)
    expect(settings!.hero_image).toBe('')
  })

  it('preserves a legacy hero asset if an older client omits the ID', async () => {
    tables.site_settings[0].hero_asset_id = ownImage
    const res = response()
    await settingsHandler({ method: 'PUT', body: basic } as any, res)
    expect(res.code).toBe(200)
    expect(tables.site_settings[0].hero_asset_id).toBe(ownImage)
  })

  it('requires authentication to edit', async () => {
    runtime.auth = null
    const res = response()
    await settingsHandler({ method: 'PUT', body: basic } as any, res)
    expect(res.code).toBe(401)
  })
})
