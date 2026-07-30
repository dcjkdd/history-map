# MVP-00：ChatGPT Pro 协作与 Codex 独立验收

## 结论

MVP-00 前端工程骨架已在本地完成，符合静态前端边界，并通过 Node
24.18.0 / npm 11.16.0 下的类型检查、组件测试和生产构建。

ChatGPT Pro 的原始交付不能直接作为合格实现使用：它未生成
`package-lock.json`，未安装依赖，也未运行 `npm ci`、类型检查、测试、构建或
`npm audit`。对话页面只给出了容器内路径和声称的摘要值，没有提供可下载的
patch/ZIP 附件，因此这些输出未应用到仓库，其大小与摘要也不能独立复核。

## 基线与交接材料

- 源码基线：`9ba3dea4bf0fc0661fcdc26b17a49dbfbb98e767`
- 基线分支：`master`
- 发送给 ChatGPT Pro 的压缩包：`history-map-9ba3dea-mvp00.zip`
- 压缩包大小：`58,664 bytes`
- 压缩包 SHA-256：`73b01190b787663772e08a342904cdf8eecfcb1e01410cccb601b0dd549519f8`
- ChatGPT Pro 对话：
  <https://chatgpt.com/c/6a6a9f6d-bd40-83ec-8309-d3380579256e>

压缩包排除了 `.git`、`node_modules`、构建产物、缓存、数据库、运行状态、
浏览器状态、`.env`、凭据和原始归档；上传前完成了压缩包完整性、Unicode
路径和常见敏感项检查。

## ChatGPT Pro 交付审查

ChatGPT Pro 声称生成了以下文件，但对话页面没有对应的下载控件：

- `/mnt/data/output/mvp00.patch`
  - 声称大小：`4,833 bytes`
  - 声称 SHA-256：
    `afc50f810c6a33ae7ea0d166d7ac2ac774425c95e91ba6d94e6f3384041db36c`
- `/mnt/data/output/mvp00-files.zip`
  - 声称大小：`3,991 bytes`
  - 声称 SHA-256：
    `a0759f95d46eca49e573c3b54367cf2c2044c4d773344378f9895890e4e81722`

主要缺陷：

1. 缺少任务要求的 npm v11 `package-lock.json`。
2. 依赖版本只做了静态猜测，未通过 npm registry 或实际安装验证。
3. 没有运行任何强制门禁。
4. patch 和 ZIP 没有以可下载附件交付，无法应用或复算摘要。

因此，本次没有把 ChatGPT Pro 的输出直接合入仓库。

## 第二轮限时代码审查

在本地实现和独立门禁完成后，按“Codex 主编码、ChatGPT Pro 只审查”的新模式
建立了独立对话：

- 对话：
  <https://chatgpt.com/c/6a6ae258-9434-83ec-847e-98d9576036cc>
- 审查包：`history-map-mvp00-review-9ba3dea.zip`
- 大小：`90,270 bytes`
- SHA-256：
  `448447c469c95080b5d768fded74ad8b7b08ba7be2cb6f4970d229a993c5032b`
- 用时：约 7 分 28 秒
- 裁决：通过
- 必须修复：P0–P3 均无

审查包包含当前真实前端源码、npm v11 lockfile、完整工作树 patch、Node 24
下的 `npm run check` 日志、直接依赖树和 npm 审计结果。任务明确禁止安装依赖、
生成 lockfile、排查 Node/DNS/registry/Docker/代理或搜索网站；本轮 Pro
遵守了这些边界。

Pro 提出 3 项可选建议，Codex 独立裁决如下：

1. 接受：将“安史之乱”测试从整个容器的包含判断收紧为 `.topic-label` 的完整
   文本断言，避免未来其他区域出现相同文字时形成假阳性。
2. 暂不接受：当前不增加 `main.ts` 入口挂载测试。生产构建和真实浏览器检查
   已覆盖入口链路；为一个三行入口引入额外副作用隔离不符合 MVP-00 的最小
   边界。
3. 接受：在本报告中明确审查包的证据范围。该包包含 `npm run check`、直接
   依赖和审计证据，但不包含早期依赖尝试、`npm ci`、浏览器截图、静态扫描和
   Git 远程状态的全部原始输出；这些结论由 Codex 本机独立执行，不能仅凭
   审查包复核。

## 本地实现与修正

本地新增 `frontend/` 最小工程：

- Vue 3 + TypeScript + Vite 应用入口；
- 首页显示“中国古代战争地形地图”“安史之乱”和“数据尚未加载”；
- 注册 Pinia，但不创建业务 store；
- 安装 MapLibre GL JS，但不导入、不初始化地图，也不加载地图样式；
- 不创建路由、组件库、地图画布、时间轴、业务类型、业务数据或网络请求；
- `.env.example` 只保留公开浏览器配置的空说明；
- 组件测试直接通过 Vue 挂载，精确验证标题、专题标签和状态，不依赖网络；
- `check` 依次执行类型检查、测试和生产构建。

独立修正：

1. TypeScript 7.0.2 与当前 `vue-tsc` 不兼容，改为通过实际类型检查的
   TypeScript 6.0.3。
2. 初始候选 `@vue/test-utils` 依赖链带来高危审计项；移除该依赖，改用
   Vue 原生 `createApp` 完成同等的最小组件测试。移除后审计为 0 项漏洞。
3. 使用 npm 11.16.0 生成 lockfile v3，并锁定全部直接依赖版本。

直接依赖版本：

- `vue@3.5.40`
- `pinia@4.0.2`
- `maplibre-gl@6.0.0`
- `vite@8.1.5`
- `typescript@6.0.3`
- `@vitejs/plugin-vue@6.0.8`
- `vue-tsc@3.3.8`
- `vitest@4.1.10`
- `jsdom@30.0.1`
- `@types/node@24.13.3`

## 独立验收结果

执行环境：

- Node：`v24.18.0`
- npm：`11.16.0`

结果：

- `npm ci`：通过；
- `npm run typecheck`：通过；
- `npm run test`：通过，1 个测试文件、1 个测试；
- `npm run build`：通过，Vite 生产构建生成 HTML/CSS/JS；
- `npm run check`：通过；
- `npm ls --depth=0`：直接依赖版本与 `package.json` 一致；
- `npm audit --audit-level=high`：0 项漏洞；
- 静态范围扫描：未发现业务 `fetch`、Axios、`XMLHttpRequest`、WebSocket、
  Vue Router、ECharts、UI 组件库、Turf、Cesium、deck.gl 或
  `mvp-v1.json`；
- MapLibre 源码扫描：未发现导入或地图实例；
- 常见凭据模式扫描：未发现命中；
- 浏览器检查：页面可加载，三项必需文本可见，桌面布局无明显异常；
- `git diff --check` 和新增文件尾随空白检查：通过。

npm 11 对 Vite 的可选 macOS 文件监听依赖 `fsevents@2.3.3` 给出未批准安装
脚本提示；该包为可选依赖，未批准不影响当前类型检查、测试或构建，且不属于
审计漏洞。

## 当前状态

基线文档提交 `9ba3dea` 已推送到 `origin/master`。MVP-00 的 `frontend/`
实现和本审查记录仍是本地未提交改动；没有创建 PR、没有部署，也没有修改线上
配置或真实用户数据。
