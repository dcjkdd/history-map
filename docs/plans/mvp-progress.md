# 安史之乱二维交互地图：MVP 实施进度

- 状态：执行进度索引
- 更新日期：2026-08-01
- 当前 Git 基线：`efd3d0b1d3af3e2739f1a3eef3724f312ed2cbb7`（已推送的 `MVP-08` 完成提交）
- 最近完成任务：`MVP-08`（完成提交 `efd3d0b` 并已推送）
- 当前工程任务：`MVP-09`（实现与验证完成，待用户确认提交）
- 下一工程任务：`MVP-10`

## 1. 文档定位

本文件只记录任务完成状态、对应 Git 提交、验证证据、阻断条件和下一步，不修改任何需求或发布门禁。

发生冲突时，仍按 [ADR-0001](../decisions/0001-静态前端MVP优先.md) 规定的顺序判断：用户当前要求、MVP 范围、MVP 验收标准、MVP 任务、ADR、长期架构与开发文档。

实现是否存在以 Git 提交和当前源码为准；历史内容是否允许发布以资料笔记、内容审核记录和人工签字为准。

## 2. 阶段状态

| 阶段 | 状态 | 实施提交 | 当前结果 |
|---|---|---|---|
| `MVP-PRE-00` | `COMPLETED` | `c813182` | 唯一项目根目录、Node 24.18.0、文档权威和静态 MVP 边界已建立 |
| `CONTENT-00` | `COMPLETED_WORKFLOW_ONLY` | `c813182`、`9ba3dea` | 资料模板、逐条 Claim/Citation 入口和人工审核门禁已建立；不代表历史内容获批 |
| `MVP-00` | `COMPLETED` | `110c93a` | Vue 3、TypeScript、Vite 最小工程骨架已完成 |
| `MVP-01` | `COMPLETED` | `d66f326` | 数据契约、运行时校验、selectors、静态 Repository 和技术空数据集已完成 |
| `MVP-02` | `COMPLETED` | `9012469` | 数据完整性校验命令、构建门禁和损坏数据失败测试已完成并推送 |
| `MVP-03` | `COMPLETED` | `3ccdecc` | 缩小版正式数据、双表审核门禁和内容测试已完成；完整工程检查通过，用户已确认提交/推送 |
| `MVP-04` | `COMPLETED` | `1fdfcf8` | MapLibre 地图壳、数据集初始视野、底图配置、本地降级、清理与浏览器验证已完成并推送 |
| `MVP-05` | `COMPLETED` | `db785d4` | 地理要素、地点图层、三组图层状态、地点选择、图例与浏览器验证已完成并推送 |
| `MVP-06` | `COMPLETED` | `9a266df` | 离散事件时间轴、默认事件、前后切换、节点直选、键盘操作、生产 worker 修复与浏览器验证已完成并推送 |
| `MVP-07` | `COMPLETED` | `bc24322` | 路线逐段显隐、事件相关地点、手动地点优先级、路线开关和样式重载恢复已完成并推送 |
| `MVP-08` | `COMPLETED` | `efd3d0b` | 事件/地点/空详情、逐条引用、观点与可信度文字、关闭地点返回事件和浏览器验证已完成并推送 |
| `MVP-09` | `COMPLETED_PENDING_COMMIT` | 待用户确认 | 桌面单页布局、主动事件/地点定位、加载错误重试、键盘与生产浏览器验证已完成 |
| `MVP-10`—`MVP-11` | `PENDING` | — | 按任务依赖顺序推进 |

提交 `0394d7e` 只删除旧版文档归档 `history-map-docs.zip`，不代表新的 MVP 阶段。

## 3. MVP-01 完成证据

### 实现范围

- `frontend/src/domain/mvpTypes.ts`
  - 定义 `MvpDataset`、Topic、GeoJSON Feature、Event、Source、Citation、`SourcedClaim`、`MvpDataError` 和稳定枚举。
- `frontend/src/domain/mvpValidation.ts`
  - 从 `unknown` 开始执行结构、字段、枚举、GeoJSON 和 `schemaVersion=1.0` 运行时校验。
  - 稀疏数组不能绕过元素校验。
- `frontend/src/domain/mvpSelectors.ts`
  - 提供 Event、Place 和 Citation/Source 查询。
  - Citation 或 Source 缺失时给出明确错误，不静默丢失证据。
- `frontend/src/data/mvpRepository.ts`
  - 统一加载 `/data/anshi/mvp-v1.json`。
  - 分别处理请求失败、HTTP 错误、响应体读取失败、非法 JSON 和合同错误。
- `frontend/public/data/anshi/mvp-v1.json`
  - 当前是结构有效的技术空数据集，不包含已审核历史事件、地点、路线、坐标或引用。
- `frontend/tests/data/mvp-contract.test.ts`
  - 覆盖合同成功、技术空数据、版本/字段/几何/Claim 错误、稀疏数组、Repository 错误和 selectors。

### 独立验证

- 环境：Node.js `24.18.0`、npm `11.16.0`
- `npm ci`：通过
- `npm run check`：通过
- 自动测试：2 个测试文件、20 个测试全部通过
- 生产构建：通过
- 构建后的 `mvp-v1.json` 与源文件一致
- `npm audit --audit-level=high`：0 项漏洞
- 未增加新依赖，未修改 `package.json` 或 `package-lock.json`

### 外部复核

ChatGPT Pro 在限时静态审查中未发现 P0—P2，提出 3 个 P3：

1. Citation/Source 缺失被 selector 静默吞掉。
2. 响应体读取中断被误判为非法 JSON。
3. 稀疏数组可以绕过部分元素校验。

Codex 逐项核对后全部采纳，并增加回归测试；最终合格判断仍由 Codex 根据源码和本地门禁独立完成。

## 4. MVP-02 完成证据

### 实现范围

- `frontend/src/domain/mvpTypes.ts`
  - 新增带 `severity`、稳定 `code`、`path` 和 `message` 的完整性问题类型。
- `frontend/src/domain/mvpValidation.ts`
  - 新增重复 ID、悬空引用、WGS84 坐标范围、Event/RouteSegment 连续序号、默认事件、Claim/Citation/Source 引用和低可信度地点坐标说明校验。
  - 非法稳定枚举返回 `UNSUPPORTED_ENUM`；缺少 Claim Citation 返回 `MISSING_CITATION`。
- `frontend/scripts/validate-data.ts`
  - 默认读取正式 `public/data/anshi/mvp-v1.json`，先运行 MVP-01 结构校验，再运行同一套 MVP-02 完整性校验。
  - 任一 `ERROR` 设置非零退出码；不联网查询或自动修复数据。
- `frontend/package.json`
  - 新增 `npm run validate:data`。
  - `build` 和 `check` 均在生产构建前执行正式数据校验。
- `frontend/tests/data/mvp-integrity.test.ts`
  - 使用不代表历史事实的合成数据覆盖全部稳定错误码、技术空数据和实际 npm 门禁失败退出码。

### 当前验证

- 环境：Node.js `24.18.0`、npm `11.16.0`
- `npm ci`：通过
- `npm run validate:data`：技术空数据集通过，0 个警告
- `npm run check`：通过
- 自动测试：3 个测试文件、35 个测试全部通过
- 生产构建：通过
- 未增加依赖，未修改 `package-lock.json`

### 限时静态复核

ChatGPT Pro 在 8 分 28 秒的只读静态复核中未发现 P0、P1 或 P3，提出 1 个 P2：原实现仅以 `events.length === 0` 判断技术空数据集，可能让已有 Place/Geography 等内容但没有 Event 的部分数据绕过默认事件门禁。

Codex 对照 MVP-02 边界和当前技术空数据形态后独立确认该问题成立，已改为只有 Places、Geography、RouteSegments、Events、Sources、Citations 全部为空时才允许 `defaultEventId=null`，并增加三个默认事件边界测试。修复后的最终合格判断仍由 Codex 根据源码和本地门禁独立完成，Pro 不直接判定是否验收通过。

MVP-02 已形成实施提交 `9012469`（`前端：完成 MVP-02 数据完整性门禁`），并推送到 `origin/master`；本地 `HEAD`、本地 `origin/master` 和 GitHub 远端 `master` 已核对一致。

## 5. 当前内容门禁

### 正式组装结果

- `frontend/public/data/anshi/mvp-v1.json` 已由 `scripts/assemble-anshi-mvp-data.mjs` 生成：5 个 Place、3 个 Geography、3 个 RouteSegment（2 个逻辑 routeId）、6 个 Event、19 个 Source、36 个 Citation，以及 33 条运行时 SourcedClaim。另有 2 条已批准 RoutePlan Claim 仅作审核组织，不写入运行时 JSON。
- 组装器同时读取资料笔记与内容审核表，要求每个拟发布 Source、Citation、Claim 在两处均为 `APPROVED`，且审核人为 `banq`、审核日期为 `2026-07-31`；Claim 还必须精确匹配 entityType、entityId、field。
- 地点坐标全部保持 `DISPUTED`；事件时间全部保持 `APPROXIMATE` 且 `normalizedDate=null`；三段示意方向全部保持 `INFERENCE / LOW`，并逐段验证两端恰好等于已批准地点代表点。
- `PENDING_SOURCE`、`PENDING_REVIEW`、`REJECTED` 及后续候选没有进入正式数据。它们不属于本次缩小版发布范围，不阻塞 MVP-03。

### 工程验证与静态复核

- 环境：Node.js `24.18.0`、npm `11.16.0`；未增加依赖，未修改 `package.json` 或 `package-lock.json`。
- `npm --prefix frontend run validate:data`：通过，0 个警告。
- `npm --prefix frontend run check`：通过；4 个测试文件、40 个测试全部通过，TypeScript 检查与生产构建通过。
- ChatGPT Pro 的一次限时只读静态复核未报告 P0，但指出审核表未被生成器交叉校验、发布 ID 未按人工审核表精确锁定、路线端点和 Event Claim 归属断言不足等 P1，以及 Markdown 解析、Polygon 闭合与 Geography certainty 等 P2。Codex 独立核对后修复了成立的问题：组装器和内容测试现在执行双表 `APPROVED`/reviewer/reviewDate 校验、正式 ID 集合一致性、Claim entityType/entityId/field、路线两端、Polygon 闭合和现代地理不确定性检查；Markdown 表行也增加了严格列数断言。最终工程判断由 Codex 依据本地门禁作出，Pro 不直接判定验收。
- 用户已于 2026-07-31 明确确认提交并推送；本文件与 MVP-03 实现一并进入本次提交。

### 审核历程与边界

以下逐项段落保留审批历程；其中“尚未写入”“等待其余实体”等措辞描述的是当时状态，均已由上面的正式组装结果取代，不代表当前门禁状态。

- `data/curated/anshi-mvp-source-notes.md` 当前已批准 90 个 Source/Citation/Claim 记录：19 个 Source、36 个 Citation、35 个 Claim；另有 3 个已批准的现代背景几何和 3 个已批准的 `INFERENCE / LOW` 示意路线分段。
- `banq` 已于 2026-07-31 完成潼关、陕州、洛阳、长安各自的限定地点摘要、战略作用、现代遗址或展示地标代表点及直接来源链，灵宝限定摘要、现代“稠桑原”同名居民点候选、成组 CRS 技术核验和直接 Source/Citation，“燕军受阻于潼关”“燕军推进至潼关前”“唐廷催令唐军出关”“唐燕军战于灵宝西原”“燕军攻克潼关”“玄宗离开后燕军占领长安”六个 Event 的完整字段、各两条 Claim、《资治通鉴》固定修订有限使用边界和直接 Citation，以及黄河、渭河、秦岭现代背景几何和保守摘要的人工签字；其余内容记录仍未审核。
- 5 个 Place、3 个 Geography、6 个 Event 和 2 个逻辑路线槽位均已组装；两个 RoutePlan、共 3 个 `INFERENCE / LOW` RouteSegment 以及全部运行时必填 Claim 已获得人工批准，16/16 个逻辑实体达到字段齐全的发布条件。
- 潼关已补充官方文保名单、陕西省文物志转载、新华社报道、用户提供的 1992 年《潼关县志》、OpenStreetMap `way/1195138308` v3，以及用户提供的《安史之乱：历史、宣传与神话》EPUB。`banq` 已批准 `[110.2909781, 34.6035548]` 作为严格标注 `DISPUTED` 的“现代旧城遗址代表点”，批准说明多来源冲突的地点摘要，并批准限定战略作用；这不确认 755—756 年唐城中心、关防范围或现代景区对应。`place-tongguan` 实体状态为 `APPROVED`，但正式数据仍保持技术空集，等待缩小版其余必需实体完成。
- 灵宝地点摘要已批准为“灵宝西原及南山—黄河间狭窄通道”的相对描述，但没有把现代灵宝市中心、秦函谷关景区或任一 POI 认定为战场。`banq` 于 2026-07-31 批准现代“稠桑原”原值 `[110.872607, 34.615468]` 作为必须保持 `DISPUTED` 的 OGC:CRS84 同名居民点代表点，并独立批准限定的 `Place.strategicRole`；`place-lingbao` 已满足正式发布契约。
- 灵宝市政府 2025-01-03 公示环境报告的表 2.6-1 提供现代“稠桑原”居民点原始坐标 `[110.872607, 34.615468]`。2026-07-31 已完成五个居民点、三个厂址锚点与 Esri World Imagery 的成组技术核验：三个可区分居民点和厂址现场关系支持原值直接叠加，两个居民点记为歧义，没有样本支持 GCJ-02 转换；转换假设会整体西南移约 `517.7—518.0m`，并使厂址落入坡寨村聚落，与报告现场文字冲突。`banq` 已批准技术记录、两个直接 Source/Citation、原值候选和使用边界；WGS84/CGCS2000 无法区分的残余不确定性继续保留。当前 `mvp-v1.json` 保持不变，等待缩小版其余必需实体完成。
- 陕州证据链已获人工批准：河南档案信息网与三门峡日报分别支持宝轮寺塔位于故城东南部及故城在唐宋城址基础上延续；OpenStreetMap `node/12768197183` v1 的 `[111.1488645, 34.7915940]` 已接受为 `DISPUTED / APPROVED` 的现代故城内部地标代表点。CHGIS `hvd_83048` 仍只作内部交叉核对，其 `CC BY-NC 4.0` 坐标不打包，州级 `hvd_115770` 点位也不是治所证据。`place-shanzhou` 已满足缩小版发布条件，但尚未写入正式数据或地图。
- 洛阳证据链已获人工批准：国家发展改革委网页支持隋唐洛阳城以洛水贯穿、主要分布于今洛阳四个城区，并明确应天门为宫城正南门；OpenStreetMap `way/865951589` v4 展示建筑范围的质心 `[112.4545867, 34.6769987]` 已接受为 `DISPUTED / APPROVED` 的现代应天门遗址展示地标代表点。该点不是 755—756 年洛阳城中心、完整城界、历史城门原状或事件点。地点摘要、战略作用、坐标候选及直接 Source/Citation 均已由 `banq` 于 2026-07-31 批准；`place-luoyang` 已满足缩小版发布条件，但尚未写入正式数据或地图。
- 长安证据链已获人工批准：西安市地方志办公室网页支持唐长安城承继隋大兴城、遗迹多数叠压在现代城市下，并把大明宫和丹凤门列入遗址；陕西省文物局网页支持大明宫的宫殿与权力中心属性，并区分丹凤门遗址和展示设施；OpenStreetMap `way/280412702` v4 的现代丹凤门建筑范围质心 `[108.9594728, 34.2828248]` 已接受为 `DISPUTED / APPROVED` 的现代大明宫遗址展示地标代表点。该点不是 755—756 年长安城中心、完整城界、唐代丹凤门原状或具体事件点。地点摘要、战略作用、坐标候选及直接 Source/Citation 均已由 `banq` 于 2026-07-31 批准；`place-changan` 已满足缩小版发布条件，但尚未写入正式数据或地图。
- “潼关防线背景”事件证据链已获人工批准：正式候选标题为“燕军受阻于潼关”，`eventType=DEFENSE`，时间仅写“安禄山起兵约半年后（原书相对表述）”，保持 `normalizedDate=null`、`APPROXIMATE / UNKNOWN`。用户提供 EPUB 的固定段落与《资治通鉴》卷二百一十八维基文库固定修订 `oldid=1996147` 已完成交叉核对；完整 Event 字段、两条 Claim、`SRC-PRIMARY-01` 的有限使用边界、`CIT-ZZTJ218-R1996147-P00`、`P01` 及既有 EPUB Citation 的事件用途均由 `banq` 于 2026-07-31 批准。本批准不包括兵力、伤亡、精确公历日期、坐标、防线范围、路线几何或后续出关事件；该 Event 尚未写入正式数据或地图。
- “燕军西进背景”事件证据链已获人工批准：正式候选标题为“燕军推进至潼关前”，`eventType=MARCH`，时间只写“洛阳失守后至潼关防线形成”，保持 `normalizedDate=null`、`APPROXIMATE / UNKNOWN`；相关地点只引用已批准的洛阳、陕州、潼关。用户提供 EPUB 的两个固定段落与《资治通鉴（四库全书本）》卷二百一十七固定修订 `oldid=783496` 只用于宏观节点和防御节点收缩的限定归纳；普通转录 `oldid=617834` 因可见“炅昌”“至峽”等错字明确排除。`SRC-PRIMARY-03`、三条本轮批准的 Citation、完整 Event 字段和两条 Claim 均由 `banq` 于 2026-07-31 批准；不生成 RouteSegment、坐标、现代道路路线或精确日期，也不采用地形/后勤单一因果或责任判断。该 Event 尚未写入正式数据或地图。
- “唐军出关决策”事件证据链已获人工批准：标题为“唐廷催令唐军出关”，`eventType=POLITICAL`，时间只写“唐军出关前的命令过程至实际出关（传统纪日未换算）”，保持 `normalizedDate=null`、`APPROXIMATE / UNKNOWN`。候选只采用《资治通鉴》固定修订所载“收到报告—固守异议—继续催令—最终出关”的顺序，以及 EPUB 对最终离开潼关和后续灵宝方向交战的有限衔接；不把报告敌情视为已证事实，不采用兵力、精确传统纪日、粮运/军政单一因果、责任判断或路线几何。完整 Event、两条 Claim、固定修订新增用途和 EPUB Citation 限定用途均由 `banq` 于 2026-07-31 批准；该 Event 尚未写入正式数据或地图。
- “灵宝方向交战”事件证据链已获人工批准：标题为“唐燕军战于灵宝西原”，`eventType=BATTLE`，时间只写“唐军出关后、潼关失守前（传统纪日未换算）”，保持 `normalizedDate=null`、`APPROXIMATE / UNKNOWN`。只采用《资治通鉴》固定修订所载灵宝西原、南近山北临河的狭道、交战和唐军溃败，以及 EPUB 的相对地形文字与交战开始；`body-p027`—`body-p042` 的兵力、部署、火攻、风向和责任重建明确不采用。现代“稠桑原”代表点只作 `DISPUTED` 叙事锚点，不是战场坐标；潼关失守留给下一 Event。完整 Event、两条 Claim、固定修订 Citation 和两个 EPUB Citation 的限定用途均由 `banq` 于 2026-07-31 批准；该 Event 尚未写入正式数据或地图。
- “潼关失守”事件证据链已获人工批准：标题为“燕军攻克潼关”，`eventType=CAPTURE`，时间只写“灵宝西原交战后（传统纪日未换算）”，保持 `normalizedDate=null`、`APPROXIMATE / UNKNOWN`。只采用《资治通鉴》固定修订和 EPUB `part0010.html#body-p002` 共同支持的“哥舒翰收集散卒—火拔归仁等控制并带走哥舒翰—崔乾祐攻克潼关”顺序，不把先后写成唯一因果；兵力、伤亡、守关可能性、反事实、精确间隔、人物评价和路线均不采用。现代潼关代表点只作 `DISPUTED` 叙事锚点，不是 756 年关城或攻关位置。完整 Event、两条 Claim 及两个既有 Citation 的新增限定用途均由 `banq` 于 2026-07-31 批准；该 Event 尚未写入正式数据或地图。
- “长安局势变化”事件证据链已获人工批准：标题为“玄宗离开后燕军占领长安”，`eventType=CAPTURE`，时间只写“潼关失守后至燕军占领长安（传统纪日未换算）”，保持 `normalizedDate=null`、`APPROXIMATE / UNKNOWN`。只采用《资治通鉴》固定修订与 EPUB 支持的“玄宗离开长安—燕军先留兵潼关—随后另遣军进入长安”顺序，把离城与占领作为两个先后节点而非同一天；精确纪日/间隔、兵力、路线、地点、动机、占领后细节和唯一因果均不采用。现代丹凤门代表点只作 `DISPUTED` 叙事锚点，不是事件点。完整 Event、两条 Claim、`CIT-ZZTJ218-R1996147-P03` 及两个 EPUB Citation 的新增事件用途均由 `banq` 于 2026-07-31 批准；该事件已计入当前 15/16 个字段完整逻辑实体，正式数据仍等待灵宝必填 `Place.strategicRole` 完成。
- “燕军向潼关方向推进”逻辑路线已获人工批准：历史材料只支持“洛阳—陕郡—潼关”的宏观节点顺序，因此明确排除灵宝；以三个已批准但保持 `DISPUTED` 的现代代表点分成“洛阳→陕州”“陕州→潼关”两个两点直连 RouteSegment，均为 `side=YAN`、`actionType=ADVANCE`、`appearAtEventId=event-02-yan-westward`、`INFERENCE / LOW`。不增加中间顶点，不调用或跟随现代道路/路由，不主张唐代道路、行军轨迹、城市/关城中心、渡口、攻关位置、里程或速度。RoutePlan、两个 RouteSegment、三条 Claim 和处理边界均由 `banq` 于 2026-07-31 批准；正式数据继续等待灵宝必填 `Place.strategicRole` 完成。
- “唐军出关行动”逻辑路线已获人工批准：历史材料只支持唐军从潼关出关并在灵宝西原方向交战，因此只生成“潼关→灵宝”一个两点直连 RouteSegment；陕州、洛阳只是意图方向，未证明战败前实际到达，溃败撤退也明确排除。该路线使用两个已批准但保持 `DISPUTED` 的现代代表点，字段为 `side=TANG`、`actionType=ADVANCE`、`appearAtEventId=event-03-decision-to-advance`、`INFERENCE / LOW`。不增加中间顶点，不调用或跟随现代道路/路由，不主张唐代关城、战场、道路、部署、行军轨迹、撤退线、里程或速度。RoutePlan、RouteSegment 和两条 Claim 均由 `banq` 于 2026-07-31 批准；正式数据仍因灵宝必填 `Place.strategicRole` 待审核而不变。
- 当前 `mvp-v1.json` 是缩小版正式数据；技术空数据形态仅由合成测试夹具继续覆盖。
- 不得把工作标签、猜测坐标、示例页码、未经说明的精确日期或项目推断转换成正式历史数据。

## 6. MVP-04 完成证据

### 实现范围

- `frontend/src/views/AnshiMvpView.vue`
  - 只通过既有 `loadMvpDataset()` 加载正式数据，并把 `topic.initialView` 交给地图组件。
  - 提供数据加载中和加载失败状态；没有建立 MVP-09 的重试、页面整合或详情交互。
- `frontend/src/components/map/HistoryMap.vue`
  - 挂载时创建单一地图，显示样式加载/降级/初始化错误状态，卸载时销毁地图。
  - 暴露 `fitToTopic()`，但没有加入地点、地理、路线、时间轴或事件定位 UI。
- `frontend/src/composables/useMapLibre.ts`
  - 支持 `center`、`zoom`、可选 `bounds` 与 `maxBounds`，重复初始化只复用当前实例。
  - 有 `VITE_MAP_STYLE_URL` 时使用配置值；未配置或外部根样式初次加载失败时，按 Vite `BASE_URL` 使用本地 `map/empty-style.json`。
  - 外部根样式失败切换使用完整样式替换，避免未加载样式的 diff 警告；加载期间或就绪后的局部资源错误只做非阻断提示，不误触发降级。
  - 本地降级样式自身失败时进入明确的 `degraded` 终态，结束忙碌提示并保留可读告警。
  - 显式配置 MapLibre 6 worker URL，避免 Vite 开发优化目录缺失 worker；生产构建会输出独立 worker 资源。
- `frontend/public/map/empty-style.json`
  - 只包含无外部请求的中性背景，不包含瓦片、历史图层或未经核对的许可/署名。
- `frontend/src/styles/map.css` 与既有页面样式
  - 引入 MapLibre 官方 CSS，提供稳定地图尺寸、状态提示和 1024px 桌面宽度下的可用布局。

### 自动验证

- 环境：Node.js `24.18.0`、npm `11.16.0`。
- `npm ci`：通过；没有修改 `package.json` 或 `package-lock.json`。
- `npm --prefix frontend run typecheck`：通过。
- `npm --prefix frontend run validate:data`：通过，0 个警告。
- `npm --prefix frontend run test`：6 个测试文件、53 个测试全部通过。
- `npm --prefix frontend run build`：通过；构建产物包含独立 `maplibre-gl-worker-*.mjs`。MapLibre 主包使单一入口 chunk 超过 Vite 的 500 kB 提示阈值，但不是构建失败，也未引入额外依赖或提前拆分 MVP-05 代码。
- `npm --prefix frontend run check`：通过；依次重复完成类型检查、正式数据校验、53 个测试和生产构建。
- 使用 `--base=/history-map/` 的额外生产构建通过，入口、MapLibre worker 和本地空白样式均使用相同非根 base。

新增测试覆盖数据加载成功/失败、初始视野、`bounds` / `maxBounds`、专题视野复位、未配置样式、外部根样式失败降级、加载中及加载后的局部资源错误、本地样式失败终态、非根 `BASE_URL`、重复初始化，以及监听器和地图实例清理。

### 浏览器现场验证

- 未设置 `VITE_MAP_STYLE_URL`：正式数据加载成功，本地中性背景就绪，拖动和滚轮缩放后仍只有 1 个 MapLibre 地图和 1 个 Canvas，浏览器与开发服务器均无 warning/error。
- 设置有效的 `/map/empty-style.json`：按配置路径加载，样式就绪，无降级提示，浏览器无 warning/error。
- 设置故意损坏的 `/map/missing-style.json`：收到 404 后自动切换本地中性背景，地图保持可用且实例不重复，浏览器无 warning/error。
- 1024×768：地图区域为 934×480，无横向溢出，提示与地图容器可见。
- 最终生产预览：正式标题与数据正常，底图就绪后 `aria-busy=false`，只有 1 个 MapLibre 实例和 1 个 Canvas，无横向溢出。

### 限时静态复核

ChatGPT Pro 在 10 分 05 秒的一次只读静态复核中未报告 P0、P1 或 P3，提出 3 个 P2：样式首次加载期间的任意 `error` 可能被误判为外部根样式失败；硬编码根路径会影响非根 Vite 部署；本地降级样式自身失败时会永久保持加载状态。复核没有安装依赖、修改代码或 lockfile，也没有直接判定 MVP-04 是否验收通过。

Codex 逐项对照 MapLibre 6 本地源码和实际实现独立核实：采纳根样式与局部资源错误分类、`BASE_URL` 路径和 `degraded` 终态三项修复，并增加回归测试；没有采纳额外“样式代际令牌”建议，因为 MapLibre 在完整替换样式时会解除旧 Style 的事件父级并清理旧实例。最终工程判断仍只依据当前源码、本地门禁和浏览器证据。

### 范围与内容边界

- 没有修改 `mvp-v1.json`、资料笔记、内容审核表、历史事实、日期、坐标、路线、许可记录或审核签字。
- 没有选择或批准生产外部底图供应商；`.env.example` 明确要求公开部署前核对 Style URL 的许可证、配额和署名。MVP-04 只提供可配置入口、有效 Style URL 路径验证和本地降级。
- 没有实现 MVP-05 地理/地点/路线图层、图层控制与图例，也没有实现后续时间轴、详情、后端、3D 或其他暂缓能力。

## 7. MVP-05 完成证据

### 实现范围

- `frontend/src/map/layers/geographyLayer.ts` 与 `placeLayer.ts`
  - 分别以独立、带项目命名空间的 GeoJSON source/layer 组加载正式 Geography 和 Place。
  - 河流使用连续蓝灰线，山地/通道使用低透明度面与虚线边界，不与后续行动路线混淆。
  - CITY 使用实心圆，PASS 使用双层圆环，其他地点使用较小符号；LOW、DISPUTED、UNKNOWN 额外显示外圈，不只依赖颜色。
  - `addGeographyLayers()`、`addPlaceLayers()`、`setLayerVisibility()` 和 `setSelectedPlace()` 均先检查 MapLibre 当前样式状态，重复调用不会重复添加 source/layer。
- `frontend/src/stores/mvpStore.ts`
  - 只建立一个 MVP store，管理 geography、places、routes 三组可见性和地点/事件选择槽位；routes 在本阶段只有状态，不绘制路线。
- `frontend/src/components/map/HistoryMap.vue`
  - 在每次 `style.load` 后幂等恢复正式图层、可见性和选中地点；地图点击只从现存地点层命中 `placeId` 并写入 store。
  - 卸载时解除新增的 `style.load` 和 `click` 监听器，再沿用 MVP-04 的地图实例清理。
- `LayerControl.vue` 与 `MapLegend.vue`
  - 提供三个原生 checkbox 图层开关；路线明确标注“待后续阶段绘制”。
  - 图例解释地点类型、现代地理背景和 LOW/DISPUTED/UNKNOWN 外圈语义，并明确代表点或重建不等于精确历史坐标。
  - 图例位于图层控件下方的右上区域，为 MapLibre 及潜在外部底图署名保留右下角空间。

### 自动验证

- 环境：Node.js `24.18.0`、npm `11.16.0`；`npm ci` 通过，未增加依赖，未修改 `package.json` 或 `package-lock.json`。
- `npm --prefix frontend run typecheck`：通过。
- `npm --prefix frontend run validate:data`：通过，0 个警告。
- `npm --prefix frontend run test`：9 个测试文件、62 个测试全部通过。
- `npm --prefix frontend run build`：通过；MapLibre 主入口仍有既存的 500 kB chunk 提示，不是构建失败。
- `npm --prefix frontend run check`：通过；依次重复完成类型检查、正式数据校验、62 个测试和生产构建。
- 使用 `--base=/history-map/` 的额外生产构建通过。

新增测试覆盖两个独立 source/layer 组、样式表达式、类型与不确定性样式、幂等添加、三组可见性、routes 空组、地点选中/清除、store 状态、原生 checkbox 和图例语义；组件测试覆盖重复 `style.load`、真实的外部根样式失败到降级 `style.load` 链、可见性/选中状态恢复、地图点击和监听器清理。

### 浏览器现场验证

- 未设置 `VITE_MAP_STYLE_URL`：本地中性背景上实际显示 3 个现代 Geography 和 5 个 Place；城池、关隘、其他地点及争议外圈可辨识。
- 三个图层开关均可关闭和恢复；关闭 Geography 后只保留地点，关闭 Place 后只保留地理背景，routes 开关只改变预留状态且没有提前绘制路线。
- 点击潼关代表点出现选择高亮，点击空白地图可清除；拖动和滚轮缩放后仍只有 1 个 MapLibre 地图和 1 个 Canvas。
- 1024×768 下地图区域为 934×480，图层控件和图例可见，无横向溢出；图例、降级提示、MapLibre attribution/info 控件的矩形边界均不相交，署名按钮可点击且展开后 MapLibre 链接可见。
- 1440×900 宽屏下再次测量，图例、降级提示与 attribution 仍无交叠，页面无横向溢出。
- 配置有效的 `/map/empty-style.json` 时历史图层正常、无降级提示；配置故意损坏的 `/map/missing-style.json` 后收到 404 并切换本地中性背景，历史图层在降级 `style.load` 后仍存在。
- 最终生产预览中正式标题、三开关、图例和历史图层正常，`aria-busy=false`；上述路径浏览器控制台均为 0 warning/error。

### 限时静态复核

ChatGPT Pro 的一次只读静态复核报告 1 个 P1 和 1 个 P3：右下角图例可能遮挡 MapLibre/外部供应商署名，以及自动测试没有在同一组件用例中串起 `error → setStyle → style.load`。复核未安装依赖、修改代码或 lockfile，也未直接判定 MVP-05 是否验收通过。

Codex 独立对照源码、现场截图和测试核实后采纳两项：把图例移至右上并为署名保留右下区域；新增外部根样式失败的完整组件回归，断言降级后 source/layer 只建立一次，并恢复隐藏 Geography 与选中地点。修复后类型检查、62 个测试、构建和完整 `check` 均通过；没有剩余 P0—P2 静态问题。

### 范围与内容边界

- 没有修改 `frontend/public/data/anshi/mvp-v1.json`、资料笔记、内容审核表、历史事实、日期、坐标、路线、许可记录或审核签字。
- 直接消费 MVP-03 正式 JSON；全部地点仍为 DISPUTED，现代 Geography 仍为 UNKNOWN，图例和外圈没有把它们表现为确定事实。
- 没有选择生产外部底图供应商，也没有填写未经核对的 Style URL、Token、许可或署名结论。
- routes 只有 store 和开关状态，没有实现路线图层；没有实现 MVP-06 的事件时间轴、默认事件状态、详情交互或后续阶段功能。

## 8. MVP-06 完成证据

### 实现范围

- `frontend/src/domain/timeline.ts`
  - 提供不修改输入数组的 `sortEvents()`，只按 `Event.sequence` 驱动离散顺序；`dateLabel` 仅用于展示。
  - 提供 `getPreviousEventId()` 与 `getNextEventId()`，首尾、未知 ID 和空集合均安全返回 `undefined`。
- `frontend/src/stores/mvpStore.ts`
  - 在既有单一 MVP store 中增加 `orderedEventIds`、默认事件、`selectedSequence`、`hasPrevious` 和 `hasNext`。
  - `initializeTimeline()` 从正式数据建立顺序并选择 `topic.defaultEventId`；`selectEvent()`、前后切换和复位均拒绝制造未知事件状态，且不改变地点选择或图层状态。
- `EventTimeline.vue` 与 `TimelineControls.vue`
  - 使用原生 `button` 和有序列表显示全部事件的 `dateLabel` 与标题，当前节点使用 `aria-current="step"`。
  - 上一/下一在边界使用原生 `disabled`；事件节点支持鼠标直选和左右方向键，并把焦点移动到相邻节点。
- `AnshiMvpView.vue` 与 `main.css`
  - Repository 加载并通过运行时校验后才初始化时间轴；页面只从既有正式 Dataset 组装有序事件，不直接读取 JSON。
  - 1024px 桌面宽度下使用可横向滚动的离散节点，宽屏下六个节点同列展开；焦点样式不只依赖颜色。

### 自动验证

- 环境：Node.js `24.18.0`、npm `11.16.0`；`npm ci` 通过，未增加依赖，`package.json` 只增加 worker 产物校验命令，`package-lock.json` 未修改。
- `npm --prefix frontend run typecheck`：通过。
- `npm --prefix frontend run validate:data`：通过，0 个警告。
- `npm --prefix frontend run test`：12 个测试文件、78 个测试全部通过。
- `npm --prefix frontend run build`：通过；MapLibre worker 生成自包含的 `maplibre-gl-worker-*.js`，主入口仍有既存的 500 kB chunk 提示，不是构建失败。
- `npm --prefix frontend run check`：通过；依次完成类型检查、正式数据校验、78 个测试、根路径生产构建和 worker 产物闭包校验。
- `npm --prefix frontend run build -- --base=/history-map/` 与随后运行的 `verify:worker-bundle`：通过；入口、样式、MapLibre worker 和本地空白样式使用一致的非根 base。

新增测试覆盖排序不修改输入、首尾边界、未知 ID、空集合、默认事件、重复选择、前后往返、复位、`dateLabel`/标题渲染、`aria-current`、原生禁用状态、到达边界后的焦点转移、无修饰键方向导航、修饰键保留，以及 View 中 Repository → store → 控件/节点的状态同步。worker 回归测试同时覆盖自包含产物通过和引用未发布 `maplibre-gl-shared.mjs` 的坏产物失败；既有地图样式失败、重复 `style.load`、图层恢复、监听器和实例清理测试继续全部通过。

### 生产 worker 修复

- 生产静态验证发现的既存 worker 缺口经用户明确授权纳入本任务：`useMapLibre.ts` 把 MapLibre 入口从普通 `?url` 资源改为 Vite `?worker&url` 入口，使 Vite 分析并打包 worker 的模块依赖。
- 修复前产物 `maplibre-gl-worker-*.mjs` 静态导入未发布的 `maplibre-gl-shared.mjs`；修复后根路径与非根路径均生成自包含 `maplibre-gl-worker-*.js`，不再存在该相对导入。
- `verify-worker-bundle.ts` 要求构建目录中恰好存在一个 MapLibre worker，并验证其中每个静态或动态相对模块引用都能在发布产物中解析；`check` 已把该验证作为根路径生产构建后的固定门禁。

### 浏览器现场验证

- 未配置 `VITE_MAP_STYLE_URL`：首次进入严格选择正式 `topic.defaultEventId`，显示第 1/6 个事件；连续前进到第 6/6 个事件后“下一事件”禁用，反向和任意节点直选正常。
- 重复选择第 3 个事件两次，`selectedEventId` 与第 3/6 状态完全一致；在第 3 个节点按 ArrowRight 后，选择与 DOM 焦点都移动到第 4 个节点，焦点轮廓实测为 3px。
- 拖动地图后仍保持第 4/6 个事件，页面仍只有 1 个 MapLibre 地图和 1 个 Canvas；时间轴切换不强制地图飞行，也不创建额外地图实例。
- 1024×768 下地图为 934×480，时间轴控件宽 934px，页面无横向溢出；六个节点在时间轴自身范围内横向滚动。1440×900 下时间轴无需横向滚动，页面同样无横向溢出。
- 显式配置有效本地 `/map/empty-style.json` 时无降级提示，事件可切到第 2/6；配置故意损坏的 `/map/missing-style.json` 后完整降级到本地中性背景，事件仍可切到第 3/6，且只有 1 个 MapLibre 地图和 1 个 Canvas。
- 根路径生产预览加载正式数据并显示 6 个事件；最终构建从第 5 个事件进入末端后保持单一 MapLibre/Canvas，并把焦点移到可用的“上一事件”。
- 非根生产构建按既有静态 API 契约验证：应用挂载于 `/history-map/`，正式数据同时挂载于根 `/data/`；入口和样式来自 `/history-map/assets/`，最终时间轴交互正常。仅用 `vite preview --base=/history-map/` 不会把契约规定的根 `/data/` 自动额外挂载出来，因此不能替代该部署形态验证。
- 无外部配置、有效本地样式、故意损坏样式、根路径生产预览和非根生产预览的浏览器 console 均为 0 warning/error。
- worker 修复后重新使用裸静态服务器验证：根路径依次取得入口、样式、根 `/data/`、`maplibre-gl-worker-*.js` 和本地空白样式的 HTTP 200；非根路径依次取得 `/history-map/` 下入口、样式、worker、空白样式和根 `/data/` 的 HTTP 200，服务器日志中不再出现 shared 模块 404。
- 根路径与非根路径生产页面均实际渲染河流、地形/通道和 5 个历史地点，地点图层可关闭并恢复；时间轴切换期间始终只有 1 个 MapLibre 地图和 1 个 Canvas。1024×768 下页面无横向溢出、时间轴自身横向滚动；1440×900 下时间轴完全展开且页面无横向溢出。两种部署的最终浏览器 console 均为 0 warning/error。

### 限时静态复核

ChatGPT Pro 在 8 分 21 秒的一次只读静态复核中未报告 P0 或 P1，提出 2 个 P2 和 1 个 P3：到达首尾时当前控制按钮动态禁用可能使键盘焦点落回 `body`；事件节点未排除带修饰键的左右方向键，可能拦截浏览器快捷键；普通 `div` 上的“事件切换控制”标签缺少明确分组角色。复核没有安装依赖、修改代码或 lockfile，也没有直接判定 MVP-06 是否验收通过。

Codex 逐项独立核实后全部采纳：真实浏览器复现了从第 5 个事件点击“下一事件”后焦点落到 `body`，因此在到达首尾时把焦点转移到仍可用的相邻控制按钮；为时间轴方向键增加 Alt/Ctrl/Meta/Shift 防护；为控制容器增加 `role="group"`。新增自动测试覆盖两端焦点和修饰键 `defaultPrevented=false`，真实浏览器确认末端焦点落到“上一事件”、起点焦点落到“下一事件”，Alt+ArrowRight 不改变事件或焦点。修复后 76 个测试和完整 `check` 通过；最终工程判断仍只依据当前源码、本地门禁和浏览器证据。

### 范围与内容边界

- 没有修改 `frontend/public/data/anshi/mvp-v1.json`、资料笔记、内容审核表、历史事实、日期、坐标、路线、许可记录或审核签字。
- 时间轴直接展示正式 `dateLabel`；全部 Event 仍为 `APPROXIMATE`、`normalizedDate=null`、`certainty=UNKNOWN`，页面明确说明时间文字不等同于精确公历日期。
- 没有新增或选择生产外部底图供应商，没有填写未经核对的 Style URL、Token、许可或署名结论。
- 经用户明确授权只额外修复 MVP-04 遗留的 MapLibre worker 生产打包缺口；没有改变地图数据契约、图层语义、外部底图策略或历史内容。
- 没有实现自动播放、连续滑块、速度控制、动画队列或 ECharts；也没有提前实现 MVP-07 的路线图层/事件地图同步、MVP-08 的详情/引用或其他后续阶段能力。

## 9. MVP-07 完成证据

### 实现范围

- `frontend/src/domain/deriveMapState.ts`
  - 纯函数 `deriveMapState()` 只按正式 Event `sequence` 和 RouteSegment `appearAtEventId` 派生 `visibleRouteSegmentIds`、`activeRouteSegmentIds`、`relatedPlaceIds`、`selectedPlaceId` 与 `currentEventId`。
  - 未知事件返回空路线/相关地点状态，不提前泄露未来路线；手动地点选择继续保留。
- `frontend/src/map/layers/routeLayer.ts`
  - 直接加载正式 RouteSegment GeoJSON，不修改坐标、端点或 `appearAtEventId`；基础层只显示截至当前事件已出现的路线，active 层只显示本事件首现路线。
  - TANG、YAN、COURT、OTHER 使用不同颜色、虚线节奏和基础粗细；active 段使用更高不透明度和更宽线型，并统一置于全部历史路线层之上。
  - 全部路线保持虚线和较弱历史段不透明度，图例明确标注 `INFERENCE / LOW`、宏观节点解释性示意和非精确行军轨迹边界。
- `placeLayer.ts`、`HistoryMap.vue` 与现有单一 MVP store
  - 事件相关地点使用独立金色外环；手动选择使用更粗深色外环、位于最上层，并从相关地点过滤中排除，保证手动选择优先。
  - `HistoryMap` 在事件/地点状态变化和每次 `style.load` 后统一恢复 geography、route、place source/layer、三组可见性、路线过滤与地点状态；没有新增地图事件监听器。
  - 路线开关关闭时仅改变 MapLibre layout visibility，时间轴仍正常前进/后退并继续计算当前派生状态；重新打开立即显示当前事件正确路线。
- `LayerControl.vue`、`MapLegend.vue` 与地图样式
  - 路线开关从“待后续阶段绘制”更新为“解释性示意”；图例增加唐军、燕军、朝廷转移和首现加粗的非单色语义，且不再使用与事件相关地点混淆的橙色路线样本。
  - 真实浏览器首次测量发现新增图例进入 MapLibre 署名区域，地图桌面最小高度由 30rem 调整为 34rem；1024 与 1440 复测均不再重叠。

### 自动验证

- 环境：Node.js `24.18.0`、npm `11.16.0`；`npm ci` 通过，未增加依赖，未修改 `package.json` 或 `package-lock.json`。
- `npm --prefix frontend run typecheck`：通过。
- `npm --prefix frontend run validate:data`：通过，0 个警告。
- `npm --prefix frontend run test`：13 个测试文件、86 个测试全部通过。
- `npm --prefix frontend run build`、`npm --prefix frontend run check` 与根路径 `verify:worker-bundle`：通过；worker 仍为自包含 `maplibre-gl-worker-*.js`，主入口只保留既有 500 kB chunk 提示。
- `npm --prefix frontend run build -- --base=/history-map/ --outDir dist-history-map` 与针对该目录的 `verify:worker-bundle`：通过。

新增测试覆盖前进、后退、未知事件、首次出现边界、重复派生、事件相关地点去重、手动地点保留/优先、TANG/YAN/COURT 非单色路线语义、active 样式、路线开关关闭时的事件往返、重复 `style.load`、外部根样式失败后的完整恢复、监听器与 MapLibre 实例清理。既有 Repository、数据合同、内容审核链、时间轴、worker 和地图降级回归继续全部通过。

### 浏览器现场验证

- 未配置 `VITE_MAP_STYLE_URL`：第 1 事件没有路线；第 2 事件同时首现两段燕军方向；第 3 事件保留较弱燕军历史段并新增更醒目的唐军段；返回第 2 事件后唐军未来段立即消失。
- 第 2 事件的洛阳、陕州、潼关显示事件相关金色外环；手动点击非相关长安后显示更粗深色外环，事件和相关地点状态不丢失。切到第 3 事件时手动长安选择继续保持，潼关相关地点单独高亮。
- 关闭路线后从第 2 切到第 3 事件仍正常更新为 3/6，地图保持地点高亮且不显示路线；重新打开路线后恢复第 3 事件应有的燕军历史段和唐军 active 段。
- 显式有效 `/map/empty-style.json`：无降级提示，第 2 事件路线正常；故意损坏 `/map/missing-style.json`：HTTP 404 后切换本地中性背景，`style.load` 后 geography、route、place 和第 3 事件状态全部恢复。
- 1024×768：地图 934×544，页面无横向溢出，时间轴自身横向滚动；图层控件、图例、告警和 MapLibre 署名互不重叠。1440×900：地图 1238×544，时间轴完全展开，页面无横向溢出，图例与署名不重叠。
- 全部交互过程中始终只有 1 个 MapLibre 容器和 1 个 Canvas；无配置、有效样式、损坏样式降级、根生产和非根生产浏览器 console 均为 0 warning/error。
- 根路径裸静态生产部署：入口、CSS、根 `/data/anshi/mvp-v1.json`、`/assets/maplibre-gl-worker-*.js` 和 `/map/empty-style.json` 均为 HTTP 200，路线逐段交互正常。
- `/history-map/` 裸静态生产部署：入口、CSS、worker 和空白样式来自 `/history-map/`，正式数据按既有契约来自根 `/data/`；全部请求 HTTP 200，第 3 事件路线和地点状态正常。

### 限时静态复核

ChatGPT Pro 在 8 分 37 秒的一次只读静态复核中未报告 P0 或 P1，提出 3 个 P2：不同主体的普通/active 图层交错添加会让较早主体的 active 段被后续普通层覆盖；“本事件首现”的橙色图例与实际保留主体颜色的 active 路线不一致，并与事件相关地点颜色混淆；线宽同时受主体、`actionType` 和 active 改变，却宣称可表达行动类型，无法稳定解码。复核没有安装依赖、修改代码或 lockfile，也没有直接判定 MVP-07 是否验收通过。

Codex 逐项独立核实后全部采纳：改为先添加全部历史路线层、再添加全部 active 层；首现图例改用唐/燕/朝廷的现有主体颜色并明确为“首现加粗”；移除不可解码的 `actionType` 线宽增减和相关图例声明，主体继续由颜色、不同虚线节奏和基础粗细共同区分，active 只增加粗细与不透明度。当前正式 3 个 RouteSegment 的 `actionType` 均为 `ADVANCE`，因此这项语义收敛不改变已完成浏览器验证的正式路线宽度；新增断言精确覆盖主体/active 线宽和“全部 active 位于全部历史层之上”的添加顺序。最终工程判断仍只依据当前源码、本地门禁和浏览器证据。

### 范围与内容边界

- 没有修改 `frontend/public/data/anshi/mvp-v1.json`、资料笔记、内容审核表、历史事实、日期、坐标、路线几何、`appearAtEventId`、许可记录或审核签字。
- 直接消费正式 3 个 RouteSegment 与 6 个 Event；地点继续为 DISPUTED，事件时间继续为 APPROXIMATE 且 `normalizedDate=null`，路线继续为 `INFERENCE / LOW`。
- 没有选择生产外部底图供应商，没有填写未经核对的 Style URL、Token、许可或署名结论；本地中性背景完整可用。
- 没有实现图标沿线移动、现代道路生成、路线插值/吸附、速度/兵力宽度/粒子、路线空间分析，也没有提前实现 MVP-08 详情/引用或后续阶段能力。

## 10. MVP-08 完成证据

### 实现范围

- `frontend/src/components/detail/`
  - `DetailPanel.vue` 按已解析对象执行 `Place > Event > Empty` 优先级；未知选择 ID 不制造伪详情。
  - `EventDetail.vue` 展示正式 `dateLabel`、时间精度、事件摘要、重要性、相关地点、参与者、结论观点类型、可信度与各 Claim 的逐条引用；`normalizedDate=null` 时不渲染标准化日期标签。
  - `PlaceDetail.vue` 展示历史名、非空现代对应、地点类型、地点说明、战略作用、坐标说明、结论观点类型、可信度和逐条引用；关闭按钮只清除地点选择。
  - `CitationList.vue` 展示资料标题、作者/版本或出版信息、章节/页码/稳定定位、资料观点、可信度和项目归纳；短原文使用独立文案与视觉容器，空字段不渲染无意义标签。
  - `ConfidenceBadge.vue` 对 `HIGH / MEDIUM / LOW / DISPUTED / UNKNOWN` 全部提供文字解释；`ViewpointBadge.vue` 明确区分“结论类型”和“资料观点”。
- `frontend/src/domain/mvpSelectors.ts` 与既有单一 `mvpStore`
  - 完成 `getSelectedEvent()`、`getSelectedPlace()` 和 `getCitationBundle()`；Citation 或 Source 缺失时抛出包含 ID 和字段路径的 `MvpDataError`。
  - 新增 `clearSelectedPlace()`；重复选择/关闭保持幂等，不改变当前事件、时间轴序号或图层状态。
- `AnshiMvpView.vue`
  - 在 Repository 加载和时间轴初始化后接入同一个详情面板；相关地点可进入地点详情，关闭后返回当前事件。
  - 没有增加第二个 store、路由、人物/战役独立详情页或 MVP-09 的事件定位、地图飞行、加载重试与页面重排。

### 自动验证

- 环境：Node.js `24.18.0`、npm `11.16.0`；`npm ci` 通过，未增加依赖，未修改 `package.json` 或 `package-lock.json`。
- `npm --prefix frontend run typecheck`：通过。
- `npm --prefix frontend run validate:data`：通过，0 个警告。
- `npm --prefix frontend run test`：14 个测试文件、94 个测试全部通过。
- `npm --prefix frontend run build` 与 `npm --prefix frontend run check`：通过；仅保留既有的 500 kB chunk 提示。
- 根路径 `verify:worker-bundle`：通过；worker 为自包含 `maplibre-gl-worker-*.js`。
- `--base=/history-map/` 构建输出到临时验收目录并通过对应 worker 校验；没有把额外构建产物留在工作树。

新增或扩充测试覆盖 Event/Place/Empty 优先级、关闭地点回到原事件、时间轴和路线开关保持、重复选择/关闭、未知 ID、相关地点/参与者、`normalizedDate=null`、空现代名/原文、多个 Citation、Citation/Source 缺失错误、Claim 与 Citation 观点类型同时展示、原文与项目归纳分离、DISPUTED/UNKNOWN 文字、`style.load` 后事件/地点状态保持，以及既有监听器和 MapLibre 清理回归。

### 浏览器现场验证

- 未配置 `VITE_MAP_STYLE_URL`：正式默认 Event 详情显示时间精度、两条 Claim、相关地点、参与者、逐条引用与 UNKNOWN 文字；页面不出现 `null` 或伪造标准日期。
- 第 2 个事件中直接点击地图上的非相关长安代表点后切换到 Place 详情，继续显示 `DISPUTED`、`UNKNOWN` 和“不是精确历史坐标”等明确文字；关闭后返回同一第 2 个 Event。地点打开期间关闭路线，返回 Event 后路线仍关闭，时间轴、相关地点状态不丢失。
- 显式有效 `/map/empty-style.json`：无降级提示，第 3 个事件详情和引用正常；故意损坏 `/map/missing-style.json`：HTTP 404 后自动恢复本地中性背景，第 4 个事件与 7 条引用继续可用。
- 1024×768 下地图为 934×544，页面无横向溢出；1440×900 下地图为 1238×544，时间轴无需横向滚动。两种尺寸均只有 1 个 MapLibre 地图和 1 个 Canvas。
- 根路径与 `/history-map/` 裸静态生产部署均取得入口、CSS、正式数据、MapLibre worker 和本地空白样式 HTTP 200；Event → Place → 关闭返回 Event 正常，最终 Claim/资料观点与实体级 h3 引用标题可见。
- 无外部配置、有效样式、损坏样式降级、根生产和非根生产的浏览器 console 均为 0 warning/error。

### 限时静态复核

ChatGPT Pro 在 3 分 26 秒的一次只读静态复核中未报告 P0 或 P1，提出 2 个 P2 和 1 个 P3：Claim 自身的 `viewpointType` 未展示；工作树中的非根构建输出未被忽略，可能误入提交；实体级 Citation 标题固定为 h4，形成 h2→h4 跳级。复核没有安装依赖、运行测试、修改文件或 lockfile，也没有直接判定 MVP-08 是否验收通过。

Codex 独立核实后全部采纳：新增明确区分“结论类型”和“资料观点”的展示及差异化测试；把非根构建产物移至临时验收目录；让实体级引用使用 h3、Claim 内引用继续使用 h4。修复后 94 个测试、完整 `check`、双 base 构建和双 worker 校验全部通过，根/非根生产浏览器复查保持单一 MapLibre/Canvas 且 console 0 warning/error。

### 范围与内容边界

- 没有修改 `frontend/public/data/anshi/mvp-v1.json`、资料笔记、内容审核表、历史事实、日期、坐标、路线几何、来源、许可记录或审核签字。
- 直接消费正式 5 个 Place、6 个 Event、19 个 Source、36 个 Citation 和关联 `SourcedClaim`；地点继续为 DISPUTED，事件时间继续为 APPROXIMATE 且 `normalizedDate=null`，路线继续为 `INFERENCE / LOW`。
- 没有展示完整书籍，没有生成 AI 总结/问答、用户笔记、评论或编辑入口；没有选择生产外部底图供应商或填写未经核对的 Style URL、Token、许可与署名结论。
- 没有实现 A-017 定位当前事件、地图自动飞行、MVP-09 页面布局/加载重试或其他后续阶段能力。

## 11. MVP-09 完成证据

### 实现范围

- `frontend/src/domain/mapFocus.ts`
  - 纯函数根据当前事件的相关地点和截至该事件已活动/可见的正式路线坐标计算定位目标；单点返回 point，多点返回 bounds，未知事件或无可用几何返回 `null`。
  - 路线图层开关只控制显示，不改变定位计算；不引入 Turf 或其他外部空间计算库。
- `HistoryMap.vue`
  - 暴露 `focusCurrentEvent()` 与 `focusPlace(placeId)`；事件范围使用 `fitBounds`，单地点使用 `easeTo`，重复主动定位与 `style.load` 后再次定位均可用。
  - 只有用户点击“定位当前事件”、相关地点或地点详情中的显式定位入口才移动地图；时间轴选择、前后切换和普通 store 状态变化不自动飞行。
- `AnshiMvpView.vue`、`LoadingState.vue` 与 `ErrorState.vue`
  - 使用既有 Repository 和唯一 `mvpStore`；`retryLoadDataset()` 统一处理首次加载和重试，用递增 attempt ID 与卸载标记丢弃过期异步结果。
  - 网络不可访问、非法 JSON 和 `MvpDataError` 均显示可读错误、稳定 code/path 和重试入口；重试期间按钮正确禁用，不产生未处理 Promise。
  - 相关地点选择与地点详情中的定位共享 `focusPlace()`；切换详情时侧栏回到顶部。
- `App.vue`、`styles/layout.css`、`responsive.css` 与相关样式
  - 桌面网格同时容纳地图、时间轴和可滚动详情侧栏；地图保持最小可操作高度，不被长详情无限压缩。
  - 1024 与 1440 宽度均无页面横向溢出；1440 下时间轴完整展开，较窄屏幕只做最小堆叠，不实现完整手机产品布局。
  - 增加跳至主要内容入口和统一 3px `:focus-visible`，所有交互按钮保留可读标签、可见焦点和原生禁用状态。

### 自动验证

- 环境：Node.js `24.18.0`、npm `11.16.0`；`npm --prefix frontend ci` 通过，未增加依赖，未修改 `package.json` 或 `package-lock.json`。
- `npm --prefix frontend run typecheck`：通过。
- `npm --prefix frontend run validate:data`：通过，0 个警告。
- `npm --prefix frontend run test`：17 个测试文件、110 个测试全部通过。
- `npm --prefix frontend run build`、`npm --prefix frontend run check`：通过；仅保留既有的 500 kB chunk 提示。
- 根路径 `verify:worker-bundle`：通过；worker 仍为自包含 `maplibre-gl-worker-*.js`。
- `--base=/history-map/` 构建输出到临时验收目录并通过对应 worker 校验；没有额外构建产物留在工作树。

新增或扩充测试覆盖事件相关地点加可见路线、只有地点、无定位几何、未知事件、隐藏路线仍参与范围、重复主动定位、单地点定位、`style.load` 后再次定位、时间轴切换不自动定位、按钮禁用、相关地点与详情地点定位、加载失败后成功重试、重试再次失败、组件卸载后迟到异步结果不写入、详情滚动复位、1024/宽屏布局契约、可见键盘焦点、监听器和 MapLibre 实例清理。

### 浏览器现场验证

- 未配置 `VITE_MAP_STYLE_URL`：实际拖动地图离开事件范围后点击“定位当前事件”回到范围；再次拖离后切换时间轴只更新到第 2/6 个事件，地图没有强制飞行。
- 相关地点“潼关”和地点详情中的“在地图上定位此地点”都能主动定位，地点详情保持 `place-tongguan` 且侧栏回到顶部；全程只有 1 个 MapLibre 地图和 1 个 Canvas。
- 显式有效 `/map/empty-style.json`：不显示降级警告，定位和详情正常；故意损坏 `/map/missing-style.json`：HTTP 404 后恢复本地中性背景，应用仍可定位且无错误态。
- 受控本地响应先返回非法 JSON：页面显示 `INVALID_JSON`、路径 `$` 和重试按钮；保持失败时再次重试仍留在可读错误态，切换为正式数据后重试成功进入第 1/6 个事件。两次失败只产生受控错误日志，没有 `Uncaught` 或未处理 Promise。
- 1024×768：页面无横向溢出，地图约 590×544，详情侧栏宽约 352px 并独立滚动；图例与 MapLibre 署名不重叠。1440×900：地图约 1006×544，详情侧栏约 352px，时间轴完全展开且页面无横向溢出。
- 根路径裸静态生产部署取得入口、CSS、根 `/data/anshi/mvp-v1.json`、worker 和本地空白样式；`/history-map/` 裸静态部署从子路径取得入口、CSS、worker、空白样式并按既有契约取得根 `/data/`。两者均显示第 1/6 个事件、单一 MapLibre/Canvas，console 0 warning/error。
- 页面刷新按 Repository 正式数据重新回到 `topic.defaultEventId`；本阶段没有引入 URL 或本地持久化。

### 限时静态复核

ChatGPT Pro 在 3 分 06 秒的一次只读静态复核中未发现 P0—P3。复核严格限定于 MVP-09 的定位计算与触发链、加载重试竞态/卸载保护、Loading/Error 可访问性、1024/宽屏布局、单 store、依赖与受保护内容边界；没有安装依赖、运行测试、修改文件或 lockfile，也没有直接判定 MVP-09 是否验收通过。

Codex 随后独立核对当前源码和工作树：事件/地点定位只从显式用户入口触发，时间轴没有地图移动 watcher；定位纯函数不读取路线图层显示开关；递增 attempt ID 与卸载标记会丢弃过期异步结果；工作树没有第二个 store、依赖/lockfile或正式数据/审核文件改动。最终工程判断仍只依据当前源码、本地门禁和真实浏览器证据。

### 范围与内容边界

- 没有修改 `frontend/public/data/anshi/mvp-v1.json`、资料笔记、内容审核表、历史事实、日期、坐标、路线几何、来源、许可记录或审核签字。
- 直接消费正式 5 个 Place、3 个 Geography、3 个 RouteSegment、6 个 Event、19 个 Source、36 个 Citation 和 33 条运行时 SourcedClaim；地点继续为 DISPUTED，事件时间继续为 APPROXIMATE 且 `normalizedDate=null`，路线继续为 `INFERENCE / LOW`。
- 没有新建第二个 store，没有增加依赖、后端、数据库、生产底图供应商或外部空间计算库。
- 没有实现完整手机布局、深链接、URL 状态同步、主题切换、国际化、登录、偏好持久化或复杂过场动画；没有提前整理 MVP-10 最终运行说明或执行 MVP-11 内容签字门禁。

## 12. 下一步边界

1. `MVP-08` 完成提交 `efd3d0b` 已推送；本任务开始时现场核对的 `HEAD`、本地 `origin/master` 和 GitHub 远端 `master` 一致，工作树干净。
2. `MVP-09` 实现、完整门禁和真实浏览器验证已完成；提交和推送仍须先向用户汇报真实 diff、测试、范围/内容门禁和静态复核结论，并取得明确确认。
3. 下一工程任务为 `MVP-10`；只能在后续独立任务整理最终运行说明、配置/降级/浏览器兼容与已知限制，不得借此扩张功能范围。
4. `MVP-11` 仍是独立内容签字门禁；后续工作必须继续保护正式数据、资料笔记与审核表，不得把 DISPUTED、APPROXIMATE 或 `INFERENCE / LOW` 内容升级为确定事实。
