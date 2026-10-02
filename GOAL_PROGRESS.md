# Goal Progress

## 当前状态：M4 已完成，最终审计通过

本次重设计在 `redesign/cinematic` 分支完成，严格按 `docs/REDESIGN_SPEC.md` 的 M1 → M4 顺序执行。现有 Supabase、Node.js API、认证、后台路由、账号隔离、上传状态和数据归属逻辑保留；本分支不推送主分支、不触发 Production 部署。

## 里程碑

- [x] M1 地基：设计令牌、素材与 SEO、无障碍基线、6 个项目数据、已知问题修复
- [x] M2 骨架动效：Lenis/GSAP 动效框架、Reveal/Marquee/Magnetic/Draw 组件、固定 Header、颗粒和微交互
- [x] M3 高光时刻：Preloader、Hero 宽银幕、作品放映区、Capabilities、Manifesto、幕布 Footer、路由转场
- [x] M4 详情页与其他页面：详情元数据/节奏布局/播放器/自动进入下一个项目、作品筛选与视图切换、About/Services/Contact/Privacy/404

## 已知问题修复表（§0 的 1–11）

| # | 问题 | 修复方式 | 验证证据 |
|---|---|---|---|
| 1 | 全站没有关键帧和明确动效令牌 | `src/lib/motion.ts` 统一时长/缓动；CSS 添加 reveal、draw、ken-burns、curtain、marquee、pulse；减少动态效果时关闭运行时动画 | `npm run verify` 的 reduced-motion 轮次通过；`src/styles.css` |
| 2 | Header 静态且右侧信息过浅 | 固定 Header、滚动隐藏/显示、Reykjavík 时间、可用状态点、桌面和移动菜单语言入口 | 1440 / 1024 / 390 截图；移动语言 smoke test |
| 3 | Hero 非满屏出血，角标可能消失 | `100svh` 全屏 Hero、vignette、场景/相机角标、移动端安全留白 | `.goal/screenshots/home-1440.png`、`home-390.png` |
| 4 | Hero CTA 没有主次 | 主 CTA 实色按钮，次 CTA 下划线链接，均保持键盘可达 | 首页截图；Playwright 路由验证 |
| 5 | 详情页标题与主图边距问题 | 详情 Hero、元数据表、首图和错落媒体节奏重新布局；灯箱支持 Esc/左右键 | `.goal/screenshots/work-northern-light-390.png`；详情 Lighthouse |
| 6 | Manifesto 标题在中等宽度孤词断行 | 使用 `clamp`、合理最大宽度和响应式行高 | `home-1024.png`；无横向溢出检查 |
| 7 | 作品筛选器折行并有孤立竖线 | 单行横向滚动筛选器，移除孤立分隔符；增加 Grid/List 切换 | `work-1024.png`；三视口溢出检查 |
| 8 | 小标签字号小且对比度不足 | `.eyebrow` 最小 12px、统一 `ink-muted`、mono 信息层和夜色区对比度 | Accessibility 95；图片人工检查 |
| 9 | 路由 title/description/OG 不独立 | `src/lib/seo.tsx` 为公开路由和项目详情生成独立 title、description、OG/Twitter 和 JSON-LD | 12 路由标题唯一；Lighthouse SEO 100 |
| 10 | Hero 外链图片无响应式资源和 LQIP | `scripts/prepare-media.mjs` 生成本地 WebP/AVIF、900px/1800px srcset 和 LQIP；`ResponsiveImage` 提供 picture、尺寸和加载优先级 | Lighthouse 图片资源；图片尺寸/Alt 检查通过 |
| 11 | 图片重复且项目数不足 | 六个项目扩充完整元数据和不重复封面/画廊资产；草稿项目保留后台可管理 | `src/data/projects.ts`；Vitest publish validation 2/2 |

## 修改模块

- `src/App.tsx`：公开路由、双语、固定导航、Preloader、作品列表/详情、About、Services、Contact、Privacy、404；保留后台仪表盘、项目编辑、媒体库、联系线索、站点设置、账号安全。
- `src/styles.css`、`tailwind.config.js`、`src/lib/motion.ts`、`src/lib/motion-runtime.tsx`：设计令牌、字体、动画降级、Lenis/GSAP 延迟加载。
- `src/data/projects.ts`、`src/lib/mockData.ts`、`src/lib/types.ts`：六个作品和响应式媒体字段。
- `src/lib/seo.tsx`、`index.html`、`public/robots.txt`、`public/sitemap.xml`：路由 SEO 与结构化数据。
- `scripts/prepare-media.mjs`、`scripts/download-fonts.mjs`、`scripts/verify.mjs`：本地媒体、字体和验收工具。
- `public/images/`、`public/fonts/`：本地占位媒体、AVIF/WebP 派生图、LQIP 和 Latin WOFF2；不含真实私有媒体或密钥。
- `README.md`、`package.json`、`package-lock.json`：启动、Supabase、Vercel、验证和媒体准备说明。

## 验证记录

日期：2026-10-03（Asia/Shanghai）

| 验证类型 | 命令 / 场景 | 结果 |
|---|---|---|
| 静态类型检查 | `npm run typecheck`（由 `npm run build` 执行） | 通过 |
| Lint | `npm run lint` | 通过，0 warnings |
| 自动化测试 | `npm test -- --run` | 通过，1 个文件、2 个测试 |
| 生产构建 | `npm run build` | 通过，Vite 5 个产物块；初始入口 gzip 27.95 kB |
| 本地运行 | `npm run preview -- --host 127.0.0.1 --port 4173` | 通过，服务可访问 |
| 全量视觉/可访问性协议 | `node scripts/verify.mjs` | 通过，12 路由 × 3 视口 + reduced-motion；0 控制台错误、0 横向溢出、图片 Alt/尺寸通过、标题唯一 |
| 移动语言切换 | Playwright 1440px + 390px：默认中文 → 点击切换 → English | 通过：`zh-CN`/中文 Hero → `en`/英文 Hero |
| Lighthouse 首页移动端 | `--form-factor=mobile --screenEmulation.width=390` | Performance 90、Accessibility 95、Best Practices 96、SEO 100 |
| Lighthouse 详情移动端 | `/work/northern-light` 同配置 | Performance 93、Accessibility 95、Best Practices 96、SEO 100 |
| 生产依赖安全审计 | `npm audit --omit=dev --audit-level=high` | 通过，0 vulnerabilities |
| 差异检查 | `git diff --check` | 通过；仅提示 Git 的 LF/CRLF 转换 |
| 人工视觉验收 | 检查 `.goal/screenshots/` 首页、作品列表、详情、About、Services、Contact、Privacy、404 | 通过：纸张色、暗色 Reel、字体层级、媒体比例、留白和移动断点符合设计方向 |

截图目录：`.goal/screenshots/`（被 `.gitignore` 忽略，不提交到仓库）；Lighthouse JSON：`.goal/lighthouse-home-mobile.json`、`.goal/lighthouse-detail-mobile.json`（同样仅作为本地证据）。

## 决策与限制

- 使用本地 Unsplash 派生占位图完成布局验收，站主后续可替换为 Supabase Storage 的真实媒体；占位图不代表生产作品内容。
- 真实视频文件仍由现有 Supabase Storage 上传/处理适配层接入；前台提供海报、播放按钮、时间码、进度和灯箱交互，真实异步转码/断点续传由后端处理任务写回 `assets` / `upload_tasks`。
- WebGL 变形不是必需依赖；桌面使用延迟加载 Lenis/GSAP，pointer coarse 和 reduced-motion 自动关闭，以保留首屏性能和可访问性。
- 所有 Supabase service role/secret key 仍只在 Node.js API 使用；原始媒体和草稿的私有性由现有迁移、Storage 策略与 RLS 负责，本次没有把密钥、生产数据或私有媒体加入 Git。
- `npm install` 当前整体依赖树仍可能报告开发工具的审计提示；生产依赖审计已通过，未为改版引入生产高危项。

## 里程碑提交

以下提交和标签在最终工作树审计后创建，供分支回溯：

- M1：`5668b7f` / `m1-done`（设计基础、素材、SEO、数据和可访问性）
- M2：`c08a353` / `m2-done`（动效骨架与延迟加载运行时）
- M3：`f1bb3ab` / `m3-done`（首页高光、Preloader、Footer 和路由转场）
- M4：`fbd4d11` / `m4-done`（详情与其余公开页面、双语移动入口、验证协议）
