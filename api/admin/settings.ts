import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { authenticateRequest, json } from '../_lib/supabase.js'
import { serializeSettings } from '../_lib/portfolio.js'

const imageSource = z.string().max(2000).refine(value => value === '' || /^\/images\/[a-zA-Z0-9_.-]+$/.test(value) || /^https:\/\//i.test(value), 'Use a bundled image or HTTPS URL')
const imageSchema = z.object({ src: imageSource, alt: z.string().max(500), assetId: z.string().uuid().nullable().optional() })
const schema = z.object({ theme: z.object({ footerColor: z.string().regex(/^#[0-9a-f]{6}$/i).optional(), followHero: z.boolean().optional() }).optional(), siteName: z.string().trim().min(1).max(120), shortBio: z.string().max(2000).optional(), contactEmail: z.string().email().max(320), heroTitle: z.string().max(500), heroSubtitle: z.string().max(240), heroImage: imageSource, heroAssetId: z.string().uuid().nullable().optional(), heroAlt: z.string().max(500).optional(), content: z.object({ texts: z.record(z.string().max(100), z.object({ en: z.string().max(5000), zh: z.string().max(5000) })).refine(value => Object.keys(value).length <= 150), images: z.record(z.string().max(100), imageSchema).refine(value => Object.keys(value).length <= 30) }).optional(), accent: z.string().regex(/^#[0-9a-f]{6}$/i), socialLinks: z.array(z.object({ label: z.string().max(40), href: z.string().max(1000).refine(value => value === '#' || /^(https?:\/\/|mailto:)/i.test(value), 'Invalid social URL') })).max(10) })

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
  const ids = [...new Set([heroAssetId, ...Object.values(content.images).map((image: { assetId?: string | null }) => image.assetId)].filter(Boolean))]
  if (ids.length) {
    const { data: owned, error: assetError } = await auth.supabase.from('assets').select('id').eq('owner_id', auth.user.id).eq('kind', 'image').eq('status', 'ready').in('id', ids)
    if (assetError || owned?.length !== ids.length) return json(res, 400, { error: 'site_image_not_owned_or_not_ready' })
  }
  if (!heroAssetId && /\/storage\/v1\/object\/sign\//.test(parsed.data.heroImage)) return json(res, 400, { error: 'select_private_image_from_library' })
  if (Object.values(content.images).some((image: { src: string; assetId?: string | null }) => !image.assetId && /\/storage\/v1\/object\/sign\//.test(image.src))) return json(res, 400, { error: 'select_private_image_from_library' })
  const persistentImages = Object.fromEntries(Object.entries(content.images).map(([key, image]) => [key, { ...(image as object), src: (image as { assetId?: string }).assetId ? '' : (image as { src: string }).src }]))
  const { data, error } = await auth.supabase.from('site_settings').upsert({ owner_id: auth.user.id, site_name: parsed.data.siteName, short_bio: parsed.data.shortBio ?? '', contact_email: parsed.data.contactEmail, hero_title: parsed.data.heroTitle, hero_subtitle: parsed.data.heroSubtitle, hero_asset_id: heroAssetId, accent: parsed.data.accent, social_links: parsed.data.socialLinks, seo: { ...(current?.seo ?? {}), ...(parsed.data.theme ? { theme: parsed.data.theme } : {}), hero_image: heroAssetId ? '' : parsed.data.heroImage, hero_alt: parsed.data.heroAlt ?? current?.seo?.hero_alt ?? '', content: { ...content, images: persistentImages } } }).select('*').single()
  if (error) return json(res, 400, { error: 'update_failed', detail: error.message })
  return json(res, 200, { settings: await serializeSettings(data, auth.supabase) })
}
