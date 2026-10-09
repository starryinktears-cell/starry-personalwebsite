import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest, json } from '../_lib/supabase.js'
import { serializeSettings } from '../_lib/portfolio.js'
import { caseDefinitions, safeSocialUrl, safeExternalUrl } from '../../src/data/caseCatalog.js'

const imageSource = z.string().max(2000).refine(value => value === '' || /^\/images\/[a-zA-Z0-9_.-]+$/.test(value) || /^https:\/\//i.test(value), 'Use a bundled image or HTTPS URL')
const imageSchema = z.object({ src: imageSource, alt: z.string().max(500), assetId: z.string().uuid().nullable().optional() })
const videoSchema = z.object({ src: z.string().max(2000).refine(value => value === '' || !!safeExternalUrl(value)), alt: z.string().max(500), assetId: z.string().uuid().nullable().optional() })
const color = z.string().regex(/^#[0-9a-f]{6}$/i)
const palette = z.object({ background: color.optional(), surface: color.optional(), section: color.optional(), footer: color.optional(), accent: color.optional(), glow: color.optional() })
const registryId = z.string().regex(/^[a-z0-9-]{1,70}$/)
const schema = z.object({ theme: z.object({ footerColor: z.string().regex(/^#[0-9a-f]{6}$/i).optional(), followHero: z.boolean().optional(), defaultMode: z.enum(['light', 'dark']).optional(), nightAtmosphere: z.boolean().optional(), ambientMotion: z.boolean().optional(), nightGlow: color.optional(), light: palette.optional(), dark: palette.optional() }).optional(), siteName: z.string().trim().min(1).max(120), shortBio: z.string().max(2000).optional(), contactEmail: z.string().email().max(320), heroTitle: z.string().max(500), heroSubtitle: z.string().max(240), heroImage: imageSource, heroAssetId: z.string().uuid().nullable().optional(), heroAlt: z.string().max(500).optional(), content: z.object({ heroSlides: z.array(z.object({ id: registryId, caseId: registryId.optional(), visible: z.boolean() })).max(25).refine(items => new Set(items.map(item => item.id)).size === items.length).optional(), experienceItems: z.array(z.object({ id: registryId })).max(30).refine(items => new Set(items.map(item => item.id)).size === items.length).optional(), customCases: z.array(z.object({ id: z.string().regex(/^custom-[a-z0-9-]{1,64}$/), name: z.string().trim().min(1).max(80) })).max(18).refine(items => new Set(items.map(item => item.id)).size === items.length && items.every(item => !caseDefinitions.some(original => original.id === item.id))).optional(), texts: z.record(z.string().max(100), z.object({ en: z.string().max(5000), zh: z.string().max(5000) })).refine(value => Object.keys(value).length <= 1000), videos: z.record(z.string().max(100), videoSchema).refine(value => Object.keys(value).length <= 64).optional(), images: z.record(z.string().max(100), imageSchema).refine(value => Object.keys(value).length <= 160) }).optional(), accent: z.string().regex(/^#[0-9a-f]{6}$/i), socialLinks: z.array(z.object({ label: z.string().trim().min(1).max(40), href: z.string().max(1000).refine(value => !!safeSocialUrl(value), 'Invalid social URL') })).max(10) })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await authenticateRequest(req)
  if (!auth) return json(res, 401, { error: 'unauthorized' })
  if (req.method === 'GET') {
    const { data, error } = await auth.supabase.from('site_settings').select('*').eq('owner_id', auth.user.id).maybeSingle()
    if (error) return json(res, 500, { error: 'query_failed', detail: error.message })
    return json(res, 200, { settings: await serializeSettings(data, auth.supabase) })
  }
  if (req.method !== 'PUT') return json(res, 405, { error: 'method_not_allowed' })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return json(res, 400, { error: 'invalid_input', fields: parsed.error.flatten().fieldErrors })
  const { data: current, error: readError } = await auth.supabase.from('site_settings').select('seo,hero_asset_id').eq('owner_id', auth.user.id).maybeSingle()
  if (readError) return json(res, 500, { error: 'query_failed', detail: readError.message })
  let heroAssetId = parsed.data.heroAssetId === undefined ? current?.hero_asset_id ?? null : parsed.data.heroAssetId
  // Recover the old URL-based representation when the image belongs to this owner.
  if (!heroAssetId && parsed.data.heroImage.startsWith(`${process.env.SUPABASE_URL}/storage/v1/object/sign/`)) {
    const prefix = `/storage/v1/object/sign/${process.env.MEDIA_BUCKET || 'portfolio-media'}/`
    const url = new URL(parsed.data.heroImage)
    if (url.pathname.startsWith(prefix)) {
      const { data: legacy } = await auth.supabase.from('assets').select('id').eq('owner_id', auth.user.id).eq('storage_path', decodeURIComponent(url.pathname.slice(prefix.length))).eq('kind', 'image').eq('status', 'ready').maybeSingle()
      if (!legacy) return json(res, 400, { error: 'site_image_not_owned' })
      heroAssetId = legacy.id
    }
  }
  const content: z.infer<NonNullable<typeof schema>>['content'] & object = parsed.data.content ?? current?.seo?.content ?? { texts: {}, images: {} }
  // A pre-case editor cannot intentionally modify custom-case fields it never loaded.
  if (parsed.data.content && parsed.data.content.customCases === undefined && current?.seo?.content?.customCases?.length) {
    const existing = current.seo.content
    const prefixes = existing.customCases.map((item: { id: string }) => `case.${item.id}.`)
    const keep = <T,>(values: Record<string, T>) => Object.fromEntries(Object.entries(values ?? {}).filter(([key]) => prefixes.some((prefix: string) => key.startsWith(prefix))))
    content.texts = { ...keep<{ zh: string; en: string }>(existing.texts), ...content.texts }
    content.images = { ...keep<z.infer<typeof imageSchema>>(existing.images), ...content.images }
  }
  // Older editors do not know these collections. Preserve their metadata and owned image references.
  const existingContent = current?.seo?.content
  for (const [registry, prefix] of [['heroSlides', 'hero.'], ['experienceItems', 'experience.']] as const) {
    if (content[registry] === undefined && existingContent?.[registry]) {
      Object.assign(content, { [registry]: existingContent[registry] })
      const keep = <T,>(values: Record<string, T>) => Object.fromEntries(Object.entries(values ?? {}).filter(([key]) => key.startsWith(prefix)))
      content.texts = { ...keep<{ zh: string; en: string }>(existingContent.texts), ...content.texts }
      content.images = { ...keep<z.infer<typeof imageSchema>>(existingContent.images), ...content.images }
    }
  }
  // Older clients must not erase video references they do not know about.
  const contentVideos: Record<string, z.infer<typeof videoSchema>> = content.videos ?? current?.seo?.content?.videos ?? {}
  const invalidLink = Object.entries(content.texts).some(([key, value]) => key.startsWith('case.') && /(?:Url|\.url)$/.test(key) && Object.values(value).some(url => url.trim() && !safeExternalUrl(url)))
  if (invalidLink) return json(res, 400, { error: 'invalid_case_link' })
  const videoIds = [...new Set(Object.values(contentVideos).map(video => video.assetId).filter(Boolean))]
  if (videoIds.length) {
    const { data: owned, error: videoError } = await auth.supabase.from('assets').select('id').eq('owner_id', auth.user.id).eq('kind', 'video').eq('status', 'ready').in('id', videoIds)
    if (videoError || owned?.length !== videoIds.length) return json(res, 400, { error: 'site_video_not_owned_or_not_ready' })
  }
  if (Object.values(contentVideos).some(video => !video.assetId && /\/storage\/v1\/object\/sign\//.test(video.src))) return json(res, 400, { error: 'select_private_video_from_library' })
  const persistentVideos = Object.fromEntries(Object.entries(contentVideos).map(([key, video]) => [key, { ...video, src: video.assetId ? '' : video.src }]))
  const ids = [...new Set([heroAssetId, ...Object.values(content.images).map((image: { assetId?: string | null }) => image.assetId)].filter(Boolean))]
  if (ids.length) {
    const { data: owned, error: assetError } = await auth.supabase.from('assets').select('id').eq('owner_id', auth.user.id).eq('kind', 'image').eq('status', 'ready').in('id', ids)
    if (assetError || owned?.length !== ids.length) return json(res, 400, { error: 'site_image_not_owned_or_not_ready' })
  }
  if (!heroAssetId && /\/storage\/v1\/object\/sign\//.test(parsed.data.heroImage)) return json(res, 400, { error: 'select_private_image_from_library' })
  if (Object.values(content.images).some((image: { src: string; assetId?: string | null }) => !image.assetId && /\/storage\/v1\/object\/sign\//.test(image.src))) return json(res, 400, { error: 'select_private_image_from_library' })
  const persistentImages = Object.fromEntries(Object.entries(content.images).map(([key, image]) => [key, { ...(image as object), src: (image as { assetId?: string }).assetId ? '' : (image as { src: string }).src }]))
  const { data, error } = await auth.supabase.from('site_settings').upsert({ owner_id: auth.user.id, site_name: parsed.data.siteName, short_bio: parsed.data.shortBio ?? '', contact_email: parsed.data.contactEmail, hero_title: parsed.data.heroTitle, hero_subtitle: parsed.data.heroSubtitle, hero_asset_id: heroAssetId, accent: parsed.data.accent, social_links: parsed.data.socialLinks, seo: { ...(current?.seo ?? {}), ...(parsed.data.theme ? { theme: { ...current?.seo?.theme, ...parsed.data.theme, ...(parsed.data.theme.light ? { light: { ...current?.seo?.theme?.light, ...parsed.data.theme.light } } : {}), ...(parsed.data.theme.dark ? { dark: { ...current?.seo?.theme?.dark, ...parsed.data.theme.dark } } : {}) } } : {}), hero_image: heroAssetId ? '' : parsed.data.heroImage, hero_alt: parsed.data.heroAlt ?? current?.seo?.hero_alt ?? '', content: { ...content, customCases: content.customCases ?? current?.seo?.content?.customCases ?? [], images: persistentImages, videos: persistentVideos } } }).select('*').single()
  if (error) return json(res, 400, { error: 'update_failed', detail: error.message })
  return json(res, 200, { settings: await serializeSettings(data, auth.supabase) })
}
