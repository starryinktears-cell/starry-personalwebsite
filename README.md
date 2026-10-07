# Studio / 01 — 个人图片 / 视频作品集

基于 React + TypeScript + Tailwind CSS 的编辑型画廊作品集，配套 Node.js/Vercel Functions API、Supabase Auth/PostgreSQL/Storage 和后台内容管理。

## 页面内容编辑

打开 `/admin/settings`，选择“首页内容”“关于内容”或“服务内容”。每个区块直接显示中文、English 文案及对应图片缩略图；点击配图可上传、从媒体库选择、修改地址及 Alt，最后点击“保存修改”。切换页面不会丢失尚未保存的编辑。

- 首页：首屏标题、副标题、按钮、场记与参数；四项能力的标题、说明和八张配图；宣言与统计。
- 关于：人物介绍、肖像、地点、时间线、引言；社交链接在“品牌、联系与共用字段”中修改。
- 服务：页头和两张配图、四项服务标题与说明、交付清单（每行一项）、四步合作流程。
- 预览：当前首页、关于、服务或页脚的实际布局；不会保存未提交的修改。

中英文共用字段保留在兼容入口，修改时同步两种语言；独立双语字段优先使用各自语言内容。旧数据无需迁移，所有页面字段使用既有 `site_settings.seo.content` JSONB，图片仍使用账号所属资产 ID 和临时签名 URL。具体项目内容、发布、封面和排序继续在“项目”中管理。

## 本地启动

```bash
npm install
copy .env.example .env.local # macOS/Linux: cp .env.example .env.local
npm run dev
```

公开站点默认运行在 `http://localhost:5173`。默认语言为中文，导航右侧可切换 English；语言偏好保存在浏览器中。未配置 Supabase 时，前端使用本地演示数据，登录页接受任意非空邮箱和密码，用于验证页面、编辑、上传状态和发布交互；生产环境必须接入 Supabase Auth 和 API。

## Cinematic Quiet 改版

改版在 `redesign/cinematic` 分支完成，视觉基于 `docs/REDESIGN_SPEC.md` 和 `docs/previews/`：纸张色背景、Cormorant Garamond 展示字体、IBM Plex Mono 信息层、暗色 Reel、固定导航、预加载幕、响应式 AVIF/WebP、LQIP、详情灯箱和自定义影片播放器。图片准备脚本会生成 900px 与 1800px 两档资源；字体脚本下载本地 Latin WOFF2，运行时不会依赖 Google Fonts。

首次准备或更新本地演示媒体和字体：

```bash
npm run media:prepare
npm run fonts:download
```

## Supabase 初始化

1. 在 Supabase 创建项目，并在 Auth 中启用邮箱登录和密码重置邮件。
2. 在 Supabase SQL Editor 或已认证 CLI 环境执行 `supabase/migrations/202610020001_initial.sql`。
3. 将 `.env.example` 中的 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`SITE_OWNER_ID`、`VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY` 填入本地或 Vercel 环境变量。`SITE_OWNER_ID` 用于把公开联系表单线索归属到站主。
4. `SUPABASE_SERVICE_ROLE_KEY` 只能配置在 Vercel Server/Node.js 环境变量；不要使用 `VITE_` 前缀，也不要提交到 GitHub。
5. 迁移会创建私有 `portfolio-media` Storage bucket、所有业务表的 RLS、owner_id 策略和公开已发布项目读取策略。

如果本机安装 Supabase CLI，先执行 `supabase --help` 查看当前版本命令，再按 CLI 版本使用 `supabase db push`。没有 CLI 时可直接在 Dashboard SQL Editor 执行迁移文件。

## 验证

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

视觉验收脚本需要 Chromium（首次运行会由 Playwright 下载）：

```bash
npx playwright install chromium
npm run verify
```

`npm run verify` 会检查 12 条公开路由在 1440 / 1024 / 390 三种视口下的控制台错误、横向溢出、图片 Alt/尺寸、唯一标题和减少动态效果模式，并把全页截图写入 `.goal/screenshots/`。移动端 Lighthouse 首页和项目详情页的结果记录在 `GOAL_PROGRESS.md`，目标为 Performance ≥ 90、Accessibility ≥ 95、Best Practices ≥ 95、SEO ≥ 95。

另有 `npm run api:dev` 可在安装并登录 Vercel CLI 后本地模拟 `/api` Functions。`/api/health`、`/api/contact`、`/api/projects`、`/api/admin/projects`、`/api/admin/inquiries`、`/api/admin/settings`、`/api/admin/account`、`/api/upload/sign` 和 `/api/upload/complete` 已提供 Node.js API；上传签名会同时创建受 owner_id 约束的 `assets` / `upload_tasks` 记录，私有线索、项目、设置和账号删除在服务端读取 Supabase 服务密钥，并通过 Supabase Auth Bearer 会话和 owner_id 校验归属。

## Vercel / GitHub

将仓库导入 Vercel，Framework 选择 Vite，Build Command 使用 `npm run build`，Output Directory 使用 `dist`。在 Preview 和 Production 分别配置 Supabase URL、publishable key、service role key、`MEDIA_BUCKET` 和 `VITE_SITE_URL`。GitHub 的 Pull Request 会触发 Vercel Preview，`.github/workflows/ci.yml` 会执行类型检查、Lint、Vitest 和生产构建。改版阶段只在 `redesign/cinematic` 分支本地验证，不自动推送主分支或触发 Production 部署。

## 当前边界

- 媒体上传会写入私有 Storage，并通过 Tus 分块上传、`retryDelays` 与 fingerprint 恢复断点；`upload_tasks` 记录上传中、可用和失败状态。真实缩略图、视频转码和海报帧仍需要接入异步媒体处理服务后写回 `assets` / `upload_tasks`，当前失败可重新选择文件上传。
- 本地演示媒体保存到浏览器 IndexedDB，支持单文件 5 MB 以内的文件，不再受原来的 2 MB 限制。localStorage 仅保存媒体引用和内容元数据，刷新后会重新读取文件；原有 data URL 图片仍兼容。文件只在当前浏览器和同一来源中可用，清除站点存储会移除本地媒体，不会写入生产 Supabase。真实环境通过 `/api/upload/sign` 创建上传任务，并以 owner_id + 文件信息保存不含凭证的任务引用，重新选择同一文件可恢复 Tus 断点。
- 真实邮件找回密码由 Supabase Auth 模板发送；未配置邮件服务时，登录页面只展示入口，不伪造成功结果。

## 后台与主站内容联动

当前可回溯的基础模板分支为 `codex/base-template`。已完成内容、验证范围、数据边界与后续待办见 [基础模板检查点](docs/base-template-checkpoint.md)。

- 配色入口：站点设置 → 展开“品牌、联系与共用字段” → 网站配色。主色控制按钮、选中标签、强调文字和边框，后台侧栏及原深绿区域使用同色系深色；页脚背景可独立选色，并自动调整文字明暗。提供雾蓝、灰粉、鼠尾草、燕麦、烟紫、陶土预设及原始墨绿重置。开启头图联动后，更换首页头图自动提取柔和配色；手动选择预设/颜色会关闭联动。取色失败保留现有颜色；所有更改仍需保存。主题扩展保存在既有 `site_settings.seo.theme`，无需新增迁移。
- 联系页标题和简介：站点设置 → 联系内容 → 联系页介绍。城市、坐标、时区文字及全站时钟 UTC 时差：联系内容 → 地点与时间。页头城市/时区标签：全站内容 → 导航状态；页脚地点：页脚内容 → 页脚文字。默认站点所在地为深圳，时差为 `+08:00`，实时钟独立于访客电脑时区。已有数据库/浏览器自定义内容保持优先，需要通过后台更新。
- 桌面后台左栏固定在视口内，右侧内容独立滚动；侧栏高度不足时可单独滚动。作品详情仅通过上/下一个项目链接切换，滚动及停留不会自动切换作品。
- 站点设置保留顶部页面标签和“品牌、联系与共用字段”，下方子标签一次打开一个区块。桌面右侧固定显示该区块的未保存预览，窄屏预览位于编辑区上方；切换页面或区块保留草稿，仍需点击“保存修改”使主站生效。子标签支持左右方向键、Home / End。兼容文案保留独立入口，并明确提示其可能不用于当前版式。
- `/admin/settings` 管理导航/页脚品牌、联系邮箱、简介、主色、社交链接、首屏、首页能力区文案与配图、宣言与统计，以及关于/服务/联系页图片。首页文案可分别填写中文、英文；若设置了语言专用首屏文案，会优先于共用首屏标题。
- 图片可以上传或从当前账号媒体库选择；站点媒体保存资产 ID，服务端每次读取重新生成签名地址，不把过期地址当作永久图片地址。首页主图使用现有 `hero_asset_id`，扩展内容保存在 `site_settings.seo.content`，不需要新增表或破坏原有迁移。
- `/admin/projects/:id` 的标题、摘要、正文、封面、Alt、地点、客户、媒体顺序和展示顺序控制公开作品。只有已发布项目出现在主站；精选勾选控制首页精选。保存已发布作品不会自动转为草稿，下线使用 archived 状态。
- `/api/admin/assets` 返回当前账号全部媒体，包括未关联项目的站点图片；原始媒体桶维持私有，所有新增查询保留 owner_id 过滤。
- 图片和视频上传默认及最高上限为 5 MB（5,242,880 字节），前端与 Node API 同步限制。`MAX_MEDIA_BYTES`（Node）与 `VITE_MAX_MEDIA_BYTES`（前端，重建生效）示例均为 `5242880`；可配置更低限制，旧的 50 MB 环境变量会被应用的 5 MB 上限截断。已有媒体仍可读取；Supabase 自身限制更低时仍受平台限制。
- 本地没有 Supabase 环境变量时是演示模式；`npm run dev` 单独运行 Vite，不提供真实 Node API。真实本地联调使用 `npm run api:dev` 并配置 `.env.local`。

本次核查证据、字段映射与未覆盖边界见 [后台与主站联动核查](docs/admin-content-audit.md)。
