import type { SiteSettings, SiteImage } from './types'
import type { Language } from './i18n'
import { editableTexts } from './siteContentCatalog'
import { siteSettings as defaults } from './mockData'
import { caseImageSlots } from '../data/caseCatalog'

export { editableTexts, contentSections, contentPages } from './siteContentCatalog'
export const imageSlots: Record<string, { label: string; src: string; alt: string }> = {
  ...caseImageSlots,
  portrait: { label: '首页 / 摄影配图 1', src: '/images/portrait.webp', alt: '肖像摄影' },
  window: { label: '首页 / 摄影配图 2', src: '/images/window.webp', alt: '窗边的光' },
  dusk: { label: '首页 / 影像配图 1', src: '/images/dusk.webp', alt: '暮色' },
  mountainLake: { label: '首页 / 影像配图 2', src: '/images/mountainLake.webp', alt: '山间湖泊' },
  olive: { label: '首页 / 品牌配图 1', src: '/images/olive.webp', alt: '品牌故事' },
  studio: { label: '首页 / 品牌配图 2', src: '/images/studio.webp', alt: '工作室' },
  forest: { label: '首页 / 编辑配图 1', src: '/images/forest.webp', alt: '森林' },
  shore: { label: '首页 / 编辑配图 2', src: '/images/shore.webp', alt: '海岸' },
  about: { label: '关于 / 肖像', src: '/images/about.webp', alt: '创作者肖像' },
  contact: { label: '联系 / 配图', src: '/images/contact.webp', alt: '工作室桌面' },
  serviceA: { label: '服务 / 主图', src: '/images/serviceA.webp', alt: '拍摄工作台' },
  serviceB: { label: '服务 / 配图', src: '/images/serviceB.webp', alt: '安静的建筑' },
}

export function contentText(settings: SiteSettings, key: string, language: Language) {
  const saved = settings.content?.texts[key]?.[language]
  if (saved !== undefined) return saved
  const legacy = key === 'home.heroTitle' ? 'heroTitle' : key === 'home.heroSubtitle' ? 'heroSubtitle' : key === 'AboutPage.92bac68a' ? 'shortBio' : null
  if (legacy && settings[legacy] !== defaults[legacy]) return settings[legacy]
  return editableTexts[key]?.[language] ?? ''
}

export function siteImage(settings: SiteSettings, key: string): SiteImage {
  return settings.content?.images[key] ?? imageSlots[key] ?? { src: '/images/field.webp', alt: '待替换的案例配图' }
}

// Only the bundled media have generated AVIF, thumbnail and blur derivatives.
export function imageVariants(src: string) {
  const names = ['hero', ...Object.keys(imageSlots), 'mountain', 'coastline', 'interior', 'field', 'camera', 'hands', 'meadow', 'road', 'desert', 'wave']
  const bundled = names.some(name => src === `/images/${name}.webp`)
  return bundled ? { srcSet: `${src.replace('.webp', '-900.webp')} 900w, ${src} 1800w`, lqip: src.replace('.webp', '-lqip.jpg') } : {}
}
