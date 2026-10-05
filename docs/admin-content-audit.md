# 后台与主站内容联动核查（2026-10-05）

## 截图反馈后的第二轮补齐

针对站主提供的首屏、首页能力、关于和服务截图，本轮发现：服务条目/交付内容/流程与关于时间线仍为代码常量；旧编辑器将双语文案折叠、图片分离，位置难以匹配；关于简介与首屏共用字段可能覆盖独立双语编辑。

修复在 `SiteSettingsEditor`、`siteContentCatalog`、`siteContent` 与 `App`：按页面及区块展示文字与配图；增加服务与时间线字段，首屏装饰文字；优先使用显式语言字段，共用兼容入口同步双语；首页标题元信息同语言更新。旧内容键、共用入口、账号隔离和 API 均保留，无数据库表结构/策略变更。

验证：React 自动化覆盖截图涉及页面编辑→跨页面切换→保存→重新挂载→前台双语与图片；API 以明确标记的内存数据库替身覆盖全部字段和图片位的 JSONB 写入/读取、私有签名及原 SEO 保留。内置浏览器本地保存临时首屏、能力、关于和服务文案，三页显示对应结果；关于肖像改为 `/images/portrait.webp`，实际加载宽度 1702；测试值随后恢复。生产验证结果以本次交付消息为准，真实人工验收仍由站主完成。

## 结论与生产只读证据

主要故障来自前端绑定和 Node API 保存/读取逻辑，核心数据库结构存在，不需要重建 Supabase。

核查目标：Supabase `opzucttggxvjykpyxfph`；生产站点 `https://starry-personalwebsite.vercel.app/`。全程使用内置浏览器检查生产配置和记录，未修改或删除生产数据、策略、bucket 或账号，也没有操作旧 portfolio 项目。

- Schema Visualizer 中确认 projects、assets、project_assets、site_settings、inquiries、upload_tasks、audit_logs 等表及 owner_id 已存在。
- projects 包含 cover_asset_id、location、client、sort_order；site_settings 包含 hero_asset_id、social_links、navigation 和 seo JSONB。
- Policies 页面显示所有业务表已启用 RLS；直接打开 owners manage settings，USING 与 WITH CHECK 均是 `(SELECT auth.uid()) = owner_id`，没有保存或改动该策略。
- site_settings 表有站主 UUID `d7e02365-db65-48cc-a93a-c632d6cea2fc` 的设置记录；线上后台可读到同样的品牌、简介与首屏配置。
- Storage 的 portfolio-media bucket 存在，Public bucket 关闭，有 4 条策略；bucket 列表显示全局单文件限制 50 MB。
- 线上后台的主色为 `#7caed5`；主站 DOM 的 `--olive` 也是 `#7caed5`，但实际 `.text-olive` computed color 仍为 `rgb(98,106,76)`。这是已保存且已读取、但 CSS 使用固定值的直接证据。

以上不是对所有数据库策略进行完整渗透审计，也不代表本轮代码已部署或生产写入回归已通过。

## 已修复字段链路

| 编辑入口 | 持久化位置 | 前台读取 | 原故障与修复 |
| --- | --- | --- | --- |
| 站点名称 | site_settings.site_name | 导航、页脚、后台品牌与页面标题 | 固定品牌改为设置字段；默认标识动画保留 |
| 简介 | site_settings.short_bio | 关于页、首页分享描述 | 修改后的简介不再被固定人物介绍遮蔽 |
| 联系邮箱与社交链接 | contact_email / social_links | 联系页、菜单与页脚 | 补齐社交链接编辑及协议校验 |
| 首屏标题、副标题 | hero_title / hero_subtitle | 首页 | 保持共用字段兼容；可设置优先的中英文文本 |
| 主色 | accent | Tailwind olive 与 CSS --olive | 转为可带透明度的 --olive-rgb，不再固定 #626a4c |
| 首屏图片 | hero_asset_id；外部图片在 seo.hero_image | 首页 | 私有图片保存 ID 并重新签名；旧同账号签名地址在保存时可转换为 ID |
| 首屏 Alt | seo.hero_alt | 首页图像 Alt | 后台支持编辑 |
| 首页文案、能力标题/说明、宣言、统计、页脚地点/跑马灯 | seo.content.texts | 对应页面 contentText | 前台与编辑器使用同一套稳定键；支持中文/英文 |
| 能力区 8 张图、关于肖像、联系图、服务 2 张图 | seo.content.images | 对应页面 siteImage | 支持上传、媒体库选择与 Alt；资产 ID 按 owner_id + ready + image 校验，读取时重新签名 |
| 项目封面 | projects.cover_asset_id | 首页、作品卡片与详情 | 使用资产 ID，避免签名地址变化导致封面丢失；切换封面清除旧样例 srcset/lqip |
| 项目内容、地点与客户 | projects 现有字段 | 作品与详情页 | 补齐地点与客户编辑 |
| 项目展示順序 | projects.sort_order | 首页、作品列表、详情前后项目 | 补齐前后台映射与排序控件 |
| 媒体顺序与 Alt | project_assets.position / assets.alt_text | 详情媒体 | 补齐上下移动；API 保留顺序与封面 Alt |
| 保存/发布/下线 | projects.status | 公开项目过滤 | 保存保留当前状态；单独下线为 archived；PATCH 省略媒体/状态时保留原值 |
| 媒体库 | assets，owner_id 过滤 | 后台图片选择器/媒体库 | 不再仅展示项目已经关联的媒体，未关联的站点图片也可复用 |

新增内容使用既有 JSONB，不改 RLS、不开放原始媒体桶，不需要追加数据库迁移。

## 验证证据

- 静态检查：`npm run typecheck`、`npm run lint`。
- 自动化：17 项 Vitest 回归，其中 React 实际编辑器验证保存→重新挂载主站、语言切换、封面选择与媒体排序、保持发布、演示上传与刷新持久化；Node API 使用明确标记的内存数据库替身验证 PUT→公共 GET、签名刷新、原 SEO 保留、账号隔离和无效 URL 拒绝。
- 原生浏览器运行：内置浏览器 `http://localhost:5173/admin/settings` 保存临时品牌、首屏标题、`/images/window.webp` 与 Alt，点击查看网站后首页与页脚都显示新品牌、标题和图片；刷新后仍保持。DOM 检查图像 `complete=true`、`naturalWidth=1800`。测试字段随后恢复为原始本地演示值。
- 生产构建：`npm run build`，本轮最终结果记录在交付消息。
- 真实人工验收：尚未由站主验收新版；本轮没有将代码推送/部署，也没有以本地演示结果冒充生产 Supabase 写入成功。

## 保留的边界与部署注意

- 目前本地没有真实 `.env.local`，仅能在本地验证演示持久化与模拟 API；后续部署需对新代码执行真实登录、Storage 上传、站点设置保存、作品发布/下线与联系表单生产回归。
- 现有 RLS、owner_id、Auth、API、发布过滤和后台入口均保留。原始媒体仍为私有；选择为站点图片并保存后，通过公开站点 API 提供短期签名访问。
- 电影风格的首屏场记、曝光参数、时钟等装饰标签仍属于设计模板；关于时间线及服务流程条目尚未做动态集合管理，本轮没有删除这些内容。
- 详情中的 camera、format、credits、coords 目前仅有前端样例字段，生产 projects 表尚无对应持久化字段，也无相应编辑控件。这是独立的详情元数据扩展缺口，不是本次首页编辑失效的原因；本轮不创建或伪造这些生产字段。
- 自动缩略图、视频海报与转码服务尚未接入。上传视频无海报时使用实际 video 预览；外部和上传图片不再虚构 AVIF/900px/blur 衍生地址。
- 上传使用共享 Tus 流程，任务按账号和文件信息缓存；失败重试替换当前失败条目，不重复追加。断点恢复需重新选择同一文件；尚未用生产大视频测试跨重启恢复。
- 50 MB 上限以当前实际 Supabase 平台为准；可配置更大上限，但必须先确认平台允许。演示文件限制 2 MB，以避免 localStorage 配额与 ObjectURL 刷新失效；保存失败不再静默宣称成功。
- 现有项目 PATCH 的关系同步仍由多个数据库请求组成；极端网络失败可能需要重新保存，完整事务化是独立后续工作。
