import { experienceItems, experienceTexts } from '../data/workExperience'
import type { SiteSettings } from './types'
import { ensureHeroSlides, heroFields } from './heroSlides'
import { getCaseDefinitions, caseDefinitions, caseTextDefaults } from '../data/caseCatalog'
// Defaults preserve the cinematic design. Keys are stable across translations.
export const editableTexts: Record<string, { en: string; zh: string; group: string }> = {
  'footer.wordmark': { en: 'Starry Ink', zh: 'Starry Ink', group: '页脚' },
  "home.heroTitle": {"en": "Visual stories for a more conscious tomorrow", "zh": "为更有意识的明天，记录视觉故事", "group": "首页"},
  "home.heroSubtitle": {"en": "Photography / Film / Stories", "zh": "摄影 / 影像 / 故事", "group": "首页"},
  "PublicLayout.8c8738c1": {
    "en": "AVAILABLE FOR Q1 2027",
    "zh": "接受 2027 年第一季度合作",
    "group": "全站"
  },
  "Footer.ab353dfd": {
    "en": "Let's talk.",
    "zh": "聊聊你的故事。",
    "group": "页脚"
  },
  "Footer.48f0c1a7": {
    "en": "BACK TO TOP",
    "zh": "回到顶部",
    "group": "页脚"
  },
  "Footer.e7ef3aca": {
    "en": "LOCATION / TIME",
    "zh": "地点 / 时间",
    "group": "页脚"
  },
  "Footer.0137b9ad": {
    "en": "FOLLOW",
    "zh": "关注",
    "group": "页脚"
  },
  "Footer.fc8e4190": {
    "en": "PHOTOGRAPHY · FILM · STORIES",
    "zh": "摄影 · 影像 · 故事",
    "group": "页脚"
  },
  "Footer.2f158034": {
    "en": "PRIVACY",
    "zh": "隐私",
    "group": "页脚"
  },
  "HomePage.0cd34940": {
    "en": "A filmmaker standing above a quiet coastline",
    "zh": "站在宁静海岸线上的影像创作者",
    "group": "首页"
  },
  "HomePage.3e1e9eba": {
    "en": "VIEW WORK",
    "zh": "查看作品",
    "group": "首页"
  },
  "HomePage.a08934e1": {
    "en": "START A CONVERSATION",
    "zh": "开始合作",
    "group": "首页"
  },
  "HomePage.6d674d76": {
    "en": "SELECTED WORK",
    "zh": "精选作品",
    "group": "首页"
  },
  "HomePage.b23b30be": {
    "en": "The reel",
    "zh": "作品放映",
    "group": "首页"
  },
  "HomePage.2fbbf645": {
    "en": "CAPABILITIES",
    "zh": "能力",
    "group": "首页"
  },
  "HomePage.781240d4": {
    "en": "A small studio for considered stories, from first light to final frame.",
    "zh": "从第一束光到最后一帧，为有思考的故事而工作的创意工作室。",
    "group": "首页"
  },
  "HomePage.babb7af4": {
    "en": "MANIFESTO",
    "zh": "宣言",
    "group": "首页"
  },
  "HomePage.3daa76c6": {
    "en": "We make room for the quiet details — the light between places, the people behind the picture, and the stories that stay.",
    "zh": "我们为安静的细节留出空间——地方之间的光、画面背后的人，以及那些会留下来的故事。",
    "group": "首页"
  },
  "AboutPage.0b3509ca": {
    "en": "Creator portrait",
    "zh": "创作者肖像",
    "group": "关于"
  },
  "AboutPage.491a3827": {
    "en": "ABOUT THE STUDIO",
    "zh": "关于工作室",
    "group": "关于"
  },
  "AboutPage.4012d26e": {
    "en": "ABOUT",
    "zh": "关于",
    "group": "关于"
  },
  "AboutPage.d9b21b8c": {
    "en": "A quieter way to see the world.",
    "zh": "用更安静的方式看见这个世界。",
    "group": "关于"
  },
  "AboutPage.92bac68a": {
    "en": "I’m a photographer and filmmaker based in Shenzhen, creating images and moving stories around people, place and our shared environment. My work lives at the intersection of documentary truth and poetic imagination.",
    "zh": "我是一名驻深圳的摄影师与影像创作者，围绕人与地方以及我们共同的环境，创作图片与动态故事。我的作品位于纪实真实与诗意想象的交汇处。",
    "group": "关于"
  },
  "AboutPage.9bbb81cf": {
    "en": "SHENZHEN / CHINA — AVAILABLE FOR SELECT COMMISSIONS",
    "zh": "中国 / 深圳 — 接受精选项目合作",
    "group": "关于"
  },
  "AboutPage.47c6b96c": {
    "en": "SELECTED MOMENTS",
    "zh": "创作时间线",
    "group": "关于"
  },
  "AboutPage.17061835": {
    "en": "Photography, film and a little more time.",
    "zh": "摄影、影像，以及多一点时间。",
    "group": "关于"
  },
  "AboutPage.8fe18a3b": {
    "en": "The best frame is the one that leaves room for the person inside it.",
    "zh": "最好的画面，会为其中的人留出呼吸的空间。",
    "group": "关于"
  },
  "ServicesPage.f66a82e4": {
    "en": "CREATIVE SERVICES",
    "zh": "创意服务",
    "group": "服务"
  },
  "ServicesPage.72318c38": {
    "en": "SERVICES",
    "zh": "服务",
    "group": "服务"
  },
  "ServicesPage.c4a681de": {
    "en": "Photographing people, places and ideas. From concept to final frame, we create visual stories that move people.",
    "zh": "记录人与地方以及想法。从概念到最后一帧，创作能够打动人心的视觉故事。",
    "group": "服务"
  },
  "ServicesPage.fd6f5c1f": {
    "en": "A studio desk with production notes",
    "zh": "放着拍摄笔记的工作台",
    "group": "服务"
  },
  "ServicesPage.406f382f": {
    "en": "Sunlight across a quiet building",
    "zh": "阳光照过安静的建筑",
    "group": "服务"
  },
  "ServicesPage.b2bb0035": {
    "en": "OUR PROCESS",
    "zh": "合作流程",
    "group": "服务"
  },
  "ServicesPage.a08934e1": {
    "en": "START A CONVERSATION",
    "zh": "开始合作",
    "group": "服务"
  },
  "home.capability.0.title": {
    "en": "Photography",
    "zh": "摄影",
    "group": "首页"
  },
  "home.capability.1.title": {
    "en": "Film & motion",
    "zh": "影像与动态",
    "group": "首页"
  },
  "home.capability.2.title": {
    "en": "Brand stories",
    "zh": "品牌故事",
    "group": "首页"
  },
  "home.capability.3.title": {
    "en": "Editorial",
    "zh": "编辑内容",
    "group": "首页"
  },
  "home.capability.0.description": {
    "en": "Portraits, places and visual systems with a human point of view.",
    "zh": "以人的视角记录肖像、地方与视觉系统。",
    "group": "首页"
  },
  "home.capability.1.description": {
    "en": "Short films and moving stories made with a quiet, cinematic rhythm.",
    "zh": "以克制的电影节奏创作短片与动态故事。",
    "group": "首页"
  },
  "home.capability.2.description": {
    "en": "From first idea to final frame, a considered visual language for brands.",
    "zh": "从最初想法到最终画面，为品牌建立经过思考的视觉语言。",
    "group": "首页"
  },
  "home.capability.3.description": {
    "en": "Images that make room for curiosity, context and culture.",
    "zh": "让好奇心、语境与文化拥有空间的影像。",
    "group": "首页"
  },
  "home.stat.0.value": {
    "en": "12",
    "zh": "12",
    "group": "首页"
  },
  "home.stat.0.label": {
    "en": "COUNTRIES",
    "zh": "国家",
    "group": "首页"
  },
  "home.stat.1.value": {
    "en": "48",
    "zh": "48",
    "group": "首页"
  },
  "home.stat.1.label": {
    "en": "STORIES",
    "zh": "故事",
    "group": "首页"
  },
  "home.stat.2.value": {
    "en": "09",
    "zh": "09",
    "group": "首页"
  },
  "home.stat.2.label": {
    "en": "YEARS",
    "zh": "年",
    "group": "首页"
  },
  "site.location": {
    "en": "SHENZHEN",
    "zh": "深圳",
    "group": "全站"
  },
  "site.marquee": {
    "en": "A QUIETER WAY TO SEE THE WORLD · STORIES FOR A CONSCIOUS TOMORROW ·",
    "zh": "用更安静的方式看世界 · 为有意识的明天记录故事 ·",
    "group": "全站"
  }
}

// The editor and public pages share these keys; never key content by its current title.
const addText = (key: string, en: string, zh: string, group: string) => { editableTexts[key] = { en, zh, group } }
addText('site.clockCity', 'SHENZHEN', '深圳', '全站')
addText('site.clockZone', 'GMT+8', 'GMT+8', '全站')
addText('site.clockOffset', '+08:00', '+08:00', '联系')
addText('contact.eyebrow', 'GET IN TOUCH', '联系合作', '联系')
addText('contact.title', 'LET’S WORK TOGETHER', '让我们一起创作', '联系')
addText('contact.intro', 'Have a project in mind? Tell me what you are making, where it lives and what you want people to feel.', '有项目想法吗？告诉我你在创作什么、它将发生在哪里，以及你希望人们感受到什么。', '联系')
addText('contact.timeLabel', 'TIME / COORDINATES', '时间 / 坐标', '联系')
addText('contact.city', 'SHENZHEN', '深圳', '联系')
addText('contact.coordinates', '22°33′ N · 114°03′ E', '22°33′ N · 114°03′ E', '联系')
addText('contact.timeZoneLabel', 'GMT+8', 'GMT+8', '联系')
addText('contact.directLabel', 'DIRECT', '直接联系', '联系')
addText('contact.followLabel', 'FOLLOW', '关注', '联系')
addText('site.nav.work', 'WORK', '作品', '全站')
addText('site.nav.about', 'ABOUT', '关于', '全站')
addText('site.nav.services', 'SERVICES', '服务', '全站')
addText('site.nav.contact', 'CONTACT', '联系', '全站')
addText('home.scene', 'SCENE 01 — TAKE 03', 'SCENE 01 — TAKE 03', '首页')
addText('home.coordinates', 'N 22°33′ · E 114°03′', 'N 22°33′ · E 114°03′', '首页')
addText('home.exposure', 'ƒ/2.8 · 1/250 · ISO 400', 'ƒ/2.8 · 1/250 · ISO 400', '首页')
addText('home.frame', '24 FPS — 00:00:24', '24 FPS — 00:00:24', '首页')
addText('home.scroll', 'SCROLL', '向下浏览', '首页')
addText('home.signature', 'PLACES · PEOPLE · PERSPECTIVE', '地方 · 人物 · 视角', '首页')
const serviceDefaults = [
  ['Brand stories', '品牌故事', 'Authentic visual narratives for meaningful brands.', '为有意义的品牌创作真实的视觉叙事。', 'Concept and treatment\nArt direction\nCampaign stills', '概念与创意方案\n艺术指导\n品牌摄影'],
  ['Editorial', '编辑内容', 'Striking imagery for press, publications and culture.', '为媒体、出版与文化创作有力量的影像。', 'Portraits\nLocation stories\nPrint-ready selects', '人物肖像\n地方故事\n印刷精选'],
  ['Campaigns', '品牌企划', 'Bold visuals for bigger ideas.', '为更大的想法打造大胆的视觉。', 'Creative direction\nProduction\nDelivery toolkit', '创意指导\n制作执行\n交付工具包'],
  ['Film & motion', '影像与动态', 'Cinematic stories that inspire and endure.', '创作能够启发并长久留存的电影感故事。', 'Short films\nMotion systems\nSound and edit', '短片\n动态视觉系统\n声音与剪辑'],
]
serviceDefaults.forEach(([en, zh, descriptionEn, descriptionZh, itemsEn, itemsZh], index) => {
  addText(`services.item.${index}.title`, en, zh, '服务')
  addText(`services.item.${index}.description`, descriptionEn, descriptionZh, '服务')
  addText(`services.item.${index}.deliverables`, itemsEn, itemsZh, '服务')
})
const processDefaults = [
  ['Discover', '了解', 'Understand your vision, people and goals.', '理解你的愿景、受众与目标。'],
  ['Shoot', '拍摄', 'Bring the right people and light together.', '让合适的人与光线在一起。'],
  ['Edit', '剪辑', 'Shape the rhythm and refine every frame.', '塑造节奏，打磨每一帧。'],
  ['Deliver', '交付', 'Share a system that keeps working after launch.', '交付一个发布后仍能工作的系统。'],
]
processDefaults.forEach(([en, zh, descriptionEn, descriptionZh], index) => {
  addText(`services.process.${index}.title`, en, zh, '服务')
  addText(`services.process.${index}.description`, descriptionEn, descriptionZh, '服务')
})
const timelineDefaults = [['2017', 'First light', '第一束光'], ['2020', 'A wider frame', '更宽的取景'], ['2023', 'Field journal', '现场手记'], ['2026', 'The next story', '下一个故事']]
timelineDefaults.forEach(([year, en, zh], index) => {
  addText(`about.timeline.${index}.year`, year, year, '关于')
  addText(`about.timeline.${index}.title`, en, zh, '关于')
  addText(`about.timeline.${index}.description`, 'Photography, film and a little more time.', '摄影、影像，以及多一点时间。', '关于')
})

Object.assign(editableTexts, caseTextDefaults, experienceTexts)
export const contentPages = ['首页', '关于', '服务', '案例', '联系', '全站', '页脚'] as const
export type ContentPage = typeof contentPages[number]
export type ContentSection = { id?: string; page: ContentPage; title: string; fields: { key: string; label: string }[]; images: string[]; videos?: string[]; caseId?: string; slideId?: string }
type Section = ContentSection
export const contentSectionId = (section: ContentSection) => section.id ?? section.fields[0]?.key ?? section.images[0]
const fields = (entries: [string, string][]) => entries.map(([key, label]) => ({ key, label }))
export const contentSections: Section[] = [
  { page: '案例', title: '案例总览', images: [], fields: fields([['cases.enabled', '显示案例区'], ['cases.heading', '案例区标题'], ['cases.intro', '案例区简介']]) },
  ...caseDefinitions.flatMap((item): Section[] => [
    { page: '案例', title: `${item.name} / 内容`, caseId: item.id, images: [`case.${item.id}.cover`], fields: fields([
      ['visible', '显示此案例'], ['adminName', '后台标签名称'], ['title', '项目标题'], ['kicker', '项目分类'], ['intro', '项目简介'], ['metric', '主指标 / 关键词'], ['metricLabel', '指标含义'], ['note', '补充说明'], ['body', '项目正文'], ['outputs', '内容范围（每行一项）'], ['mediaNote', '配图说明（替换真实素材后可清空）'], ['linkLabel', '项目链接按钮'], ['linkUrl', '项目链接（HTTPS，可留空）'],
    ].map(([key, label]) => [`case.${item.id}.${key}`, label] as [string, string])) },
    { page: '案例', title: `${item.name} / 媒体`, caseId: item.id, images: [`case.${item.id}.photo1`, `case.${item.id}.photo2`], videos: [0, 1].map(i => `case.${item.id}.video.${i}`), fields: fields([0, 1].flatMap(i => [[`case.${item.id}.video.${i}.title`, `视频 ${i + 1} 标题`], [`case.${item.id}.video.${i}.url`, `视频 ${i + 1} 外部页面链接（如 B 站）`]] as [string, string][])) },
  ]),
  { page: '案例', title: '旅居 / 路线', caseId: 'travel', images: [], fields: fields([0, 1, 2].flatMap(i => [[`case.travel.route.${i}.title`, `站点 ${i + 1} 名称`], [`case.travel.route.${i}.body`, `站点 ${i + 1} 行程与体验`], [`case.travel.route.${i}.url`, `站点 ${i + 1} 路线 / 地图链接（HTTPS）`]] as [string, string][])) },
  { page: '首页', title: '首屏', images: ['hero'], fields: fields([
    ['home.heroTitle', '首屏大标题'], ['home.heroSubtitle', '首屏副标题'], ['HomePage.3e1e9eba', '查看作品按钮'], ['HomePage.a08934e1', '合作按钮'],
    ['home.scene', '左上场记'], ['home.coordinates', '左上坐标'], ['home.exposure', '右下曝光参数'], ['home.frame', '右下帧率与时码'], ['home.scroll', '滚动提示'], ['home.signature', '右下签名'],
  ]) },
  { page: '首页', title: '精选作品', images: [], fields: fields([['HomePage.6d674d76', '区块标识'], ['HomePage.b23b30be', '区块标题']]) },
  { page: '首页', title: '能力区简介', images: [], fields: fields([['HomePage.2fbbf645', '区块标识'], ['HomePage.781240d4', '左侧简介']]) },
  ...[['portrait', 'window'], ['dusk', 'mountainLake'], ['olive', 'studio'], ['forest', 'shore']].map((images, index): Section => ({ page: '首页', title: `能力${['一', '二', '三', '四'][index]}`, images, fields: fields([[`home.capability.${index}.title`, '能力标题'], [`home.capability.${index}.description`, '能力说明']]) })),
  { page: '首页', title: '宣言与统计', images: [], fields: fields([['HomePage.babb7af4', '区块标识'], ['HomePage.3daa76c6', '宣言'], ...[0, 1, 2].flatMap(index => [[`home.stat.${index}.value`, `统计 ${index + 1} 数值`], [`home.stat.${index}.label`, `统计 ${index + 1} 名称`]] as [string, string][])]) },
  { page: '关于', title: '人物介绍', images: ['about'], fields: fields([['AboutPage.491a3827', '区块标识'], ['AboutPage.4012d26e', '页面大标题'], ['AboutPage.d9b21b8c', '介绍副标题'], ['AboutPage.92bac68a', '人物简介'], ['AboutPage.9bbb81cf', '地点与合作状态']]) },
  { page: '关于', title: '项目阶段与引言', images: [], fields: fields([['AboutPage.47c6b96c', '时间线标题'], ...[0, 1, 2, 3].flatMap(index => [[`about.timeline.${index}.year`, `经历 ${index + 1} 阶段 / 年份`], [`about.timeline.${index}.title`, `经历 ${index + 1} 标题`], [`about.timeline.${index}.description`, `经历 ${index + 1} 说明`]] as [string, string][]), ['AboutPage.8fe18a3b', '页末引言']]) },
  { page: '服务', title: '服务页介绍', images: ['serviceA', 'serviceB'], fields: fields([['ServicesPage.f66a82e4', '区块标识'], ['ServicesPage.72318c38', '页面大标题'], ['ServicesPage.c4a681de', '页面简介']]) },
  ...[0, 1, 2, 3].map((index): Section => ({ page: '服务', title: `服务 ${index + 1} / ${serviceDefaults[index][1]}`, images: [], fields: fields([[`services.item.${index}.title`, '服务标题'], [`services.item.${index}.description`, '服务说明'], [`services.item.${index}.deliverables`, '交付清单（每行一项）']]) })),
  { page: '服务', title: '合作流程', images: [], fields: fields([['ServicesPage.b2bb0035', '流程区块标题'], ...[0, 1, 2, 3].flatMap(index => [[`services.process.${index}.title`, `步骤 ${index + 1} 标题`], [`services.process.${index}.description`, `步骤 ${index + 1} 说明`]] as [string, string][]), ['ServicesPage.a08934e1', '合作按钮']]) },
  { page: '联系', title: '联系页介绍', fields: fields([['contact.eyebrow', '区块标识'], ['contact.title', '页面大标题'], ['contact.intro', '页面简介']]), images: [] },
  { page: '联系', title: '联系页配图', fields: [], images: ['contact'] },
  { page: '联系', title: '地点与时间', fields: fields([['contact.timeLabel', '时间与坐标标题'], ['contact.city', '城市 / 地址'], ['contact.coordinates', '展示坐标'], ['site.clockOffset', '全站时钟 UTC 时差（如 +08:00）'], ['contact.timeZoneLabel', '时区文字'], ['contact.directLabel', '直接联系标题'], ['contact.followLabel', '社交链接标题']]), images: [] },
  { page: '全站', title: '导航状态', fields: fields([['site.nav.work', '作品导航'], ['site.nav.about', '关于导航'], ['site.nav.services', '服务导航'], ['site.nav.contact', '联系导航'], ['PublicLayout.8c8738c1', '合作状态'], ['site.clockCity', '时钟城市名称'], ['site.clockZone', '时钟旁标签']]), images: [] },
  { page: '页脚', title: '页脚文字', fields: fields([['Footer.ab353dfd', '联系按钮'], ['Footer.48f0c1a7', '返回顶部按钮'], ['Footer.e7ef3aca', '地点标识'], ['site.location', '地点'], ['Footer.0137b9ad', '社交标识'], ['Footer.fc8e4190', '版权说明'], ['Footer.2f158034', '隐私链接'], ['site.marquee', '滚动文字'], ['footer.wordmark', '页尾互动大字']]), images: [] },
]

// Keep the earlier generic fields available for existing users and saved keys.
for (const page of contentPages) {
  const used = new Set(contentSections.flatMap(section => section.fields.map(field => field.key)))
  const remaining = Object.entries(editableTexts).filter(([key, value]) => value.group === page && !used.has(key) && !key.startsWith('experience.'))
  if (remaining.length) contentSections.push({ page, title: '其他兼容文案', images: [], fields: remaining.map(([key, value]) => ({ key, label: value.zh })) })
}


export function getContentSections(settings: SiteSettings): ContentSection[] {
  const custom = (settings.content?.customCases ?? []).flatMap(item =>
    contentSections.filter(section => section.caseId === 'creator').map(section => ({
      ...section, caseId: item.id, title: section.title.replace(caseDefinitions[0].name, item.name),
      fields: section.fields.map(field => ({ ...field, key: field.key.replace('case.creator.', `case.${item.id}.`) })),
      images: section.images.map(key => key.replace('case.creator.', `case.${item.id}.`)),
      videos: section.videos?.map(key => key.replace('case.creator.', `case.${item.id}.`)),
    })))
  const slides = ensureHeroSlides(settings).content!.heroSlides!
  const heroSections: ContentSection[] = slides.map((slide, index) => slide.id === 'intro'
    ? { ...contentSections.find(section => section.title === '首屏')!, slideId: 'intro', title: `第 ${index + 1} 屏` }
    : { id: `hero.${slide.id}`, page: '首页', slideId: slide.id, title: `第 ${index + 1} 屏`, images: [`hero.${slide.id}.cover`], fields: heroFields.map(([key, label]) => ({ key: `hero.${slide.id}.${key}`, label })) })
  const sections: ContentSection[] = [...contentSections.filter(section => section.title !== '首屏'), ...heroSections, ...custom, { id: 'socialLinks', page: '页脚', title: '社交平台', images: [], fields: [] }]
  // Keep the hero as the first homepage module regardless of slide order.
  sections.splice(sections.findIndex(section => section.page === '首页'), 0, { id: 'hero.overview', page: '首页', title: '轮播管理', images: [], fields: [] })
  sections.push({ id: 'experience.heading', page: '关于', title: '工作经历总览', images: [], fields: [{ key: 'experience.heading', label: '时间轴标题' }] })
  sections.push(...experienceItems(settings).map((item, index): ContentSection => ({ id: `experience.${item.id}`, page: '关于', title: `经历 ${index + 1}`, images: [], fields: [['visible', '显示这段经历'], ['date', '起止时间'], ['company', '公司 / 项目'], ['role', '职位 / 职责'], ['description', '经历说明']].map(([key, label]) => ({ key: `experience.${item.id}.${key}`, label })) })))
  return sections.map(section => {
    if (!section.caseId) return section
    const original = [...caseDefinitions, ...(settings.content?.customCases ?? [])].find(item => item.id === section.caseId)?.name
    const name = settings.content?.texts[`case.${section.caseId}.adminName`]?.zh.trim()
    if (!name || name === original) return section
    return { ...section, title: `${name} / ${section.videos ? '媒体' : contentSectionId(section).includes('.route.') ? '路线' : '内容'}` }
  })
}

export function sectionGroup(section: ContentSection, settings: SiteSettings) {
  const id = contentSectionId(section)
  if (id.startsWith('experience.')) return { id: 'experience', label: '工作经历', child: section.title }
  if (section.slideId || id === 'hero.overview') return { id: 'hero', label: '首屏', child: section.title }
  if (section.caseId) return { id: `case.${section.caseId}`, label: getCaseDefinitions(settings).find(item => item.id === section.caseId)?.name ?? section.caseId, child: section.videos ? '媒体' : id.includes('.route.') ? '路线' : '内容' }
  if (id === 'HomePage.2fbbf645' || id.startsWith('home.capability.')) return { id: 'capabilities', label: '能力区', child: id === 'HomePage.2fbbf645' ? '简介' : section.title }
  const service = id.match(/^services\.item\.(\d+)\.title$/)
  if (service) return { id, label: `服务 ${Number(service[1]) + 1} / ${settings.content?.texts[id]?.zh ?? editableTexts[id].zh}`, child: section.title }
  return { id, label: section.title, child: section.title }
}
