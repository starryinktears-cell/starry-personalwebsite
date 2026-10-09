import type { SiteSettings } from '../lib/types'

// Dates and responsibilities checked against the owner's supplied 2026 portfolio.
export const experienceDefaults = [
  { id: 'openmoon', date: ['2025.04 — 2026.06', '2025.04 — 2026.06'], company: ['Openmoon · 开月科技', 'Openmoon'], role: ['海内外内容运营 / 独立站运营', 'Content & e-commerce operations'], description: ['围绕产品卖点规划内容与视觉表达，协同海外社媒、KOL 合作、众筹传播与独立站运营，让品牌叙事与用户体验保持一致。', 'Product storytelling and visual content across social channels, creator collaborations, crowdfunding communications and e-commerce.'] },
  { id: 'wellness', date: ['2022.09 — 2025.03', '2022.09 — 2025.03'], company: ['越秀康养 · 银幸', 'Yuexiu Senior Living · Yinxing'], role: ['品牌传播 / 内容统筹', 'Brand communications & content'], description: ['统筹多个康养项目的品牌内容，以宣传影像、社交内容、直播、课程与旅居策划，传达有温度的品牌体验。', 'Brand films, social content, live broadcasts, courses and travel planning for senior living projects, with a human approach to brand experience.'] },
  { id: 'studio', date: ['2021.08 — 2021.11', '2021.08 — 2021.11'], company: ['内容工作室', 'Content studio'], role: ['电商视频拍摄 / 剪辑', 'E-commerce video production'], description: ['围绕电商场景完成短视频拍摄与后期制作，将产品信息转化为清晰、适合平台传播的视觉内容。', 'Filming and editing short-form e-commerce videos, translating product information into clear platform-ready stories.'] },
  { id: 'naitang', date: ['2019.04 — 2020.12', '2019.04 — 2020.12'], company: ['奶糖派', 'Naitangpai'], role: ['新媒体内容 / 影像制作 / 运营', 'Social content & video production'], description: ['参与垂类 IP 从选题、文案到拍摄、剪辑与发布的内容全流程，结合社区互动持续优化表达。', 'Content planning, writing, filming, editing and publishing for a specialist creator brand, informed by community feedback.'] },
  { id: 'independent', date: ['2016 — 至今', '2016 — Present'], company: ['独立内容实践', 'Independent practice'], role: ['个人 IP / 内容与商业合作', 'Creator brand & collaborations'], description: ['持续经营个人内容与观众关系，结合摄影、视频、品牌合作与衍生品实践，连接创作表达与商业价值。', 'Building an independent voice through photography, video, brand collaborations and merchandise, connecting creative expression with commercial practice.'] },
]
export const experienceTexts: Record<string, { zh: string; en: string; group: string }> = {
  'experience.heading': { zh: '工作经历', en: 'Experience', group: '关于' },
}
for (const item of experienceDefaults) {
  experienceTexts[`experience.${item.id}.visible`] = { zh: '1', en: '1', group: '关于' }
  for (const key of ['date', 'company', 'role', 'description'] as const) experienceTexts[`experience.${item.id}.${key}`] = { zh: item[key][0], en: item[key][1], group: '关于' }
}
export function experienceItems(settings: SiteSettings) { return settings.content?.experienceItems ?? experienceDefaults.map(({ id }) => ({ id })) }
export function addExperience(settings: SiteSettings): SiteSettings {
  const id = `entry-${crypto.randomUUID()}`
  return { ...settings, content: { ...settings.content, images: settings.content?.images ?? {}, texts: { ...settings.content?.texts, [`experience.${id}.visible`]: { zh: '0', en: '0' }, [`experience.${id}.company`]: { zh: '新的工作经历', en: 'New experience' } }, experienceItems: [...experienceItems(settings), { id }] } }
}
