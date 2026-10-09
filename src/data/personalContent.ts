import type { SiteSettings } from '../lib/types'
import { caseTextDefaults } from './caseCatalog'

type Bilingual = { zh: string; en: string }
const pair = (zh: string, en: string): Bilingual => ({ zh, en })

// Personalization draft requested by the owner. Applied explicitly in the editor, never on load.
export const personalTexts: Record<string, Bilingual> = {
  'home.heroTitle': pair('让想法被看见', 'Make ideas seen.'),
  'home.heroSubtitle': pair('Starry / 内容策划 · 品牌运营 · AI 视觉', 'Starry / Content strategy · Brand operations · AI visuals'),
  'PublicLayout.8c8738c1': pair('开放项目合作', 'OPEN FOR COLLABORATION'),
  'home.scene': pair('STARRY — CREATIVE PORTFOLIO', 'STARRY — CREATIVE PORTFOLIO'),
  'home.signature': pair('内容 · 品牌 · 体验', 'CONTENT · BRAND · EXPERIENCE'),
  'home.exposure': pair('从洞察到表达', 'FROM INSIGHT TO EXPRESSION'),
  'home.frame': pair('从创意到落地', 'FROM CONCEPT TO DELIVERY'),
  'HomePage.6d674d76': pair('影像选集', 'VISUAL ARCHIVE'),
  'HomePage.b23b30be': pair('画面里的故事', 'Stories in frames'),
  'HomePage.781240d4': pair('把品牌目标转化为具体的内容、画面与用户体验。从策略梳理到制作发布，让想法有清晰的表达，也有可执行的路径。', 'Turning brand goals into content, visuals and audience experiences. From strategy to production and publishing, I connect clear ideas with practical delivery.'),
  'home.capability.0.title': pair('内容策划与运营', 'Content & operations'),
  'home.capability.0.description': pair('从受众洞察、账号定位到选题与内容节奏，串联脚本、拍摄、剪辑、发布与复盘。', 'Audience insight, channel positioning and editorial planning, connected with scripting, production, publishing and review.'),
  'home.capability.1.title': pair('AI 视觉与动态', 'AI visuals & motion'),
  'home.capability.1.description': pair('把产品卖点转化为画面，用 AI 生成、动态图与后期制作完成可用于品牌传播的视觉内容。', 'Translating product benefits into visuals through AI generation, motion and post-production for brand communication.'),
  'home.capability.2.title': pair('品牌与整合传播', 'Brand & communication'),
  'home.capability.2.description': pair('梳理品牌表达、卖点文案与传播主题，让社媒、活动和营销物料保持一致的叙事。', 'Brand messaging, benefit-led copy and campaign themes that connect social channels, events and marketing materials.'),
  'home.capability.3.title': pair('旅居与影像叙事', 'Travel & visual stories'),
  'home.capability.3.description': pair('围绕人、地方与体验，规划旅居路线与内容主题，用摄影、视频和航拍记录沿途故事。', 'Planning travel experiences and content around people and places, told through photography, video and aerial imagery.'),
  'HomePage.babb7af4': pair('内容的价值', 'CONTENT WITH PURPOSE'),
  'HomePage.3daa76c6': pair('好的内容，让人愿意停留，也让品牌值得被记住。', 'Good content earns attention. Thoughtful stories make a brand memorable.'),
  'home.stat.0.value': pair('7 万', '70K'),
  'home.stat.0.label': pair('B 站关注者 · 历史最高 8.3 万', 'BILIBILI FOLLOWERS · PEAK 83K'),
  'home.stat.1.value': pair('4000+', '4,000+'),
  'home.stat.1.label': pair('AI 修图插件项目用户', 'AI RETOUCHING PLUGIN USERS'),
  'home.stat.2.value': pair('270%', '270%'),
  'home.stat.2.label': pair('参与项目众筹目标达成率', 'CROWDFUNDING PROJECT GOAL REACHED'),
  'AboutPage.491a3827': pair('关于 Starry', 'ABOUT STARRY'),
  'AboutPage.4012d26e': pair('Starry', 'Starry'),
  'AboutPage.d9b21b8c': pair('让策略有表达，让创意能落地。', 'Strategy with a voice. Ideas brought to life.'),
  'AboutPage.92bac68a': pair('我是 Starry，现居深圳，从事内容策划、品牌运营与视觉创作。我的经历覆盖个人 IP、消费品牌、康养与旅居，以及出海电商和 AI 工具项目。\n\n我习惯从受众与业务目标出发，梳理内容定位、产品卖点与传播路径，再推进脚本、摄影摄像、剪辑、AI 视觉、社媒发布和反馈迭代。既关注画面的质感，也关注内容能否被理解、被使用。', 'I’m Starry, a Shenzhen-based content strategist, brand operator and visual creator. My experience spans personal IP, consumer brands, wellness and travel, overseas e-commerce and AI tools.\n\nI start with the audience and business context, shape positioning and product messaging, then connect scripting, photography, video, AI visuals, publishing and iteration. I care about how work looks and how it connects with people.'),
  'AboutPage.9bbb81cf': pair('中国 / 深圳 — 内容、品牌与视觉项目合作', 'SHENZHEN / CHINA — CONTENT, BRAND & VISUAL COLLABORATIONS'),
  'AboutPage.47c6b96c': pair('经历与实践', 'EXPERIENCE & PRACTICE'),
  'AboutPage.8fe18a3b': pair('把审美转化为表达，把想法推进到落地。', 'Turn a visual instinct into expression, and an idea into something real.'),
  'ServicesPage.f66a82e4': pair('策略与创作', 'STRATEGY & CREATION'),
  'ServicesPage.c4a681de': pair('从品牌目标与用户洞察出发，串联内容策略、卖点表达、视觉制作与运营执行。可以从一个具体作品开始，也可以一起梳理完整的传播计划。', 'Connecting content strategy, product messaging, visual production and channel operations around brand goals and audience needs. Start with a single deliverable or build a communication plan together.'),
  'contact.title': pair('一起把想法做出来', 'Let’s bring it to life'),
  'contact.intro': pair('内容策划、品牌传播、AI 视觉或旅居影像——告诉我你的项目目标、受众与想实现的效果，我们一起梳理合适的表达方式。', 'Content strategy, brand communication, AI visuals or travel stories: tell me about your goals, audience and the outcome you have in mind.'),
  'Footer.ab353dfd': pair('聊聊你的想法。', 'Let’s talk ideas.'),
  'Footer.fc8e4190': pair('策划 · 运营 · 视觉', 'STRATEGY · OPERATIONS · VISUALS'),
  'site.marquee': pair('让想法被看见 · 让品牌被记住 ·', 'MAKE IDEAS SEEN · MAKE BRANDS MEMORABLE ·'),
}

const experiences = [
  ['内容与商业', 'CONTENT & COMMERCE', '个人 IP 与衍生品', 'Personal IP & merchandise', '自媒体账号全流程运营，B 站 7 万关注者，历史最高 8.3 万；单条视频最高播放 461 万。延伸至商业内容合作与 IP 衍生品，店铺累计销量破万件。', 'End-to-end creator operations: 70K Bilibili followers, a peak of 83K and a top video with 4.61M views. Experience extends to brand collaborations and IP merchandise, with over 10K units sold.'],
  ['品牌与受众', 'BRAND & AUDIENCE', '奶糖派 · 垂类 IP', 'Naitangpai · Niche IP', '围绕女性科普内容进行账号定位、选题脚本、拍摄剪辑与社群互动。有胸青年账号从 0 到 1，积累 1.3 万关注者。', 'Positioning, scripts, production and community engagement for women-focused educational content. Built the Youxiong Qingnian channel from zero to 13K followers.'],
  ['品牌与体验', 'BRAND & EXPERIENCE', '越秀康养 · 银幸', 'Yuexiu Wellness · Yinxing', '围绕品牌传播统筹多项目内容，覆盖宣传片、活动影像、直播、课程与对外物料；将旅居路线与真实人物故事转化为可持续使用的内容。', 'Coordinated communication across projects, including brand films, event coverage, livestreams, courses and marketing materials, connecting travel experiences with human stories.'],
  ['产品与增长', 'PRODUCT & GROWTH', 'Openmoon 与 AI 项目', 'Openmoon & AI projects', '覆盖海外社媒、Shopify 独立站、产品文案、KOL / UGC 协作与 AI 视觉制作；在 AI 修图插件项目中推进需求梳理、工作流测试与迭代协作。', 'Overseas social channels, Shopify, product copy, KOL / UGC coordination and AI visuals, alongside requirements, workflow testing and iteration for an AI retouching plugin.'],
]
experiences.forEach(([label, labelEn, title, titleEn, body, bodyEn], i) => {
  personalTexts[`about.timeline.${i}.year`] = pair(label, labelEn)
  personalTexts[`about.timeline.${i}.title`] = pair(title, titleEn)
  personalTexts[`about.timeline.${i}.description`] = pair(body, bodyEn)
})
const services = [
  ['品牌策略与卖点策划', 'Brand & product messaging', '从产品价值、受众需求与使用场景出发，梳理核心信息、传播主题和内容结构，形成可执行的策划方案。', 'Translate product value, audience needs and usage contexts into clear messaging, campaign themes and practical content plans.', '品牌表达与传播主题\n产品卖点与场景文案\n内容方案与创意脚本', 'Brand messaging & campaign themes\nProduct benefits & scenario copy\nCreative plans & scripts'],
  ['内容运营与个人 IP', 'Content operations & personal IP', '建立有辨识度的内容定位与选题体系，统筹制作、发布与互动节奏，以数据和用户反馈推动持续优化。', 'Build a distinctive position and editorial system, coordinate production and publishing, and refine content through data and audience feedback.', '账号定位与选题规划\n脚本、拍摄、剪辑与封面\n多平台运营与内容复盘', 'Channel positioning & editorial planning\nScripts, filming, editing & covers\nCross-platform operations & review'],
  ['出海内容与电商表达', 'Global content & e-commerce', '围绕产品上市、众筹与独立站，把卖点转译成适合海外社媒和商品页面的内容，协调素材、达人与传播节奏。', 'Turn product benefits into content for overseas social channels and commerce pages, connecting launches, crowdfunding, assets and creator coordination.', 'Shopify 页面与产品内容\nKOL / UGC 素材协作\n众筹传播内容与发布排期', 'Shopify pages & product content\nKOL / UGC asset coordination\nCrowdfunding content & publishing plans'],
  ['AI 视觉与影像制作', 'AI visuals & production', '把创意方案推进到镜头与成片，结合实拍、AI 生图、视觉动图和后期制作，适配品牌传播与内容运营需求。', 'Bring creative plans into frames and finished work with live photography, AI imagery, motion and post-production.', 'AI 场景图、动图与视频\n人物、产品、活动与航拍\n分镜、剪辑与传播版本', 'AI scenes, motion & video\nPortrait, product, event & aerial imagery\nStoryboards, editing & channel versions'],
]
services.forEach(([title, titleEn, body, bodyEn, list, listEn], i) => {
  personalTexts[`services.item.${i}.title`] = pair(title, titleEn)
  personalTexts[`services.item.${i}.description`] = pair(body, bodyEn)
  personalTexts[`services.item.${i}.deliverables`] = pair(list, listEn)
})
;[
  ['明确目标', 'Align', '理解品牌、受众、场景与交付目标。', 'Understand the brand, audience, context and goals.'],
  ['策略与方案', 'Plan', '整理卖点、内容主题、脚本与制作计划。', 'Define messaging, themes, scripts and production plans.'],
  ['制作与协作', 'Create', '推进实拍、AI 视觉、剪辑和物料制作。', 'Coordinate photography, AI visuals, editing and assets.'],
  ['发布与优化', 'Refine', '完成交付与适配，根据反馈迭代内容。', 'Deliver channel-ready work and iterate with feedback.'],
].forEach(([title, titleEn, body, bodyEn], i) => {
  personalTexts[`services.process.${i}.title`] = pair(title, titleEn)
  personalTexts[`services.process.${i}.description`] = pair(body, bodyEn)
})

export function applyPersonalDraft(settings: SiteSettings): SiteSettings {
  return {
    ...settings, siteName: 'Starry', shortBio: personalTexts['AboutPage.92bac68a'].zh,
    heroTitle: personalTexts['home.heroTitle'].zh, heroSubtitle: personalTexts['home.heroSubtitle'].zh,
    content: { ...settings.content, images: settings.content?.images ?? {}, texts: { ...Object.fromEntries(Object.entries(caseTextDefaults).map(([key, value]) => [key, pair(value.zh, value.en)])), ...settings.content?.texts, ...personalTexts, 'cases.enabled': pair('1', '1') } },
  }
}
