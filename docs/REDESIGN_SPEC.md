
# 目标（一句话）

把本仓库（Vite + React SPA + Tailwind，部署在 Vercel 的摄影/电影工作室作品集 “Studio / 01”）从“干净的模板感”升级为 **Awwwards 级、有电影质感的「Cinematic Quiet」网站**：保留现有的品牌 DNA，修复所有已知 UI 缺陷，加入一整套克制、高级、性能达标的动效与交互。下面的「完成判定」全部可验证通过才算完成。

# 完成判定（全部满足才能结束 Goal）

1. `npm run build` 零报错、零 TypeScript 错误，`npm run lint`（如果项目有）零 error。
2. 附录 §0 里列出的 11 个已知问题全部修复，每一条都在 `GOAL_PROGRESS.md` 里写明了修复方式和验证证据（截图路径或检测脚本输出）。
3. 里程碑 M1–M4 的每一条“验收”都打勾，并附上证据。
4. 运行 `scripts/verify.mjs`（你需要自己编写，见「验证协议」）全部通过：
   - 所有路由 × 视口 {1440×900, 1024×768, 390×844} 都没有横向溢出（`scrollWidth <= innerWidth`）；
   - 控制台 0 个 error；
   - 每个路由的 `document.title` 都不相同；
   - 所有 `<img>` 都有 `alt`，并且都有宽高或 `aspect-ratio`；
   - 在 `prefers-reduced-motion: reduce` 下，页面能正常渲染，所有内容可见（没有卡在 `opacity:0` 的元素）。
5. 对 `npm run preview` 跑 Lighthouse（移动端预设）检查首页和一个详情页：Performance ≥ 90、Accessibility ≥ 95、Best Practices ≥ 95、SEO ≥ 95。分数写进 `GOAL_PROGRESS.md`。
6. 你亲自看过所有路由在 3 个视口下的截图（存放在 `.goal/screenshots/`），确认没有压字、没有孤词断行、边距全站一致，并在进度文件里写下检查结论。

# 工作方式（自主执行规则）

- **不要停下来问我。** 遇到不确定的地方，按附录的设计意图自行决策，在 `GOAL_PROGRESS.md` 的「决策记录」里写一行：决策是什么、为什么。
- **分支与提交**：先 `git checkout -b redesign/cinematic`；每完成一个子任务就做一次小提交，每个里程碑结束时打 tag `m1-done` … `m4-done`。**禁止** push 到 main，**禁止**部署到 Vercel 生产环境，**禁止**改 git 历史。
- **执行循环**：读进度文件 → 选下一个未完成的任务 → 实现 → 运行验证 → 看截图自查 → 修复 → 提交 → 更新进度文件。验证没通过就不能把任务标为完成。
- **断点续跑**：每次开始工作（包括上下文被压缩之后）**先读 `GOAL_PROGRESS.md`**，从记录的位置继续，不要重复已经完成的工作。
- **优先级**：严格按 M1 → M2 → M3 → M4 的顺序。如果预算或时间不够，保证已完成的里程碑是完整可用的，而不是四个里程碑都只做了一半。
- **渐进改造**：在现有组件结构上改，不要整体重写；不改路由路径；不删任何现有页面；文案默认保留（只有附录里明确要求改的地方才改）。
- **依赖**：允许新增 `lenis`、`gsap`（包括 ScrollTrigger / SplitText，现在都免费）、`motion`、`@playwright/test`、`lighthouse` 或 `@lhci/cli`、`sharp`（图片处理）。除此之外，新增其他运行时依赖需要在决策记录里说明理由。WebGL（three / r3f）只允许在 M4 的可选项里使用。
- **素材**：没有真实素材时，用 Unsplash 上不重复、色调统一（暖调、低饱和、胶片感）的图片占位，下载到 `public/images/` 并用 sharp 生成 AVIF / WebP + LQIP。在 `GOAL_PROGRESS.md` 的「待替换素材」里列出所有占位图，方便我之后换成真实作品。
- **动画参数**全部集中写在 `src/lib/motion.ts`（时长、缓动曲线、stagger），方便我之后微调。

# 进度文件 `GOAL_PROGRESS.md`（第一步就创建）

```
# Goal Progress
## 当前状态：M? 进行中 / 下一步：...
## 里程碑
- [ ] M1 ...（每条验收 + 证据）
## 已知问题修复表（§0 的 1–11）
## 验证记录（日期 / verify.mjs 结果 / Lighthouse 分数）
## 决策记录
## 待替换素材
## 遗留问题 / 建议
```

# 验证协议（每个里程碑结束时都必须跑）

1. `npm run build`
2. `npm run preview` 后台启动 → `node scripts/verify.mjs`：用 Playwright 遍历路由 `/`、`/work`、`/work/<每个 slug>`、`/about`、`/services`、`/contact`、`/privacy`、`/does-not-exist`，在 3 个视口下执行“完成判定 4”的所有检查；对每个页面先滚动到底部再回到顶部（触发所有懒加载和揭示动画），等待 2.5 秒后整页截图，保存到 `.goal/screenshots/<route>-<width>.png`；再以 `reducedMotion: 'reduce'` 跑一遍。任何一项失败，脚本以非 0 退出码结束。
3. **亲自查看截图**，重点看：大标题的下伸字母（g / y / p）有没有压到下一行元素、标题有没有孤词断行、边距是否一致、暗场区块里文字的对比度。
4. M2 起，每个里程碑都跑一次 Lighthouse（移动端预设），把分数写进进度文件；分数掉到判定线以下就要先修复再继续。
5. `.goal/` 加入 `.gitignore`。

# 里程碑

## M1 地基（先修问题，再建系统）
- 建立设计 Token（附录 §1：颜色、字体、动效、质感层）。
- 修复附录 §0 的 11 个问题。
- 图片本地化 + AVIF/WebP + `srcset` + LQIP；Hero 图 `fetchpriority="high"` + preload；字体自托管 woff2 + 子集化。
- 每个路由独立的 title、description、OG 信息；sitemap.xml、robots.txt、JSON-LD。
- 无障碍基线：对比度、`:focus-visible`、触控目标、`prefers-reduced-motion` 的处理框架。
- 新建 `src/data/projects.ts`，填好 6 个项目的数据（字段见附录 §10）。
- **验收**：完成判定 1、2、4 通过；Lighthouse 达到判定线。

## M2 骨架动效
- 接入 Lenis + GSAP ScrollTrigger（同步方式见附录 §2），触屏设备关闭平滑滚动。
- 通用组件 `<RevealText>`、`<RevealImage>`、`<Marquee>`、`<MagneticButton>`、`<RollLink>`、`<DrawLine>`。
- 固定 Header（透明 / 毛玻璃两种状态切换、下滚隐藏上滚出现、实时时间、移动端全屏菜单）。
- 胶片颗粒层、分隔线画出动画、全站微交互（附录 §4.4）。
- **验收**：所有页面元素都有进场动效；reduced-motion 下动效全部降级为淡入；verify.mjs 通过；滚动时没有明显掉帧（用 Playwright 录一段 trace，检查是否有超过 50ms 的长任务）。

## M3 高光时刻
- Preloader（附录 §3.0）、Hero 宽银幕滚动（§3.2）、横向放映区 + 索引列表浮动预览（§3.3）、自定义光标、Capabilities 手风琴（§3.4）、Manifesto 逐词点亮（§3.5）、幕布式 Footer（§3.6）。
- 路由幕布转场 + 作品卡片 → 详情页的共享元素过渡（View Transitions API，Motion `layoutId` 兜底）。
- **验收**：附录 §3 每个区块都实现；所有能力都有降级（不支持 View Transitions、`pointer: coarse`、reduced-motion）；Lighthouse 仍然达到判定线。

## M4 详情页与其他页面
- 详情页（附录 §5）：元数据表、影像节奏布局、灯箱、自定义视频播放器、滚到底自动进入下一个项目。
- `/work` 的 FLIP 筛选 + 网格 / 列表视图切换；`/about`、`/services`、`/contact`、404（附录 §6）。
- 可选（时间允许再做）：作品 hover 的 WebGL 扭曲效果，必须懒加载，并且移动端不加载。
- **验收**：完成判定 1–6 全部通过，`GOAL_PROGRESS.md` 写好最终总结（做了什么、还有什么没做、需要我提供哪些素材）。

---

# 附录：设计规格

## §0 已知问题（必须全部修复）
1. 全站没有任何 `@keyframes`，过渡只有 Tailwind 默认的 150ms；hover 只有 `scale-[1.03]`。
2. Header 是 `position: static`，滚动后导航消失；右上角 “PHOTOGRAPHY FOR A QUIETER WORLD” 太小太浅，等于噪音。
3. Hero 被关在容器里（左右各留 32px），不是满屏出血；“PLACES / PEOPLE / PERSPECTIVE” 在部分宽度下消失。
4. Hero 的 CTA 没有主次之分；移动端两个按钮的边框几乎看不见。
5. `/work/northern-light`：大标题 “Light” 中 g 的下伸部分压在副标题上；主图左右只留约 10px，和全站 32px 的边距不一致。
6. “A quieter way to see the world.” 在 1024px 宽度下 “way” 单独成行 → 用 `text-wrap: balance` 并加宽标题列。
7. `/work` 的筛选器在中等宽度下折成两行，左边还有一条孤立的竖线。
8. 小标签 `10.88px`、全大写、透明度 0.5–0.6，对比度约 3:1 → 最小 12px，颜色用 `--ink-muted`，不再用 opacity 淡化。
9. 所有路由的 `<title>` 都相同；meta description 是中文，页面内容是英文；没有 OG 图。
10. Hero 图片 `loading="auto"`，没有 `fetchpriority`、`srcset`、AVIF、LQIP；直接外链 Unsplash。
11. 整站只有 3 张图，日落图在 Hero 和 “Field Notes” 中重复使用；首页只展示 2 个项目。

## §1 设计系统
**设计方向**：quiet luxury · cinematic · editorial · tactile。把网站当成一部放映中的电影：片头 → 开场长镜头 → 作品放映 → 旁白 → 片尾字幕。参考：Locomotive、Studio Freight、Obys、Aristide Benoist、A24 官网。克制，每个动效都必须服务于“胶片电影感”。

**颜色（CSS 变量 + Tailwind 配置）**
```
--paper #F4F1EA  --paper-2 #ECE8DF  --ink #1C1D1A  --ink-muted #5E5F58（对比度 ≥ 4.5:1）
--line rgba(28,29,26,.12)  --olive #626A4C  --olive-deep #3A3F2D
--ember #C8743A（取自 Hero 日落，只用于点睛：光标、进度、选中态、focus）
--night #0E0F0D（暗场区块；亮 → 暗 → 亮的节奏，背景色随滚动渐变而不是硬切）
```

**字体**
- 标题：Cormorant Garamond，字重 300/400 + Italic，正体与斜体混排（例如 `a more <em>conscious</em> tomorrow`）。
- 正文 / UI：DM Sans。
- 新增 Mono（JetBrains Mono 或 IBM Plex Mono），只用于胶片元数据：编号、坐标、时间码、`ƒ/2.8 · 1/250 · ISO 400`。
- 字号：Display `clamp(3.5rem, 11vw, 12rem)`（lh 0.9，ls -0.02em）/ H2 `clamp(2.5rem, 6vw, 6rem)` / H3 `clamp(1.5rem, 2.4vw, 2.25rem)` / Body `clamp(1rem, 1.1vw, 1.125rem)`（lh 1.6）/ Label 最小 12px，ls 0.18em。
- `font-feature-settings: "liga", "dlig", "onum"`，数据用 `"tnum"`；标题用 `text-wrap: balance`，段落用 `text-wrap: pretty`；line-height < 1 的标题与下一个元素之间至少留 0.25em。

**动效 Token（`src/lib/motion.ts`）**
```
easeOutExpo cubic-bezier(0.16,1,0.3,1)（揭示）   easeInOut cubic-bezier(0.76,0,0.24,1)（转场）
easeSoft cubic-bezier(0.22,1,0.36,1)（hover）
时长 xs 200 / s 400 / m 800 / l 1200 / xl 1600 ms
文字揭示 l + easeOutExpo，逐行 stagger 80ms；图片揭示 xl；hover 用 s + easeSoft
```
禁止再使用 Tailwind 默认的 easing。

**质感层**：fixed 定位的 SVG `feTurbulence` 噪点，opacity 0.06，亮场用 `multiply`、暗场用 `overlay`，用 `steps(8)` 每秒抖动 8–12 次；Hero 和暗场区块加径向暗角；所有分隔线 1px `--line`，进入视口时 `scaleX(0→1)` 画出（origin left，800ms）。

## §2 技术
- Lenis：`lerp 0.1`，触屏关闭平滑滚动；`lenis.on('scroll', ScrollTrigger.update)`，由 `gsap.ticker` 驱动 `lenis.raf`，并设置 `gsap.ticker.lagSmoothing(0)`。
- 重型库按路由懒加载；只对 `transform` / `opacity` / `clip-path` / `filter` 做动画；`will-change` 在动画结束后移除；离开视口的循环动画用 IntersectionObserver 暂停。
- 路由切换后通过 Lenis 回到顶部，同时更新 title / meta。

## §3 首页各区块
**§3.0 Preloader**（只在首次访问时播放，用 sessionStorage 记录）：纸色全屏，中央超大 Cormorant 数字从 000 计数到 100（tabular），右下角 Mono 显示 `LOADING REEL — 24 FPS`；中央小窗口以每张约 120ms 的速度闪过 4–5 张缩略图；结束时小窗口用 `clip-path: inset()` 放大成满屏 Hero 图（同一张，无缝衔接）。总时长 ≤ 2.4 秒，必须等关键图片预加载完成；reduced-motion 下跳过。

**§3.1 Header**：fixed；在 Hero 上方时透明 + 白字，离开 Hero 后纸色背景 + `blur(12px)` + 底部细线；下滚隐藏、上滚出现。Logo 的 “01” hover 时像老虎机一样滚动。导航链接用双层文字 roll + 下划线画出效果，当前路由前加 ember 色的 `•`。右侧显示 `REYKJAVÍK 14:32 GMT`（实时）+ `● AVAILABLE FOR Q1 2027`（状态点有呼吸动画）。移动端汉堡按钮用两条线变 ×，点击后 olive-deep 全屏幕布用 `clip-path` 落下，超大菜单项逐行 stagger 进场，底部放邮箱和社交链接。

**§3.2 Hero**：满屏出血，`100svh`。往下滚（scrub + pin，约 1 屏距离）时图片用 `clip-path` 收缩成 **2.39:1 宽银幕**（上下黑边），内层图片 `scale 1.15→1`，标题向上视差并淡出。静止时做 20 秒一周期的 Ken Burns（scale 1→1.06）。鼠标视差：图片 ±12px、标题 ±6px，带 lerp 阻尼。标题改为 `Visual stories for a more <em>conscious</em> tomorrow`，用 SplitText 按行遮罩，从 `yPercent 110` 升起。四个角放 Mono 元数据：`SCENE 01 — TAKE 03` / `N 64°08′ · W 21°56′` / `ƒ/2.8 · 1/250 · ISO 400` / 以 24fps 实时跳帧的时间码，再加上取景器的 L 形角线。CTA：主按钮 `VIEW WORK` 实心纸色，hover 时 ember 色从下往上填充，并带磁吸效果（80px 范围，最大位移 10px）；次按钮是文字 + 下划线画出效果。底部中央放 `SCROLL` 提示线。“PLACES · PEOPLE · PERSPECTIVE” 做成随滚动速度变速、随滚动方向反向的跑马灯。（可选：替换成 8–12 秒无声循环视频，WebM + MP4，poster 用第一帧。）

**§3.3 Selected Work**：
- A. 暗场横向 pin 放映区：展示 6 个项目，卡片比例在 4:5、16:9、2.39:1 之间交替，垂直位置错落；每张图在框内反向视差；卡片下方用 Mono 显示 `01 / NORTHERN LIGHT — FILM — ICELAND — 2026`；顶部有 ember 色进度条 + `03 / 06` 计数；按滚动速度加 `skewX`（最大 ±4°），停下时用弹簧回正。
- B. 亮场索引列表：每行 = 编号 + 超大项目名 + 类型 + 年份，行间细线分隔。hover 时出现跟随鼠标的预览图（lerp 0.12、按速度旋转 ±6°、用 clip-path 从中心展开），当前行文字左移 24px、其他行降到 30% 透明度，切换行时预览图像老虎机一样纵向滚动切换。移动端改为每行显示缩略图。
- 自定义光标：作品区域内变成 88px 圆形，图片项目显示 `VIEW`、视频项目显示 `PLAY ▶`，`mix-blend-mode: difference`，只在 `pointer: fine` 下启用。

**§3.4 Capabilities**：全宽手风琴列表，每行 = `(01)` 斜体编号 + 超大名称 + `+`；展开时显示描述、3 张 stagger 揭示的小图和交付物标签，`+` 旋转成 ×，olive 色从左往右扫入、文字反白；高度动画用 `grid-template-rows: 0fr→1fr`。

**§3.5 Manifesto**：满宽、`balance` 排版；随滚动 scrub 逐词点亮（透明度 0.15→1）；句中嵌 1–2 张字高的胶囊形行内图，进入视口时宽度从 0 展开；下方 3 个计数器：`12 COUNTRIES / 48 STORIES / 9 YEARS`。

**§3.6 CTA + Footer**：幕布式揭示（footer `sticky bottom:0` 压在内容下方，被揭开时从 `scale 0.95` 归位），olive-deep 背景；撑满视口宽度的 `Let's talk.`，hover 时变为斜体；点击邮箱复制到剪贴板，文字原地滚动成 `COPIED ✓`，1.5 秒后恢复；三栏信息：地点 + 实时时间 / 社交链接（↗ 飞出飞回）/ 版权 + 用 Lenis 平滑滚回顶部的按钮；最底部放一条片尾字幕风格的跑马灯。

## §4 全站交互
- **§4.1 转场**：olive-deep 幕布升起（700ms，easeInOut），中央显示目标页面名，再向上离开。作品卡片 → 详情页使用共享元素过渡（View Transitions API，Motion `layoutId` 兜底）。
- **§4.2 `<RevealImage>`**：外层 `clip-path inset(100% 0 0 0)→inset(0)`，内层 `scale 1.3→1`，1.6s；揭示前先显示 LQIP，绝不出现白块；图片自带 `yPercent ±8` 的滚动视差。
- **§4.3 `<RevealText>`**：标题按行遮罩上升；Mono 标签逐字符出现；段落淡入 + `y 24→0`。
- **§4.4 微交互**：箭头 hover 时双箭头循环；按钮按下 `scale(0.97)`；下划线从左画出、向右消失；`::selection` 用 olive 背景 + paper 文字；细 olive 色滚动条；切到其他标签页时 title 变成 `🎞 Come back to the story…`；详情页 `←` / `→` 切换项目，`Esc` 关闭菜单和灯箱。

## §5 项目详情页
大标题 + 元数据表（Client / Role / Location / Year / Camera / Format，细线分隔）；主图满宽出血（由共享元素过渡而来）；图片按“满宽 → 两张错位 → 竖幅偏右配左侧文字 → 宽银幕 → 三联图”的节奏排列，边距与全站一致；每张图下方标注 `FIG. 02 — Þingvellir, 05:42`；灯箱支持键盘、手势、捏合缩放，并从原位置放大进入；自定义视频播放器（细进度线 + 时间码）；页面底部是下一个项目的大图，继续往下滚会推进进度条，到 100% 自动转场（同时可以直接点击跳转）。

## §6 其他页面
- `/work`：单行 pill 筛选器 + `layoutId` 滑块，切换分类时网格用 FLIP 重排，窄屏下横向滚动、不折行；提供网格 / 列表视图切换。
- `/about`：肖像默认黑白、hover 变彩色；横向时间线；灰度 logo 墙；大号引言。
- `/services`：手风琴列表 + 流程四步（Discover → Shoot → Edit → Deliver），pin 住后逐步点亮。
- `/contact`：底边线输入框 + 浮动标签，项目类型用多选 pill，预算用滑块，提交按钮带磁吸效果；成功后表单折叠成 `Thank you — we'll be in touch within 48 hours.`；旁边放坐标和实时时间。
- 404：一张失焦照片 + `Out of focus.` + 返回首页按钮。

## §7 性能
LCP < 2.0s（4G）、CLS < 0.05、INP < 150ms，滚动 60fps；字体 `font-display: swap` + 配置 `size-adjust` 的回退字体。

## §8 无障碍
reduced-motion 下关闭 Lenis、视差、Ken Burns、跑马灯和颗粒抖动，揭示动画改为 200ms 淡入；对比度 ≥ 4.5:1（大字 ≥ 3:1）；`:focus-visible` 用 2px ember 外框 + offset 4px；装饰元素加 `aria-hidden`；SplitText 拆分后保留原文的 `aria-label`；触控目标 ≥ 44px。

## §9 SEO
每个路由独立的英文 title / description（例如 `Northern Light — Film, Iceland 2026 | Studio / 01`）；OG 图 1200×630；`Organization` / `CreativeWork` JSON-LD；sitemap.xml、robots.txt。是否做 SSG 预渲染（`vite-plugin-ssg` 或类似方案）自行评估，写进决策记录。

## §10 数据结构
`projects.ts` 中每个项目包含：slug、title、category（film / photography / brand / editorial / interior）、year、location、coords、cover {src, lqip, w, h}、gallery[]、video?、credits、camera、description。共 6 个项目，**任何一张图片都不能在两个地方重复使用**；全站图片统一轻微调色（`saturate(0.9) contrast(1.05)`），像同一套胶片拍出来的。
