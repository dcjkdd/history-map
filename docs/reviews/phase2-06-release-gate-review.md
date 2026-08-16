# PHASE2-06 二期内容与空间发布门禁候选评审

> 日期：2026-08-16
> 基线：`32a6acd1d3be27fa0313cccbb0a31b753938a85d`
> 评审状态：`APPROVED`
> 实现状态：`COMPLETED_PENDING_COMMIT`
> PHASE2-06：`ENGINEERING_VERIFIED_PENDING_COMMIT`
> 范围边界：本文只提出 PHASE2-06 的最小审核结构与失败判定，不批准实现，不进入 PHASE2-07。

## 1. 现场基线

2026-08-16 开始审计时已重新核对：

- 独立 worktree 处于 detached HEAD，工作区干净；`HEAD`、本地 `master`、本地 `origin/master` 和 GitHub `refs/heads/master` 均为 `32a6acd1d3be27fa0313cccbb0a31b753938a85d`。
- 远端为 `git@github.com:dcjkdd/history-map.git`，没有发现交接后漂移。
- 仓库根不存在 `.codegraph/`，因此按注入规则跳过 CodeGraph；仓库内未发现额外 `AGENTS.md`。
- Node `24.18.0`、npm `11.16.0`；`npm --prefix frontend ci` 完成。npm 仅提示可选原生包 `fsevents@2.3.3` 的脚本策略，没有安装失败。
- 修改前 `npm --prefix frontend run check` 中 typecheck、正式数据校验、正式内容审计、PHASE2-03 和 PHASE2-04 内容门禁均通过；完整测试在 `tests/data/mvp-integrity.test.ts` 的子进程失败用例处发生一次 5 秒超时，导致基线 `check` 未整体通过，也未继续到构建。该文件随后单独复跑为 `15/15` 通过，当前证据更符合冷启动并发瞬时超时；本文不把首次基线 `check` 记为通过，也不据此修改测试时限。

关键文件现场 SHA-256：

| 对象 | SHA-256 | 结论 |
| --- | --- | --- |
| `frontend/public/data/anshi/mvp-v1.json` | `34927c09eb03f37e2b7d884afb34172dc9990bc3549a6c1638813ddc251beee6` | 与冻结值一致 |
| `frontend/package-lock.json` | `d2aa04cb6893326b206629ad8f8b3e3db573d1632fc847451aa5db888e9c7f22` | 与冻结值一致 |
| `data/curated/anshi-mvp-source-notes.md` | `e252fe1ec3e7d919cf83e40b4cc470d77492fc6ad2d16d46064b3e6ffd8d943c` | 与冻结值一致 |
| `docs/reviews/anshi-mvp-content-review.md` | `16199c15c5dca0e468e2d3ebbbe7c599fca0c151d18fb21682bc582762dfe087` | 与冻结值一致 |
| `frontend/public/terrain/phase2-02/manifest.json` | `54268b52b5e4d2753296682c540aa970a47a4f65945c46265dd9a493e0a34b44` | 作为候选门禁的新增冻结基线 |

## 2. 冻结边界

无论采用哪一方案，PHASE2-06 都不得自动改变下列事实：

- 正式 JSON、lockfile、既有资料笔记、既有内容审核表和全部历史 Source / Citation / Claim 保持不变。
- 5 个 Place 继续为 `DISPUTED`；3 个 Geography 继续保留；3 个 RouteSegment 继续为两点几何、`INFERENCE / LOW`；6 个 Event 继续为 `APPROXIMATE`。
- 正式审核外仍保留 9 个 `PENDING_REVIEW`、5 个 `PENDING_SOURCE`、2 个 `REJECTED`；PHASE2-04 只关闭自身 display-only 来源缺口，不升级正式走廊候选。
- PHASE2-03 的现代河流总体流向、关中东部低地标签、反向复用 `route-tang-advance-01` 的 22px display-only 通道保持不变。
- PHASE2-04 的方向、Haversine 平均地球半径 `6371.0088 km`、最近 5 km 取整、`约 120/80/55 公里`、燕军四句与唐军四句说明保持不变。
- PHASE2-05 的地图优先布局、紧凑时间轴、短解释和按需引用保持不变。

## 3. 现有结构审计

### 3.1 已能覆盖的内容

| 现有结构 | 已覆盖能力 | 可直接复用的对象 |
| --- | --- | --- |
| 正式 `Source.provenance` | URL、访问日期、许可名/URL、署名、使用限制、数据版本、原始 CRS、覆盖范围、处理记录、输出 ID | 已进入正式 JSON 的历史与空间来源 |
| 正式 Geography / Claim / Citation | 稳定 ID、几何或论断、引用链、确定性、人工审核映射 | 黄河、渭河、秦岭及其正式 Claim / Citation |
| 正式 RouteSegment | 稳定 ID、两点几何、端点 Place、`INFERENCE / LOW`、引用链 | 三段现有解释性路线及距离输入 |
| 地形 manifest | 资产集 ID、来源 URL/版本或 commit、输入/输出 hash 与字节、覆盖框、处理步骤、许可、署名、离线运行标志、80 项资产清单 | GLO-90 色带/DEM/山体阴影和现代省界资产 |
| PHASE2-03/04 资料笔记与审核表 | display-only 候选 ID、来源/引用、边界、审核人/日期/状态 | 河流流向、低地、通道、方向、距离方法、三项距离与说明 |
| `audit:content` | 正式集合一对一审核映射、正式空间来源元数据、引用闭包、状态与数量、不确定性、占位符 | MVP-11 正式发布集合 |
| `verify:phase2-03-content` / `verify:phase2-04-content` | 固定候选行、冻结 hash、既有状态数量、几何/方向/距离/文案语义 | 已批准 display-only 内容 |
| `verify:terrain-assets` | manifest、文件、hash/字节/数量/体积、许可/署名、无原始 COG/zip、常见秘密模式 | PHASE2-02 地形资产闭包 |
| `verify:worker-bundle` | 构建产物中单一 MapLibre worker 及其相对模块引用闭包 | 根 base 或指定构建目录 |

### 3.2 尚不能覆盖的内容

| 缺口 | 当前原因 | PHASE2-06 所需补足 |
| --- | --- | --- |
| 地形/边界的审核状态 | manifest 没有审核人、日期、状态；PHASE2-01/02 文档不是机器可关联的发布记录 | 建立稳定发布记录并指向 manifest 来源、资产集、source/layer ID |
| 访问日期和 CRS 的统一机器校验 | manifest 有来源/覆盖/处理，但访问日期和源 CRS 分散在研究文档；正式 `Source.provenance` 未承载这两个外部资产源 | 用最小来源记录补齐，不改正式 `Source` 集合 |
| 运行时对象到批准行的映射 | 现有 PHASE2-03/04 门禁主要匹配 Markdown 行和代码语义，不能证明每个 MapLibre source/layer/feature/method/UI 文案都有审核记录 | 显式列出 release mapping，并从代码与构建产物反向核对 |
| 通道的正式走廊歧义 | 正式 `geography-guanzhong-corridor` 仍是 `PENDING_SOURCE`；当前展示实际是反向复用两点路线的 display-only 通道 | 只能映射为 display-only 记录，不得新建或批准正式 Corridor Geography |
| 距离方法的发布实体 | `PHASE2-04-METHOD-DISTANCE-01` 已批准，但只存在于 Markdown 和运行时代码常量 | 建立方法发布记录，绑定常量、三个 RouteSegment 输入和三项“约”输出 |
| 确定性/显示语义的统一枚举 | 正式数据、地形、现代边界和 display-only 候选分别使用不同文字边界 | 发布记录必须明确 `MODERN_REFERENCE`、`FORMAL_UNCERTAIN` 或 `DISPLAY_ONLY_INFERENCE`，审计禁止相互升级 |
| PENDING/REJECTED 与发布集合隔离 | 正式审计能保护正式集合，但不会解析所有 `Phase2*` 审核行，也没有空间发布集合 | 新门禁只允许逐项 `APPROVED` 映射，任何待审/拒绝引用立即失败 |
| manifest 自身漂移 | manifest 校验其所列资产，但没有外部冻结该 manifest 的 hash | PHASE2-06 固定 manifest hash，并继续逐资产闭包校验 |
| 双 base、秘密与运行时外网的合并判定 | worker、terrain、构建和秘密检查分散；现有地形脚本只扫描有限文本范围 | 新发布门禁统一编排根 base 与 `/history-map/` 构建验证，并扫描跟踪文件及产物 |

结论：现有正式实体足以承载历史内容，现有 manifest 足以承载资产清单，但缺少一个连接“来源/审核—运行时对象—构建产物”的机器可读发布映射。为四类对象各增加完整正式实体会重复数据并破坏冻结集合，不是最小方案。

## 4. 四类对象的最小候选

### 4.1 Terrain

- **复用现有记录**：复用 `phase2-02-glo90-topdown` manifest、Copernicus 来源/许可/处理/资产清单、`phase2-terrain-color-relief`、`phase2-terrain-dem` 和对应图层 ID。
- **新增审核结构候选**：不新增正式 Terrain 实体；新增一条通用 `Phase2ReleaseRecord`：`P2R-TERRAIN-GLO90-TOPDOWN-01`，引用 manifest 与专用来源记录，审核运行时映射和“现代地形参考、非唐代复原”语义。

### 4.2 Boundary

- **复用现有记录**：复用 manifest 中 geoBoundaries `CHN-ADM1-43563684`、commit `9469f09`、CC BY 4.0 / 上游 public-domain 说明、`provinces.geojson` 与现代省界 source/layer ID。
- **新增审核结构候选**：不新增正式 Boundary 实体；新增 `P2R-BOUNDARY-CHN-ADM1-MODERN-01`，只批准现代河南/陕西方位参考及“（今）”显示，明确不是唐代边界。

### 4.3 Corridor

- **复用现有记录**：复用正式 `route-tang-advance-01` 两点几何、PHASE2-03 `PHASE2-GEOMETRY-EAST-GUANZHONG-01` / `PHASE2-CLAIM-EAST-GUANZHONG-01` 及其批准边界。
- **新增审核结构候选**：不新增正式 Geography/Corridor；新增 `P2R-CORRIDOR-EAST-GUANZHONG-DISPLAY-01`，只映射 `display-east-guanzhong-corridor`、22px 屏幕宽度和相关 source/layer。记录必须写明反向复用、两点直线、display-only、非道路/行军线/历史宽度。

### 4.4 DistanceMethod

- **复用现有记录**：复用 `PHASE2-04-METHOD-DISTANCE-01`、三个正式 RouteSegment、五个 `DISPUTED` 现代代表点、Haversine 常量与三个已批准结果。
- **新增审核结构候选**：不新增正式 DistanceMethod 实体；新增 `P2R-DISTANCE-HAVERSINE-MODERN-01`，映射 `EARTH_MEAN_RADIUS_KM`、`ROUTE_DISTANCE_ROUNDING_KM`、固定说明、三个输入/输出。门禁要求所有面向用户结果包含“约”和“现代代表点”，并禁止历史道路/行军里程语义。

## 5. 推荐方案 A：独立、通用的二期发布登记簿

人工批准后，新增 `data/curated/phase2-spatial-release-v1.json`。它是 PHASE2-06 的审核与发布登记簿，不是历史领域数据，不进入 `MvpDataset`，也不由 assemble 脚本写入正式 JSON。

登记簿只包含两类节点：

1. `sources`：只补充尚未进入正式 Source 集合的 Copernicus DEM 与 geoBoundaries 两个空间来源。已有正式或 PHASE2-03/04 来源只按稳定 ID 引用，不复制正文。
2. `records`：使用统一 `Phase2ReleaseRecord` 映射已发布对象，不为 Terrain、Boundary、Corridor、DistanceMethod 各造一套类型。

### 5.1 来源记录必填字段

| 字段 | 判定 |
| --- | --- |
| `id` | 稳定 ID：`P2SRC-COPERNICUS-GLO90-2021-01`、`P2SRC-GEOBOUNDARIES-CHN-ADM1-9469F09-01` |
| `institution` / `title` / `version` / `url` | 来源机构、数据集名称、版本或固定 commit、来源入口均不能为空 |
| `accessDate` | ISO 日期，来自现有执行/来源审计记录；不得推测 |
| `coverage` / `originalCrs` | 明确源覆盖与 CRS；还须区分裁切后的显示范围/输出 CRS |
| `processing` | 按顺序记录裁切、重投影、派生、编码、简化或标签生成；不得只写“已处理” |
| `license.name` / `license.url` | DEM 或边界任一缺失立即失败 |
| `license.redistribution` / `license.attribution` / `license.restrictions` | 明确可再分发范围、必须署名/免责声明和使用限制；不得以“开源”代替 |
| `runtimeDependencies` | 明确 `networkRequired=false`、无 Token/个人账户/私钥，并列出本地输出 ID |
| `review.status` / `review.reviewer` / `review.date` | 只有逐项人工 `APPROVED` 且审核人/日期完整才能进入发布集合 |

### 5.2 发布记录必填字段

| 字段 | 判定 |
| --- | --- |
| `id` / `kind` | 稳定 ID；`kind` 限定为 `TERRAIN`、`BOUNDARY`、`HYDROGRAPHY`、`LANDFORM`、`CORRIDOR`、`DISTANCE_METHOD`、`PRESENTATION` |
| `sourceRefs` / `reviewRefs` | 必须解析到正式 Source/Claim/Citation、PHASE2 审核行或上述来源记录；不能引用不存在、`PENDING_*` 或 `REJECTED` 项 |
| `coverage` / `crs` / `processing` | 可通过明确字段继承来源记录，但审计后必须得到非空值；不允许隐含继承 |
| `license` / `attribution` / `redistribution` | 可继承来源记录；所有可见或可下载派生物都必须能反查许可与署名 |
| `runtimeDependencies` | 列出本地路径、MapLibre source/layer、feature/method/UI 映射；禁止 Token、私钥、内部许可数据和未声明运行时外网资源 |
| `semantics` | 必须包含 `scope`、`certainty`、`displayOnly` 和禁止解释；只允许 `MODERN_REFERENCE`、`FORMAL_UNCERTAIN`、`DISPLAY_ONLY_INFERENCE` 三类确定性语义 |
| `review.status` / `review.reviewer` / `review.date` | 发布对象本身也需人工批准，不能只依赖来源已批准 |
| `releaseMappings` | 至少一项，类型限定为 manifest/asset/path/source/layer/feature/formal entity/method/constant/UI copy；每一项必须由新门禁反向核对 |

### 5.3 候选发布记录清单

批准方案后，登记簿拟只包含以下 10 条发布记录；审核状态在用户明确批准前一律为 `PENDING_REVIEW`，审核人/日期留空：

| 发布记录 ID | 类型 | 复用依据 | 必须覆盖的运行时映射 |
| --- | --- | --- | --- |
| `P2R-TERRAIN-GLO90-TOPDOWN-01` | TERRAIN | 地形 manifest / Copernicus 许可 | asset set、色带、78 个 Terrarium tile、terrain sources、色带/山体阴影 layers |
| `P2R-BOUNDARY-CHN-ADM1-MODERN-01` | BOUNDARY | manifest / geoBoundaries 许可 | `provinces.geojson`、现代省界 source、fill/outline/label layers、“（今）”语义 |
| `P2R-HYDROGRAPHY-YELLOW-RIVER-01` | HYDROGRAPHY | 正式黄河 Geography + PHASE2-03 流向批准行 | 正式 feature、`flow-geography-yellow-river`、河流 layer 与 flow layer |
| `P2R-HYDROGRAPHY-WEI-RIVER-01` | HYDROGRAPHY | 正式渭河 Geography + PHASE2-03 流向批准行 | 正式 feature、`flow-geography-wei-river`、河流 layer 与 flow layer |
| `P2R-LANDFORM-QINLING-01` | LANDFORM | 正式秦岭 Geography / Claim / Citation | 正式 feature 与山地显示 layers；保留 `UNKNOWN`，不生成历史通行边界 |
| `P2R-LANDFORM-GUANZHONG-LOWLAND-01` | LANDFORM | PHASE2-03 低地来源/引用/标签批准行 | 固定锚点 `[109.68,34.40]`、`display-guanzhong-east-lowland-label` 和 label layer |
| `P2R-CORRIDOR-EAST-GUANZHONG-DISPLAY-01` | CORRIDOR | PHASE2-03 通道批准行 + `route-tang-advance-01` | 反向两点 feature、22px 屏幕宽度、无方向 band/edge/label layers |
| `P2R-DISTANCE-HAVERSINE-MODERN-01` | DISTANCE_METHOD | PHASE2-04 方法与三项距离批准行 | 两个常量、固定说明、三个 RouteSegment、`约 120/80/55 公里` UI 输出 |
| `P2R-PRESENTATION-ROUTE-YAN-01` | PRESENTATION | PHASE2-04 方向/语义/四句说明批准行 | 向西箭头/标签、燕军四句、`INFERENCE / LOW` 与来源入口 |
| `P2R-PRESENTATION-ROUTE-TANG-01` | PRESENTATION | PHASE2-04 方向/语义/四句说明批准行 | 向东箭头/标签、唐军四句、`INFERENCE / LOW` 与来源入口 |

这 10 条记录只审核现有发布物，不新增任何地形、边界、河流、地貌、通道、路线、距离或 UI 内容。

## 6. 自动门禁候选

批准后新增 `verify:phase2-06-release`，并复用而不是替代已有门禁。推荐分为可测试的纯审计模块和命令入口：

1. 读取发布登记簿、正式 JSON、资料笔记、内容审核表、地形 manifest 和运行时代码映射。
2. 核对正式集合数量、不确定性与历史审核状态；固定正式 JSON、lockfile、资料笔记、内容审核表和 manifest hash。
3. 核对 10 条发布记录、2 条新增空间来源记录及所有引用一对一闭包；没有审核映射的运行时 source/layer/feature/method/UI 文案视为“孤儿发布物”。
4. 调用或等价复用 `audit:content`、PHASE2-03/04 内容门禁、`verify:terrain-assets` 和 `verify:worker-bundle` 的结论；不得用新脚本降低旧门禁。
5. 核对 manifest 的 15 个未提交源输入、80 个输出、78 个 tile、逐文件 hash/字节和 10 MiB 预算；禁止原始 COG/zip 进入跟踪或构建产物。
6. 对根 base 和 `/history-map/` 两个可控构建目录分别核对：HTML/JS/CSS/数据/terrain URL 均在相应 base 内，worker 闭包完整，无远端运行时资产、Token、私钥、内部许可数据或未授权派生产物。
7. 错误格式统一包含 `对象 ID + 字段路径 + 原因`，例如：`[P2R-DISTANCE-HAVERSINE-MODERN-01] semantics.approximateLabel: 缺少“约”`。

为避免构建递归，内容/映射审计进入常规 `build` 前置步骤；双 base 由独立的 PHASE2-06 静态闭包命令顺序构建到明确目录后调用同一产物验证器。最终 `check` 编排两者，但不会进入 PHASE2-07 的浏览器、性能或产品签字矩阵。

## 7. 必须失败的测试

| 编号 | 故意损坏 | 期望错误定位 |
| --- | --- | --- |
| F01 | DEM 来源缺 `license.name` 或 `license.url` | Terrain 记录 ID + `license.*` |
| F02 | DEM 缺完整 Copernicus 署名或免责声明 | Terrain 记录 ID + `attribution` |
| F03 | 行政边界缺 CC BY 4.0 / 上游许可说明、再分发判断或署名 | Boundary 记录 ID + 对应许可字段 |
| F04 | `display-east-guanzhong-corridor` 或任一 corridor layer 没有批准映射 | Corridor 记录 ID + `releaseMappings` |
| F05 | 距离记录缺方法、半径、取整单位或固定免责声明 | DistanceMethod 记录 ID + 方法字段 |
| F06 | 120/80/55 任一 UI 结果缺“约”或“现代代表点” | DistanceMethod 记录 ID + 具体 RouteSegment 输出 |
| F07 | 解释性路线、通道或河流流向被标为确定历史路线/道路/河道 | 对应记录 ID + `semantics.certainty` / `displayOnly` |
| F08 | 任一发布记录或其 review/source 引用为 `PENDING_SOURCE`、`PENDING_REVIEW` 或 `REJECTED` | 记录 ID + `reviewRefs` / `review.status` |
| F09 | 正式 JSON、lockfile、资料笔记、内容审核表或 manifest hash 漂移 | 文件路径 + `sha256` |
| F10 | manifest 清单、资产文件 hash/字节/数量/体积漂移或出现源 COG/zip | asset set / asset path + 字段 |
| F11 | 跟踪文件或任一 base 构建产物含 Token、私钥、常见云密钥、内部许可数据标记 | 文件路径 + 匹配类型；日志不回显秘密值 |
| F12 | 构建产物出现未登记的运行时 `http(s)` 数据/瓦片/样式依赖 | 构建文件 + URL 类型 |
| F13 | 根 base 或 `/history-map/` 的数据、terrain、worker 引用越界或 worker 模块缺失 | base + 构建相对路径 |
| F14 | 发布集合数量、5/3/3/6 不确定性边界或 9/5/2 历史状态数量变化 | 对应集合/状态字段 |

同时必须包含完整成功夹具，证明 10 条记录、2 条来源、现有正式集合、PHASE2-03/04 内容与双 base 闭包可以通过。失败测试只改临时夹具或临时构建副本，不修改权威文件。

## 8. 替代方案与迁移风险

### 方案 B：只增强现有 Markdown / manifest 解析

不新增登记簿，继续用字符串匹配把运行时对象硬编码到 PHASE2-03/04 表和 manifest。

- 优点：少一个数据文件。
- 缺点：来源、审核、语义和运行时映射继续分散；Markdown 表格轻微改写即可能误判；难以检测孤儿 layer/feature；错误难定位。
- 结论：可作为最低成本替代，但不推荐。

### 方案 C：新增四类正式领域实体

扩展 `MvpDataset`、assemble/validate/audit、正式 JSON 和审核表，为 Terrain、Boundary、Corridor、DistanceMethod 各建类型。

- 优点：所有对象进入一个领域模型。
- 风险：改变正式 JSON/hash/数量、数据合同、组装器、测试和潜在 UI；会把现代参考层与历史正式实体混在一起，并可能误升级仍待来源的正式 Corridor 候选。
- 结论：超出 PHASE2-06 最小范围，不推荐。

### 推荐方案 A 的迁移风险

- 同一事实可能同时存在于 manifest、Markdown 和登记簿。控制方法是登记簿以引用为主，只补 manifest 缺失的访问日期/CRS/审核字段，并由 hash 和交叉校验阻止漂移。
- 运行时代码是 TypeScript，若只做文本匹配会有重构脆弱性。控制方法是把审计核心写成可导入纯函数，并对导出的 ID/常量与构建产物分别验证；不要求 UI 读取登记簿。
- 秘密扫描存在误报和漏报。控制方法是使用高置信模式、只报告类型不回显值，并同时禁止登记簿声明之外的运行时远端资源；它不是通用安全审计。
- 双 base 构建会增加 `check` 时间。控制方法是复用依赖和纯审计结果、输出到可控临时目录、构建完成即验证；不增加浏览器矩阵。

## 9. 对现有文件和产品的影响

| 对象 | 推荐方案 A 的影响 |
| --- | --- |
| 正式 JSON | 不改；持续固定 hash、数量、确定性与引用闭包 |
| lockfile | 不改；不新增依赖 |
| 资料笔记 | 不改；只引用既有 PHASE2-03/04 稳定 ID |
| 既有内容审核表 | 不改；只读取已批准行及保留的待审/拒绝行 |
| 地形 manifest / 资产 | 不改；新增外部冻结 hash 和交叉校验 |
| 新权威记录 | 批准后新增 `data/curated/phase2-spatial-release-v1.json`；本文记录设计批准和实现证据 |
| assemble / validate | 不改正式组装/数据合同；新登记簿使用独立验证器 |
| audit / PHASE2-03/04 / terrain / worker | 保留原命令；新门禁编排并补足跨记录映射、秘密、双 base 闭包 |
| build / check | 加入 PHASE2-06 内容门禁；增加独立双 base 静态闭包命令并由 `check` 编排 |
| UI / 地图几何 / 文案 | 不改；新门禁只核对已存在 ID、常量、文案和构建产物 |

## 10. 明确不做

- 不执行或声称完成 PHASE2-07，不做最终整体验收、完整浏览器矩阵、性能验收或三方最终签字。
- 不新增/下载地形、边界、河流、地貌、通道或路线数据，不改变几何、方向、距离算法、页面布局或批准文案。
- 不升级正式 `PENDING_*` / `REJECTED` 候选，不把 display-only 记录包装成正式历史实体。
- 不扩全国、其他专题、3D、高程剖面、替代路线或连续动画。
- 不新增后端、数据库、RAG、登录、云部署、Docker、Token 或个人配额依赖。
- 不安装 `gh`，不创建 PR；未获最终提交确认前不 commit/push。

## 11. 人工确认门

2026-08-16，内容负责人 `banq` 明确批准方案 A，并授权按本文 2 条来源、10 条发布记录、必填字段和 F01-F14 判定实施 PHASE2-06。该批准不授权改变冻结文件或 UI，不授权进入 PHASE2-07，也不授权 commit/push。

- [x] 批准方案 A：独立通用登记簿，不扩正式 `MvpDataset`。
- [x] 批准 2 条空间来源记录和 10 条发布记录的 ID、范围及映射清单。
- [x] 批准必填字段、F01-F14 失败判定和双 base 编排边界。
- [x] 批准正式 JSON、lockfile、资料笔记、既有内容审核表、manifest/资产和 UI 保持不变。
- [x] 批准实现仅限 PHASE2-06，并在 commit/push 前再次停止等待确认。

建议的明确批准语句：

> 批准方案 A；按本文 2 条来源、10 条发布记录、必填字段和 F01-F14 判定实施 PHASE2-06。保持正式 JSON、lockfile、资料笔记、既有内容审核表、manifest/资产和 UI 不变，不进入 PHASE2-07；commit/push 前再次汇报并等待确认。

方案 B、方案 C 均未获采用。实现完成后仍须在 commit/push 前汇报真实 diff、测试、构建、许可、秘密、hash 和未决风险，并等待用户再次明确确认；最终三方签字继续留空。

## 12. 实现与验证证据

方案 A 已按批准边界实现，尚未 commit/push：

- 新增 `data/curated/phase2-spatial-release-v1.json`，包含 2 条空间来源、10 条发布记录和 86 项 manifest/资产/MapLibre source/layer/feature/正式实体/方法/常量/UI 文案映射。登记簿仅供构建审计，运行时不读取。
- 新增 `verify:phase2-06-release`：联合核对 MVP-11 正式集合、PHASE2-03 的 9 条批准候选、PHASE2-04 的 17 条批准候选、2/10 登记簿、五项冻结 hash、地形 manifest、许可/署名/再分发、离线依赖和 137 个跟踪/待跟踪文本文件的高置信秘密模式。
- 新增 `verify:phase2-06-static`：验证根 base 构建后，在 `/private/tmp/history-map-phase2-06-*` 建立 `/history-map/` 非根构建和站点根 `/data/`；两种 base 均为 87 个文件、8 个文本文件、单一 MapLibre worker、80 个地形资产/78 个瓦片闭包，非根站点根正式 JSON 与源文件字节一致。临时目录在命令结束后删除。
- F01—F14 均有成功/失败自动测试；包括 DEM/边界许可与署名、通道映射、距离方法与“约”、确定性、PENDING/REJECTED、hash/清单/实际资产字节、跟踪文件和构建秘密、未知外网主机、base 越界、worker 缺失模块及正式集合边界。
- 最终 `npm --prefix frontend run check` 通过：22 个测试文件、148 项测试；`typecheck`、`validate:data`、`audit:content`、PHASE2-03/04/06 门禁、根构建、worker/terrain 闭包和双 base PHASE2-06 静态闭包全部通过。开始时出现过一次 5 秒冷启动超时；定向复跑和最终完整 `check` 均通过，未修改测试时限。
- 构建继续出现既有主入口大于 500 kB 提示；根主入口为约 `1,074.48 kB`，非根为约 `1,074.51 kB`。PHASE2-06 没有新增运行时代码、依赖、二进制、地形资产或 UI，因此本任务不把该提示包装成性能验收。
- 当前构建可执行文本中的外网 URL 仅限已登记的来源/署名链接和 Vue/MapLibre/OpenStreetMap/W3C 错误或标准说明主机；任何未知主机立即失败。正式来源 JSON 中的可点击来源链接不是运行时数据依赖。
- 正式 JSON、lockfile、既有资料笔记、既有内容审核表和地形 manifest/资产均未修改；最终三方签字保持空白。按任务边界未运行新的浏览器、品牌或性能矩阵，也未进入 PHASE2-07。

提交与推送仍未获本轮授权。下一步只能先向用户汇报真实 diff 和上述证据，等待明确确认；不得提前 commit/push 或进入 PHASE2-07。
