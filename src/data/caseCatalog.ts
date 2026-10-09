import type { SiteSettings } from '../lib/types'

export const caseDefinitions = [
  { id: 'creator', name: '自媒体 / B 站', image: 'portrait', title: ['个人 IP 与内容运营', 'Personal IP & content'], kicker: ['内容策划 / 社媒运营', 'CONTENT / SOCIAL'], intro: ['从内容定位到发布复盘，持续构建个人表达与观众连接。', 'Building a personal voice and audience connection, from positioning to publishing and review.'], metric: ['7 万', '70K'], metricLabel: ['B 站关注者', 'BILIBILI FOLLOWERS'], note: ['历史最高 8.3 万 · 单条视频最高播放 461 万', 'Peak 83K followers · Top video 4.61M views'], body: ['从选题、脚本、拍摄剪辑到封面、发布与互动，围绕鲜明的内容风格持续运营。将受众兴趣与商业需求结合，推进品牌合作内容。', 'A connected workflow of ideas, scripts, filming, editing, covers, publishing and engagement. Distinctive content shaped around audience interests and brand collaborations.'], outputs: ['账号定位与内容系列\n视频脚本、摄影与剪辑\n商业合作内容与互动运营', 'Channel positioning & content series\nScripts, photography & editing\nBrand collaborations & engagement'] },
  { id: 'plugin', name: 'AI 插件 / 可替换项目', image: 'studio', title: ['把审美语言变成工具', 'From visual intent to tools'], kicker: ['AI 修图插件 / 产品协作', 'AI RETOUCHING / PRODUCT'], intro: ['面向摄影师、修图师与视觉创作者的 AI 辅助修图项目。', 'An AI-assisted retouching project for photographers, retouchers and visual creators.'], metric: ['4000+', '4,000+'], metricLabel: ['项目用户', 'PROJECT USERS'], note: ['从需求理解到工作流验证', 'From needs to tested workflows'], body: ['围绕专业修图中的真实需求，梳理使用场景、提示词表达与工作流，配合开发进行测试与反馈迭代。', 'Understanding retouching needs, shaping usage scenarios, prompts and workflows, and collaborating on testing and iteration.'], outputs: ['需求梳理与场景定义\nAI 工作流测试\n使用反馈与迭代协作', 'Requirements & use cases\nAI workflow testing\nFeedback & iteration'] },
  { id: 'launch', name: '众筹 / 出海内容', image: 'camera', title: ['让产品价值被看见', 'Making product value visible'], kicker: ['OPENMOON / 众筹与出海', 'OPENMOON / GLOBAL LAUNCH'], intro: ['以产品卖点为线索，连接 AI 视觉、动态内容、社媒传播与独立站表达。', 'Connecting product messaging with AI visuals, motion, social content and e-commerce.'], metric: ['270%', '270%'], metricLabel: ['项目众筹目标达成率', 'PROJECT FUNDING GOAL REACHED'], note: ['Kickstarter 项目成果', 'A Kickstarter project result'], body: ['项目围绕产品使用场景与核心价值展开传播。内容涵盖卖点文案、产品场景图、AI 视觉动图与宣发素材，形成适配社媒和商品页面的内容表达。', 'Communication built around product scenarios and core benefits, with product copy, scene imagery, AI motion and promotional assets for social channels and commerce pages.'], outputs: ['产品卖点与传播文案\nAI 场景图与视觉动图\n社媒内容与独立站页面', 'Product messaging & copy\nAI scenes & motion\nSocial content & commerce pages'] },
  { id: 'wellness', name: '康养 / 品牌传播', image: 'hands', title: ['让品牌有温度', 'A brand with human warmth'], kicker: ['越秀康养 · 银幸 / 品牌内容', 'YUEXIU WELLNESS · YINXING'], intro: ['围绕真实人物与服务场景，用持续的内容表达提升品牌认知，建立信任感。', 'Building brand recognition and trust through consistent stories of people and everyday care.'], metric: ['品牌', 'BRAND'], metricLabel: ['内容与传播统筹', 'CONTENT & COMMUNICATION'], note: ['宣传片 · 活动 · 直播 · 课程', 'Films · Events · Livestreams · Courses'], body: ['统筹品牌内容规划、多项目账号传播与对外物料，串联宣传片、活动影像、课程和直播。让品牌表达贯穿日常运营与重要传播节点，以真实、清晰的内容呈现服务价值。', 'Coordinating brand content, multi-project channels and external materials across films, events, courses and livestreams. Connecting everyday communication with key moments to express service value clearly and authentically.'], outputs: ['品牌主题与内容计划\n宣传片、活动影像与直播\n课程制作与对外宣传物料', 'Brand themes & editorial planning\nFilms, event coverage & livestreams\nCourses & marketing materials'] },
  { id: 'travel', name: '旅居 / 影像与路线', image: 'mountainLake', title: ['在路上，重新看见生活', 'Life, seen along the way'], kicker: ['旅居策划 / 摄影 / 路线', 'TRAVEL / IMAGERY / ITINERARIES'], intro: ['将目的地、人和体验串联成旅居故事。这里留给沿途的照片、视频与路线记录。', 'Connecting destinations, people and experiences through travel stories, photographs, films and itineraries.'], metric: ['旅居', 'TRAVEL'], metricLabel: ['路线与体验策划', 'ITINERARIES & EXPERIENCES'], note: ['影像、目的地与路线持续更新', 'Stories, destinations and routes to come'], body: ['从人群需求与目的地特色出发，规划路线节奏、体验内容和影像主题。用照片呈现细节，用视频串联氛围，用路线记录具体的旅程。', 'Planning a route, its pace and experiences around people and places. Photography captures details, film connects the atmosphere, and an itinerary records the journey.'], outputs: ['目的地与旅居主题\n体验路线与行程安排\n摄影、视频与航拍记录', 'Destinations & travel themes\nItineraries & experiences\nPhotography, film & aerial stories'] },
  { id: 'education', name: '奶糖派 / 垂类 IP', image: 'window', title: ['把专业内容讲得亲近', 'Making knowledge approachable'], kicker: ['奶糖派 / 有胸青年', 'NAITANGPAI / EDUCATIONAL IP'], intro: ['围绕女性科普建立垂类内容表达，让专业知识更易理解，也更愿意被分享。', 'A focused educational voice that makes knowledge easier to understand and share.'], metric: ['1.3 万', '13K'], metricLabel: ['账号从 0 到 1 积累关注者', 'FOLLOWERS BUILT FROM ZERO'], note: ['选题 · 脚本 · 制作 · 互动', 'Topics · Scripts · Production · Community'], body: ['从内容定位、选题脚本到拍摄剪辑、封面发布，建立统一的表达风格。结合评论与问答反馈持续调整选题，连接品牌内容和用户日常关心的问题。', 'Connecting positioning, topics and scripts with production, covers and publishing. Consistent storytelling refined through comments and questions, linking brand content with everyday audience concerns.'], outputs: ['科普选题与文案脚本\n视频制作与封面设计\n账号运营与用户问答', 'Educational topics & scripts\nVideo production & covers\nChannel operations & Q&A'] },
] as const

export const caseTextDefaults: Record<string, { zh: string; en: string; group: string }> = {}
const add = (key: string, values: readonly string[]) => { caseTextDefaults[key] = { zh: values[0], en: values[1], group: '案例' } }
add('cases.enabled', ['', ''])
add('cases.heading', ['策划与项目实践', 'Strategy & selected projects'])
add('cases.intro', ['内容、品牌与产品之间，是持续把想法做出来的实践。', 'Work across content, brands and products, bringing ideas into practice.'])
for (const item of caseDefinitions) {
  add(`case.${item.id}.adminName`, [item.name, item.name])
  const prefix = `case.${item.id}`
  for (const field of ['title', 'kicker', 'intro', 'metric', 'metricLabel', 'note', 'body', 'outputs'] as const) add(`${prefix}.${field}`, item[field])
  add(`${prefix}.visible`, ['1', '1'])
  add(`${prefix}.mediaNote`, ['展示配图，待替换为项目素材', 'Illustrative imagery · project materials to follow'])
  add(`${prefix}.linkLabel`, ['查看项目链接', 'Visit project'])
  add(`${prefix}.linkUrl`, ['', ''])
  for (const i of [0, 1]) {
    add(`${prefix}.video.${i}.title`, [i === 0 ? '视频展示' : '更多影像', i === 0 ? 'Featured video' : 'More stories'])
    add(`${prefix}.video.${i}.url`, ['', ''])
  }
}
for (const i of [0, 1, 2]) {
  add(`case.travel.route.${i}.title`, [`路线站点 ${i + 1} · 待补充`, `Stop ${i + 1} · Coming soon`])
  add(`case.travel.route.${i}.body`, ['目的地、行程安排与体验内容将在这里补充。', 'Destinations, itinerary details and experiences will be added here.'])
  add(`case.travel.route.${i}.url`, ['', ''])
}

export const caseImageSlots = Object.fromEntries(caseDefinitions.flatMap(item => ['cover', 'photo1', 'photo2'].map((slot, i) => [`case.${item.id}.${slot}`, { label: `案例 / ${item.name} / ${i === 0 ? '封面' : `配图 ${i}`}`, src: `/images/${i === 0 ? item.image : i === 1 ? 'field' : 'shore'}.webp`, alt: `${item.name}展示配图，待替换` }])))

/** Stable IDs keep links and media attached when an editor renames a case. */
export function getCaseDefinitions(settings: SiteSettings): { id: string; name: string }[] {
  return [...caseDefinitions, ...(settings.content?.customCases ?? [])].map(item => ({
    id: item.id, name: settings.content?.texts[`case.${item.id}.adminName`]?.zh.trim() || item.name,
  }))
}

export function addCustomCase(settings: SiteSettings, name: string, id = `custom-${crypto.randomUUID()}`): SiteSettings {
  if ((settings.content?.customCases?.length ?? 0) >= 18) throw new Error('最多可添加 18 个自定义案例。')
  const fields = { visible: '0', adminName: name, title: name, kicker: '', intro: '', metric: '', metricLabel: '', note: '', body: '', outputs: '', mediaNote: '', linkLabel: '', linkUrl: '', 'video.0.title': '视频 1', 'video.0.url': '', 'video.1.title': '视频 2', 'video.1.url': '' }
  const texts = Object.fromEntries(Object.entries(fields).map(([key, value]) => [`case.${id}.${key}`, { zh: value, en: value }]))
  const images = Object.fromEntries(['cover', 'photo1', 'photo2'].map(slot => [`case.${id}.${slot}`, { src: '/images/field.webp', alt: '待替换的案例配图', assetId: null }]))
  return { ...settings, content: { ...settings.content, customCases: [...(settings.content?.customCases ?? []), { id, name }], texts: { ...settings.content?.texts, ...texts }, images: { ...settings.content?.images, ...images } } }
}

export function safeExternalUrl(value: string) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : '' } catch { return '' }
}

export function safeSocialUrl(value: string) {
  if (value === '#') return value // Existing placeholder accounts remain editable.
  try {
    const url = new URL(value)
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''
  } catch { return '' }
}
