# 安史之乱二维交互地图：Codex 开发任务

- 状态：可交付 Codex 执行
- 前置文档：`docs/plans/mvp-scope.md`
- 验收文档：`docs/plans/mvp-acceptance.md`
- 实施方式：按任务依赖执行，每个任务形成一个独立、可运行、可回退的审查单元；经用户审阅后再提交

> 2026-08-02 状态说明：本文件保留为 MVP-01—MVP-11 的历史任务定义。当前开发序列已切换到 [第二期地形优先任务](phase-2-terrain-tasks.md)，不得继续以完成本文件来推断产品价值已验证。

## 1. Codex 执行总规则

1. 第一阶段只修改 `frontend/`、必要的根目录配置、`data/curated/` 和测试/说明文档；不得创建可运行的 Go 后端、数据库或 Docker 编排。
2. 不引入 Vue Router、ECharts、Element Plus、Naive UI、deck.gl、Turf、Cesium 或其他未在任务中明确允许的依赖。
3. 地图组件不得直接读取静态 JSON，只能通过统一数据仓库模块加载。
4. 不编造历史事实、页码、版本、精确日期和坐标。正式数据只能来自已审核的资料笔记。
5. 自 `MVP-00` 创建 `frontend/package.json` 起，每个工程任务都必须保持 `npm run typecheck`、`npm run test` 和 `npm run build` 可通过；从 `MVP-02` 起还必须通过 `npm run validate:data`。`MVP-PRE-00` 和 `CONTENT-00` 不要求执行尚不存在的 npm 脚本。
6. 任务之外的重构、目录扩张和“为以后预留”的抽象一律不做。
7. 发现需求冲突时，按 ADR-0001 的文档权威顺序处理；不得用任务文本弱化 `mvp-acceptance.md` 的发布门禁，当前实现范围仍以 `mvp-scope.md` 的 P0 和明确暂缓项为准。

## MVP-PRE-00：仓库归位、Node 环境与文档权威

### 目标

建立唯一、可重复的执行起点，避免在错误目录或不兼容的 Node 版本上创建工程。

### 涉及内容

- 项目根目录：`/Users/banq/Documents/history-map`
- 根目录 `.nvmrc`
- `docs/decisions/0001-静态前端MVP优先.md`
- README、文档导航和长期架构文档中的状态说明

### 验收标准

1. README、`docs/`、`data/` 和根配置文件直接位于项目根目录；`frontend/`、`backend/`、`scripts/`、`deploy/` 在后续创建时也必须直接位于根目录。不得以 Git 无法保留的空目录作为提交验收条件。
2. 旧 `history-map-docs/` 目录不存在。
3. `nvm use` 后 Node 输出与 `.nvmrc` 一致，npm 可以运行。
4. 当前 MVP 与长期 Go/PostGIS 架构的优先关系在 ADR 中明确。
5. 根 `.gitignore` 覆盖 `.DS_Store`、环境文件、构建产物和私有资料。
6. 本任务不创建前端源码、Go 项目、数据库或 Docker 配置。

### 不做什么

- 不改变 NVM 全局默认 Node 版本。
- 不创建应用代码。
- 不删除原始压缩归档，除非用户另行确认。
- 不提交或推送 Git。

---

## CONTENT-00：资料笔记模板与第一批人工核对清单

### 目标

在写正式数据前建立人工资料入口，并把第一批地点、事件、路线和地理要素整理成可逐项核对的工作清单。

### 涉及目录

```text
data/curated/
└── anshi-mvp-source-notes.md

docs/reviews/
└── anshi-mvp-content-review.md
```

### 第一批核对范围

- 地点：长安、洛阳、陕州、灵宝、潼关。
- 事件槽位：潼关防线背景、燕军西进背景、唐军出关决策、灵宝方向交战、潼关失守、长安局势变化。
- 路线：燕军向潼关方向推进、唐军出关行动。
- 缩小版 MVP 地理要素：黄河、渭河、秦岭。东入关中通道保留为后续候选，不计入 MVP-03 数量或发布门禁。

这些名称是工作标签，不代表日期、坐标、路线或因果解释已经获得历史审核。

### 验收标准

1. 资料版本登记表存在，能够记录版本、章节、页码或稳定定位、访问日期，以及许可证名称、链接和署名要求。
2. 每条拟展示结论具有稳定 `claimId`，并逐条绑定一个或多个稳定 `citationId`；每个 Citation 能定位到具体 Source 和页码或稳定定位。
3. 每条内容可分别记录原文、项目归纳、项目推断、可信度和争议。
4. 第一批核对对象全部进入内容审核表；逻辑路线工作项标为 `RoutePlan`，不能冒充尚未生成的 `RouteSegment`。
5. 不包含示例页码、占位坐标或被伪装成已确认事实的推断。
6. 当前尚未审核的条目明确标记为 `PENDING_SOURCE` 或 `PENDING_REVIEW`。
7. 文档明确说明：只有填写审核人、审核日期并完成人工签字的 `APPROVED` 记录及其关联 Source/Citation 才能进入正式数据。
8. `MVP-01` 必须定义上述逐条引用关系在运行时 JSON 中的表达方式；CONTENT-00 不提前扩张数据契约。

### 完成边界

完成 CONTENT-00 只表示核对入口和首批清单已经建立，不表示历史内容已通过验收。MVP-03 在 CONTENT-00 完成时仍受人工资料与签字状态阻断；其当前状态以 `mvp-progress.md` 为准。

### 不做什么

- Codex 不代替内容负责人批准史实。
- 不生成或猜测页码、坐标、路线和精确日期。
- 不把工作标签直接转换成正式 `mvp-v1.json`。

---

## 2. 全局数据契约

### 2.1 静态数据 API

```text
GET /data/anshi/mvp-v1.json
```

说明：这是由 Vite `public/` 目录提供的静态资源，不是 Go API。未来后端化时，可由 `GET /api/v1/topics/anshi/mvp` 返回相同结构。

### 2.2 顶层结构

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `schemaVersion` | string | 是 | 固定为 `1.0` |
| `topic` | object | 是 | 专题标题、摘要、初始视野和默认事件 |
| `places` | GeoJSON FeatureCollection<Point> | 是 | 城池、关隘、渡口等地点 |
| `geography` | GeoJSON FeatureCollection<LineString\|Polygon> | 是 | 河流、山脉、通道等解释性地理要素 |
| `routeSegments` | GeoJSON FeatureCollection<LineString> | 是 | 可按事件逐段出现的路线 |
| `events` | array | 是 | 离散事件，按 `sequence` 排序 |
| `sources` | array | 是 | 书籍、论文或史料版本信息 |
| `citations` | array | 是 | 章节、页码、摘要、观点和可信度 |

### 2.3 稳定枚举

| 枚举 | MVP 值 |
|---|---|
| `placeType` | `CITY`、`PASS`、`FERRY`、`BATTLEFIELD`、`REGION`、`OTHER` |
| `geographyType` | `RIVER`、`MOUNTAIN`、`CORRIDOR`、`REGION` |
| `eventType` | `MARCH`、`CAPTURE`、`DEFENSE`、`BATTLE`、`RETREAT`、`POLITICAL`、`OTHER` |
| `side` | `TANG`、`YAN`、`COURT`、`OTHER` |
| `actionType` | `ADVANCE`、`RETREAT`、`DEFEND`、`TRANSFER` |
| `certainty` | `HIGH`、`MEDIUM`、`LOW`、`DISPUTED`、`UNKNOWN` |
| `timePrecision` | `DAY`、`MONTH`、`YEAR`、`APPROXIMATE` |
| `viewpointType` | `FACT`、`PRIMARY_RECORD`、`MODERN_RESEARCH`、`LATER_NARRATIVE`、`INFERENCE`、`DISPUTE` |

`side` 中，`TANG` 表示前线唐军等军事行动主体，`COURT` 表示朝廷政治决策或转移主体；录入时按当前事件或路线的直接行动主体选择，不能把两者当作同义值混用。

### 2.4 核心对象最小字段

#### Topic

| 字段 | 说明 |
|---|---|
| `id` | 固定字符串 ID，例如 `anshi-tongguan-mvp` |
| `title` | 页面主标题 |
| `subtitle` | 本期叙事范围 |
| `summary` | 100—300 字简介 |
| `initialView` | 初始中心点、缩放级别或边界 |
| `defaultEventId` | 首次进入时选中的事件 |

#### Place Feature properties

| 字段 | 说明 |
|---|---|
| `id` | 稳定字符串 ID |
| `name` | 历史名称 |
| `modernName` | 现代对应名称，可空 |
| `placeType` | 地点类型 |
| `summary` | 简介 |
| `strategicRole` | 与本专题直接相关的战略作用 |
| `certainty` | 坐标或对应关系可信度 |
| `coordinateNote` | 坐标依据或不确定说明 |
| `citationIds` | 引用 ID 数组 |

#### Geography Feature properties

| 字段 | 说明 |
|---|---|
| `id` | 稳定字符串 ID |
| `name` | 名称 |
| `geographyType` | 地理类型 |
| `summary` | 与战争叙事相关的说明 |
| `certainty` | 重建可信度 |
| `citationIds` | 引用 ID 数组，可空但应说明数据来源 |

#### RouteSegment Feature properties

| 字段 | 说明 |
|---|---|
| `id` | 路线段 ID |
| `routeId` | 所属逻辑路线 ID |
| `routeName` | 路线显示名称 |
| `segmentNo` | 同一路线内从 1 开始连续编号 |
| `side` | 阵营或主体 |
| `actionType` | 前进、撤退、防守或转移 |
| `appearAtEventId` | 本路线段首次可见的事件 ID |
| `fromPlaceId` | 起点地点，可空 |
| `toPlaceId` | 终点地点，可空 |
| `certainty` | 路线重建可信度 |
| `summary` | 路线说明 |
| `citationIds` | 引用 ID 数组 |

#### Event

| 字段 | 说明 |
|---|---|
| `id` | 稳定字符串 ID |
| `sequence` | 从 1 开始且连续，用于时间轴排序 |
| `title` | 事件标题 |
| `eventType` | 事件类型 |
| `dateLabel` | 面向用户展示的历史时间文本 |
| `normalizedDate` | 可确认时填写标准日期，否则为空 |
| `timePrecision` | 时间精度 |
| `certainty` | 事件存在性与时间定位的可信度；过程、因果和叙事解释的可信度归各自 `SourcedClaim` |
| `summary` | 发生了什么 |
| `whyItMatters` | 为什么影响潼关或长安局势 |
| `relatedPlaceIds` | 相关地点 ID |
| `actorLabels` | 参与者名称和角色的简短文本数组 |
| `citationIds` | 引用 ID 数组 |

#### Source 与 Citation

| 对象 | 最小字段 |
|---|---|
| `Source` | `id`、`title`、`author`、`edition`、`publisher`、`publishYear`、`sourceType` |
| `Citation` | `id`、`sourceId`、`chapter`、`pageStart`、`pageEnd`、`quote`、`summary`、`viewpointType`、`certainty` |

`quote` 可空；页面优先展示项目归纳 `summary`，原文只保留短小且确有必要的片段。

---

## MVP-00：建立最小前端工程骨架

### 目标

创建可运行、可测试、可构建的 Vue 3 + TypeScript + Vite 工程，为后续地图功能提供稳定基线。

### 涉及目录

```text
frontend/
├── src/
│   ├── App.vue
│   ├── main.ts
│   └── styles/
├── public/
├── package.json
├── package-lock.json
├── tsconfig*.json
├── vite.config.ts
└── .env.example
```

必要时更新根目录 `.gitignore`，但不修改现有产品、架构和数据文档。

### 数据结构

无业务数据结构。本任务只建立工程和页面壳。

### API

无 HTTP API。页面不得发起任何业务请求。

### 验收标准

1. `npm install` 后可执行 `npm run dev`。
2. `npm run typecheck`、`npm run test`、`npm run build` 均成功。
3. 首页显示明确的项目标题和“数据尚未加载”的占位状态。
4. 仅引入 Vue、Vite、TypeScript、MapLibre、Pinia、Vitest 和必要的类型/构建工具。
5. 无 Vue Router、ECharts 和完整 UI 组件库。

### 不做什么

- 不创建地图实例。
- 不创建业务数据类型。
- 不创建 Go、Docker、PostgreSQL 配置。
- 不提前搭建通用组件库、主题系统或国际化。

---

## MVP-01：定义数据契约、运行时校验和数据仓库

### 目标

建立唯一的数据类型定义、运行时校验入口和数据加载边界，使页面不依赖具体静态文件路径。

### 涉及目录

```text
frontend/src/domain/
├── mvpTypes.ts
├── mvpValidation.ts
└── mvpSelectors.ts

frontend/src/data/
└── mvpRepository.ts

frontend/public/data/anshi/
└── mvp-v1.json

frontend/tests/data/
└── mvp-contract.test.ts
```

### 数据结构

实现本文件“全局数据契约”中的 Topic、Place、Geography、RouteSegment、Event、Source、Citation 和 MvpDataset。

额外定义：

| 结构 | 字段 |
|---|---|
| `LoadState` | `idle`、`loading`、`ready`、`error` |
| `MvpDataError` | `code`、`message`、`path`、`details` |

### API

静态数据 API：

```text
GET /data/anshi/mvp-v1.json
```

内部模块 API：

```text
loadMvpDataset(): Promise<MvpDataset>
validateMvpDataset(input): ValidationResult
getEventById(dataset, eventId): Event | undefined
getPlaceById(dataset, placeId): PlaceFeature | undefined
getCitationBundle(dataset, citationIds): CitationWithSource[]
```

以上是模块契约，不要求建立抽象接口层或依赖注入容器。

### 验收标准

1. 静态文件可被加载并转换为受类型约束的数据对象。
2. `schemaVersion` 不为 `1.0` 时返回可读错误。
3. JSON 非法、缺字段或类型错误时页面不会白屏。
4. 组件不得直接调用 `fetch('/data/anshi/mvp-v1.json')`。
5. 合同测试覆盖成功、版本错误和缺字段三类情况。

### 不做什么

- 不实现历史内容。
- 不创建通用 Repository 基类、IOC 或插件机制。
- 不引入后端 API 客户端生成器。
- 不支持多个 schemaVersion 的自动迁移。

---

## MVP-02：建立数据完整性校验门禁

### 目标

在开发和构建前发现历史数据中的悬空引用、错误顺序、非法坐标和缺失来源，避免页面“能显示但内容错误”。

### 涉及目录

```text
frontend/src/domain/mvpValidation.ts
frontend/tests/data/mvp-integrity.test.ts
frontend/package.json
```

### 数据结构

新增校验结果：

| 字段 | 说明 |
|---|---|
| `severity` | `ERROR` 或 `WARNING` |
| `code` | 稳定错误代码 |
| `path` | 出错字段路径 |
| `message` | 可直接给开发者阅读的说明 |

至少覆盖以下错误代码：

- `DUPLICATE_ID`
- `MISSING_REFERENCE`
- `INVALID_COORDINATE`
- `INVALID_EVENT_SEQUENCE`
- `INVALID_ROUTE_SEQUENCE`
- `UNKNOWN_APPEAR_EVENT`
- `MISSING_CITATION`
- `MISSING_COORDINATE_NOTE`
- `UNSUPPORTED_ENUM`

### API

新增命令：

```text
npm run validate:data
```

该命令读取正式 `mvp-v1.json` 并运行同一套校验逻辑；不得维护一套仅供测试使用的重复规则。

### 验收标准

1. 所有实体 ID 全局唯一或在各自命名空间内唯一。
2. Event、Place、RouteSegment、Citation、Source 之间不存在悬空引用。
3. 经度在 `[-180, 180]`、纬度在 `[-90, 90]`。
4. Event `sequence` 从 1 开始连续，不允许重复或跳号。
5. 同一 `routeId` 下 `segmentNo` 从 1 开始连续。
6. 每个 Event 和带 `strategicRole` 的 Place 至少关联一个 Citation。
7. LOW、DISPUTED、UNKNOWN 的地点坐标必须有 `coordinateNote`。
8. `npm run build` 在数据校验失败时终止。
9. 测试中必须有一个故意损坏的数据集，证明门禁确实会失败。

### 不做什么

- 不校验历史事实本身是否正确。
- 不联网查询坐标或书目信息。
- 不自动修复错误数据。
- 不引入数据库约束或迁移脚本。

---

## MVP-03：准备并录入经人工审核的 MVP 数据

### 目标

将人工确认的史料笔记转成可被地图使用的正式数据集，形成完整的潼关叙事链。

### 涉及目录

```text
data/curated/
└── anshi-mvp-source-notes.md

frontend/public/data/anshi/
└── mvp-v1.json

frontend/tests/data/
└── mvp-content.test.ts
```

### 数据结构

使用全局数据契约。正式数据至少达到：

- 5 个 Place
- 3 个现代背景 Geography Feature
- 6 个 Event
- 2 条解释性示意逻辑路线、合计 2—4 个 RouteSegment
- 2—3 个 Source
- 不少于 15 个 Citation

### API

不新增 API。继续由：

```text
GET /data/anshi/mvp-v1.json
```

提供全部数据。

### 验收标准

1. 数据围绕“潼关防线—灵宝出战—长安失守”形成连续事件顺序。
2. 地点固定包含长安、洛阳、陕州、灵宝、潼关；现代背景 Geography 固定包含黄河、渭河、秦岭。
3. 每个关键战略判断都可追溯到 Citation 和 Source。
4. 所有坐标、路线和时间文本在 `anshi-mvp-source-notes.md` 中能找到依据或明确的推断说明。
5. 不能确认精确日期时，使用近似时间文本和 `APPROXIMATE`，不得为排序虚构某一天。
6. 路线若只是解释性重建，必须标注 LOW/MEDIUM 和说明。
7. 黄河、渭河、秦岭只作为现代概览背景；不得声称复原唐代河道或精确历史边界。`geography-guanzhong-corridor` 的独立几何、唐代河道复原和精确战场边界均不属于缩小版 MVP。
8. `npm run validate:data` 全部通过。
9. `mvp-content.test.ts` 检查最低数据量、核心地点存在和默认事件有效。

### 不做什么

- Codex 不自行生成或猜测页码、版本和引用。
- 不从未经审核的百科摘要直接复制成正式结论。
- 不为了满足数量加入与核心叙事无关的地点和事件。
- 不录入安史之乱全部战线。
- 不把 CHGIS 或其他限制再分发的数据坐标直接打包进公开 JSON，除非逐项确认许可允许。
- 不录入大段连续原文。

### 前置阻断条件

若 `data/curated/anshi-mvp-source-notes.md` 不存在或缺少页码/出处，Codex 只能建立模板和列出缺口，不能把示例内容标记为正式数据，也不能完成本任务验收。

---

## MVP-04：实现地图容器、底图配置和降级方案

### 目标

创建稳定的 MapLibre 地图壳，支持初始视野、加载状态、销毁清理和无外部底图时的降级显示。

### 涉及目录

```text
frontend/src/views/
└── AnshiMvpView.vue

frontend/src/components/map/
└── HistoryMap.vue

frontend/src/composables/
└── useMapLibre.ts

frontend/public/map/
└── empty-style.json

frontend/src/styles/
└── map.css
```

### 数据结构

使用 `topic.initialView`：

| 字段 | 说明 |
|---|---|
| `center` | `[longitude, latitude]` |
| `zoom` | 初始缩放级别 |
| `bounds` | 可选的西南/东北边界 |
| `maxBounds` | 可选的地图活动范围 |

### API

读取环境变量：

```text
VITE_MAP_STYLE_URL
```

行为：

1. 有配置时使用该 MapLibre style URL。
2. 未配置或样式加载失败时使用 `/map/empty-style.json`。
3. 数据仍通过 `loadMvpDataset()` 获取。

内部模块 API：

```text
createMap(container, initialView): MapHandle
destroyMap(): void
fitToTopic(): void
```

### 验收标准

1. 页面成功创建一个可拖动、缩放的 MapLibre 地图。
2. 地图初始视野来自数据集，不硬编码在组件中。
3. 没有 `VITE_MAP_STYLE_URL` 时仍能显示中性背景并继续加载历史图层。
4. 外部样式加载失败时有非阻断提示，不白屏。
5. 组件卸载后地图实例、监听器和 DOM 资源被清理。
6. 页面不存在重复初始化地图的问题。

### 不做什么

- 不建设自有瓦片服务。
- 不接入 DEM、3D Terrain、hillshade。
- 不加入地点、路线或时间轴。
- 不添加复杂地图插件和绘制工具。

---

## MVP-05：实现地理要素、地点图层、图层开关和图例

### 目标

在地图上清楚展示与潼关叙事相关的河流、山脉/通道和历史地点，并允许用户控制可见性。

### 涉及目录

```text
frontend/src/components/map/
├── LayerControl.vue
└── MapLegend.vue

frontend/src/map/layers/
├── geographyLayer.ts
└── placeLayer.ts

frontend/src/stores/
└── mvpStore.ts
```

### 数据结构

使用：

- `places: FeatureCollection<Point>`
- `geography: FeatureCollection<LineString|Polygon>`
- `LayerVisibility = { geography: boolean, places: boolean, routes: boolean }`
- `SelectionState = { selectedEventId?: string, selectedPlaceId?: string }`

### API

内部地图层 API：

```text
addGeographyLayers(map, geography): void
addPlaceLayers(map, places): void
setLayerVisibility(map, layerGroup, visible): void
setSelectedPlace(map, placeId | undefined): void
```

Store 操作：

```text
toggleLayer(layerGroup): void
selectPlace(placeId | undefined): void
```

### 验收标准

1. 地理要素和地点分别作为独立 MapLibre source/layer 组加载。
2. CITY、PASS 和其他地点至少有明显可区分的符号或形状。
3. 河流、山脉/通道的样式不与行动路线混淆。
4. LOW、DISPUTED、UNKNOWN 地点有可见但不过度夸张的差异样式。
5. 地理要素、地点和路线三个图层开关存在；路线可暂为空但状态已定义。
6. 点击地点能得到对应 `placeId` 并写入 store。
7. 图例说明地点类型、地理要素和可信度的基本语义。
8. 反复开关图层不会重复添加 source/layer 或产生控制台错误。

### 不做什么

- 不实现聚合、热力图和视野范围后端查询。
- 不显示所有中国古代城池、河流或山脉。
- 不制作自定义瓦片。
- 不打开地点独立页面。

---

## MVP-06：实现离散事件时间轴和状态引擎

### 目标

以离散历史事件而不是连续动画驱动页面状态，保证事件顺序明确、可重复、可测试。

### 涉及目录

```text
frontend/src/components/timeline/
├── EventTimeline.vue
└── TimelineControls.vue

frontend/src/domain/
└── timeline.ts

frontend/src/stores/
└── mvpStore.ts

frontend/tests/domain/
└── timeline.test.ts
```

### 数据结构

```text
TimelineState
- orderedEventIds
- selectedEventId
- selectedSequence
- hasPrevious
- hasNext
```

时间轴以 `Event.sequence` 排序，`dateLabel` 只用于展示。

### API

纯函数：

```text
sortEvents(events): Event[]
getPreviousEventId(events, currentId): string | undefined
getNextEventId(events, currentId): string | undefined
```

Store 操作：

```text
selectEvent(eventId): void
selectPreviousEvent(): void
selectNextEvent(): void
resetToDefaultEvent(): void
```

### 验收标准

1. 首次进入选中 `topic.defaultEventId`。
2. 用户可点击任一时间轴节点切换事件。
3. “上一事件 / 下一事件”在边界正确禁用。
4. 时间轴显示 `dateLabel` 和事件标题，不把 `normalizedDate` 当作唯一真相。
5. 同一个事件反复选择得到完全一致的状态。
6. 键盘聚焦后可使用左右方向键或明确按钮切换事件。
7. 单元测试覆盖排序、首尾边界、未知 ID 和默认事件。

### 不做什么

- 不做自动播放。
- 不做连续日期滑块。
- 不做速度控制和动画队列。
- 不用 ECharts 实现时间轴。

---

## MVP-07：实现路线逐段显隐和事件地图同步

### 目标

根据当前事件，只显示已经发生的路线段，并高亮当前事件相关的地点和路线，使地图成为事件叙事的一部分。

### 涉及目录

```text
frontend/src/map/layers/
└── routeLayer.ts

frontend/src/domain/
└── deriveMapState.ts

frontend/src/components/map/
└── HistoryMap.vue

frontend/tests/domain/
└── derive-map-state.test.ts
```

### 数据结构

```text
DerivedMapState
- visibleRouteSegmentIds
- activeRouteSegmentIds
- relatedPlaceIds
- selectedPlaceId
- currentEventId
```

显隐规则：

1. 找到当前事件的 `sequence`。
2. 某路线段的 `appearAtEventId` 对应事件序号小于或等于当前序号时可见。
3. `appearAtEventId` 等于当前事件时，该路线段为 active。
4. 当前事件的 `relatedPlaceIds` 为高亮地点。

### API

```text
deriveMapState(dataset, selectedEventId, selectedPlaceId): DerivedMapState
addRouteLayers(map, routeSegments): void
applyRouteState(map, derivedState): void
applyRelatedPlaceState(map, derivedState): void
```

### 验收标准

1. 第一个事件只显示截至该事件已出现的路线段。
2. 切换到后续事件后，新路线段按顺序增加。
3. 返回前一事件时，未来路线段会被隐藏。
4. 当前事件新出现的路线段与历史路线段样式可区分。
5. TANG、YAN、COURT 至少有可区分的路线语义；样式同时依赖线型/粗细等，不只依赖颜色。
6. 当前事件相关地点被高亮，但用户手动选中的地点仍有更高优先级。
7. 路线图层开关关闭时，时间轴状态仍正常变化。
8. 单元测试覆盖前进、后退、未知事件和路线首次出现边界。

### 不做什么

- 不让图标沿路线移动。
- 不根据两点自动生成现代道路路线。
- 不做路线速度、兵力宽度和粒子效果。
- 不做路线空间分析。

---

## MVP-08：实现事件/地点详情、引用与可信度展示

### 目标

让用户在同一个侧栏中理解“发生了什么、为什么重要、依据是什么、哪里不确定”。

### 涉及目录

```text
frontend/src/components/detail/
├── DetailPanel.vue
├── EventDetail.vue
├── PlaceDetail.vue
├── CitationList.vue
├── ConfidenceBadge.vue
└── EmptyDetail.vue

frontend/src/domain/
└── mvpSelectors.ts
```

### 数据结构

```text
CitationWithSource
- citation
- source

DetailMode
- EVENT
- PLACE
- EMPTY
```

展示优先级：

1. 用户点击地点后显示 PlaceDetail。
2. 用户关闭地点详情后回到当前 EventDetail。
3. 没有选中事件和地点时显示 EmptyDetail。

### API

Selector：

```text
getSelectedEvent(dataset, state): Event | undefined
getSelectedPlace(dataset, state): PlaceFeature | undefined
getCitationBundle(dataset, citationIds): CitationWithSource[]
```

Store 操作：

```text
selectPlace(placeId): void
clearSelectedPlace(): void
```

### 验收标准

1. EventDetail 显示时间文本、摘要、`whyItMatters`、相关地点、参与者和可信度。
2. PlaceDetail 显示历史名、现代对应、地点类型、战略作用、坐标说明和可信度。
3. CitationList 显示资料标题、作者/版本、章节、页码、观点类型和归纳摘要。
4. 空字段不显示无意义的标签或 `null`。
5. DISPUTED 和 UNKNOWN 有清晰文字，不只显示一个颜色圆点。
6. 点击地点后可关闭并返回当前事件详情，时间轴位置不丢失。
7. 引用 ID 缺失时开发环境给出明确错误；正式构建应已被数据门禁阻止。
8. 原文引用与项目归纳在视觉上明确区分。

### 不做什么

- 不创建人物、战役独立详情页。
- 不展示完整书籍内容。
- 不提供 AI 总结和问答。
- 不提供外部评论、用户笔记和编辑入口。

---

## MVP-09：完成页面整合、定位交互和桌面体验

### 目标

把地图、时间轴和详情整合成一个无需说明即可完成核心用户路径的桌面单页。

### 涉及目录

```text
frontend/src/App.vue
frontend/src/views/AnshiMvpView.vue
frontend/src/components/common/
├── LoadingState.vue
└── ErrorState.vue
frontend/src/styles/
├── layout.css
└── responsive.css
```

必要时在地图组件中增加轻量的“定位当前事件”按钮。

### 数据结构

```text
UiState
- dataLoadState
- dataError
- mapStyleWarning
- detailPanelOpen
```

不新建第二个 store；UI 状态与 MVP 状态放在同一个小型 store 中或保持组件本地状态。

### API

内部交互：

```text
focusCurrentEvent(): void
focusPlace(placeId): void
retryLoadDataset(): Promise<void>
```

地图定位范围由相关地点和活动路线段几何计算，不引入外部空间计算库。

### 验收标准

1. 桌面布局同时容纳地图、时间轴和详情，不遮挡关键控制。
2. 1024×768 和常见宽屏尺寸下核心功能可操作。
3. 用户可以从默认事件连续点击“下一事件”完成整个叙事。
4. “定位当前事件”只在用户主动触发时移动地图，时间轴切换不强制反复飞行。
5. 数据加载中、加载失败、底图降级均有明确状态。
6. 页面刷新后回到默认事件，不要求保存用户状态。
7. 所有按钮有可读标签、键盘焦点和禁用状态。
8. 无控制台未处理异常。

### 不做什么

- 不做完整手机布局。
- 不做深链接和 URL 状态同步。
- 不做主题切换、国际化、登录和偏好持久化。
- 不增加复杂过场动画。

---

## MVP-10：建立测试、构建门禁和本地运行说明

### 目标

形成 Codex 可重复执行、用户可本地运行、内容更新后不易破坏的交付闭环。

### 涉及目录

```text
frontend/tests/
├── data/
├── domain/
└── components/

frontend/README.md
frontend/package.json
README.md                 # 仅补充 MVP 运行入口和文档链接
```

### 数据结构

不新增生产数据结构。测试可使用最小 fixture，但 fixture 必须与正式契约一致。

### API

必须存在以下命令：

```text
npm run dev
npm run typecheck
npm run validate:data
npm run test
npm run build
npm run check
```

`npm run check` 顺序执行 typecheck、validate:data、test 和 build。

### 验收标准

1. 数据契约、完整性、时间轴和路线显隐均有自动测试。
2. 至少有组件测试覆盖：加载成功、加载失败、事件切换和地点详情。
3. `npm run check` 一次性通过。
4. `frontend/README.md` 写明环境要求、安装、运行、底图配置、数据文件位置和常见错误。
5. 根 README 增加第一期 MVP 入口，但不重写原有长期规划。
6. 构建产物是纯静态文件，不依赖 Go、PostgreSQL 或 Docker。
7. 不存在跳过、仅占位或永久标记为 `todo` 的关键测试。

### 不做什么

- 不搭建 CI/CD、Kubernetes 或云部署。
- 不加入完整浏览器矩阵和视觉回归平台。
- 不对 MapLibre canvas 做脆弱的大型快照测试。
- 不为了覆盖率数字编写无价值测试。

---

## MVP-11：生成内容审核清单并完成发布前签字

### 目标

将代码“能运行”与历史内容“可以发布”分开验收，输出一份逐项可核对的内容审核记录。

### 涉及目录

```text
docs/reviews/
└── anshi-mvp-content-review.md

frontend/public/data/anshi/
└── mvp-v1.json
```

### 数据结构

审核表每行至少包含：

| 字段 | 说明 |
|---|---|
| `entityType` | Place / Event / Geography / RoutePlan / RouteSegment / Claim / Citation / Source |
| `entityId` | 数据 ID；RoutePlan 是内容准备项，不能替代实际 RouteSegment |
| `factReviewed` | 事实、结论或路线是否核对 |
| `coordinateReviewed` | 坐标/几何是否核对，非空间对象可不适用 |
| `citationReviewed` | 出处与页码或稳定定位是否核对 |
| `sourceVersionReviewed` | 资料版本或数据集版本是否核对 |
| `licenseReviewed` | 使用权限、许可证链接和署名要求是否核对 |
| `certaintyReviewed` | 可信度是否合理 |
| `reviewer` | 人工审核人 |
| `reviewDate` | 人工审核日期 |
| `status` | `PENDING_SOURCE`、`PENDING_REVIEW`、`APPROVED`、`CHANGES_REQUIRED`、`REJECTED`、`NOT_APPLICABLE` |
| `notes` | 问题和修改说明 |

### API

无运行时 API。可以由测试或一次性脚本读取数据集生成审核表骨架，但不创建长期后台。

### 验收标准

1. 所有 Place、Event、Geography 和实际 RouteSegment 都出现在审核表中；前置 RoutePlan 行不能替代分段审核。
2. 所有正式展示的 Claim、Citation 和 Source 都出现在审核表中；每条 Claim 逐条绑定 Citation，Citation 已核对来源、版本和页码或稳定定位。
3. 所有空间 Source 已核对数据版本、许可证链接、署名要求和处理过程。
4. 所有拟发布数据的对应审核行必须为 `APPROVED`，并填写 reviewer 与 reviewDate；不存在 `PENDING_SOURCE`、`PENDING_REVIEW` 或 `CHANGES_REQUIRED`。
5. 不存在 `TODO_REVIEW`、示例页码、占位坐标和未经说明的推断。
6. 内容负责人确认核心叙事在 5—10 次交互内连贯成立并完成签字。
7. 通过 `docs/plans/mvp-acceptance.md` 的全部阻断项。

### 不做什么

- Codex 不代替内容负责人签字。
- 不建立审核账户、工作流或数据库表。
- 不把“技术测试通过”等同于“历史内容正确”。

## 3. 任务依赖顺序

```text
MVP-PRE-00
  ↓
CONTENT-00
  ↓
MVP-00
  ↓
MVP-01
  ↓
MVP-02
  ├──────────────┐
  ↓              ↓
MVP-03        MVP-04
  ↓              ↓
  └──────→ MVP-05
               ↓
            MVP-06
               ↓
            MVP-07
               ↓
            MVP-08
               ↓
            MVP-09
               ↓
            MVP-10
               ↓
            MVP-11
```

说明：

- 地图骨架 MVP-04 可以与正式内容整理 MVP-03 并行。
- MVP-05 之后必须使用通过数据校验的正式或审核中数据。
- MVP-11 是发布门禁，不是可省略的文档任务。

## 4. 每个 Codex 任务的交付要求

每次交付至少附带：

1. 本任务改动摘要。
2. 实际修改文件列表。
3. 新增或变更的数据契约。
4. 执行过的命令及结果。
5. 未完成项；若存在，必须说明为何不影响本任务验收。
6. 明确声明未实现本任务“不做什么”中的范围。
