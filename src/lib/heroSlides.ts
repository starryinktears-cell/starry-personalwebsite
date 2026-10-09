import type { HeroSlide, SiteSettings } from './types'
import { getCaseDefinitions } from '../data/caseCatalog'
import { contentText, siteImage } from './siteContent'

export const heroFields = [
  ['title', '大标题'], ['kicker', '分类 / 副标题'], ['intro', '简介'], ['metric', '主指标 / 关键词'],
  ['metricLabel', '指标含义'], ['note', '补充说明'], ['mediaNote', '图片说明'],
] as const

/** Snapshot legacy case content once, never link carousel images to case covers again. */
export function ensureHeroSlides(settings: SiteSettings): SiteSettings {
  if (settings.content?.heroSlides) return settings
  const content = { ...settings.content, texts: { ...settings.content?.texts }, images: { ...settings.content?.images } }
  const enabled = contentText(settings, 'cases.enabled', 'zh') === '1'
  const heroSlides: HeroSlide[] = [{ id: 'intro', visible: true }]
  for (const item of getCaseDefinitions(settings)) {
    heroSlides.push({ id: item.id, caseId: item.id, visible: enabled && contentText(settings, `case.${item.id}.visible`, 'zh') === '1' })
    content.images[`hero.${item.id}.cover`] = { ...siteImage(settings, `case.${item.id}.cover`) }
    for (const [key] of heroFields) content.texts[`hero.${item.id}.${key}`] = {
      zh: contentText(settings, `case.${item.id}.${key}`, 'zh'), en: contentText(settings, `case.${item.id}.${key}`, 'en'),
    }
  }
  return { ...settings, content: { ...content, heroSlides } }
}

export function addHeroSlide(settings: SiteSettings): SiteSettings {
  const next = ensureHeroSlides(settings)
  const id = `slide-${crypto.randomUUID()}`
  const content = next.content!
  return { ...next, content: { ...content,
    heroSlides: [...content.heroSlides!, { id, visible: false }],
    texts: { ...content.texts, [`hero.${id}.title`]: { zh: '新的首页轮播', en: 'A new story' } },
    images: { ...content.images, [`hero.${id}.cover`]: { src: next.heroImage, alt: next.heroAlt ?? '' , assetId: next.heroAssetId } },
  } }
}
