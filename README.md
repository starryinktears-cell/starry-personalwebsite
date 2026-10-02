# Studio / 01 — 个人图片 / 视频作品集

基于 React + TypeScript + Tailwind CSS 的编辑型画廊作品集，配套 Node.js/Vercel Functions API、Supabase Auth/PostgreSQL/Storage 和后台内容管理。

## 本地启动

```bash
npm install
copy .env.example .env.local # macOS/Linux: cp .env.example .env.local
npm run dev
```

公开站点默认运行在 `http://localhost:5173`。未配置 Supabase 时，前端使用本地演示数据，登录页接受任意非空邮箱和密码，用于验证页面、编辑、上传状态和发布交互；生产环境必须接入 Supabase Auth 和 API。

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

另有 `npm run api:dev` 可在安装并登录 Vercel CLI 后本地模拟 `/api` Functions。`/api/health`、`/api/contact`、`/api/projects`、`/api/admin/projects`、`/api/admin/inquiries`、`/api/admin/settings`、`/api/upload/sign` 和 `/api/upload/complete` 已提供 Node.js API；上传签名、私有线索和项目查询在服务端读取 Supabase 服务密钥，并通过 Supabase Auth Bearer 会话和 owner_id 校验归属。

## Vercel / GitHub

将仓库导入 Vercel，Framework 选择 Vite，Build Command 使用 `npm run build`，Output Directory 使用 `dist`。在 Preview 和 Production 分别配置 Supabase URL、publishable key、service role key、`MEDIA_BUCKET` 和 `VITE_SITE_URL`。GitHub 的 Pull Request 会触发 Vercel Preview，`.github/workflows/ci.yml` 会执行类型检查、Lint、Vitest 和生产构建。

## 当前边界

- 媒体处理适配层和 UI 状态已覆盖上传中、处理中、可用、失败/重试所需状态；真实缩略图、视频转码和海报帧需要接入异步媒体处理服务后写回 `assets` / `upload_tasks`。
- 本地演示上传使用浏览器 `ObjectURL`，刷新后不会持久化；接入 Storage 后应由 `/api/upload/sign` 签发短时上传凭证。
- 真实邮件找回密码由 Supabase Auth 模板发送；未配置邮件服务时，登录页面只展示入口，不伪造成功结果。
