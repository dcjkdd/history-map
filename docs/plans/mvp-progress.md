# 安史之乱二维交互地图：MVP 实施进度

- 状态：执行进度索引
- 更新日期：2026-07-31
- 当前 Git 基线：`3ccdecc88439c2f654174a7efaee6873542939c1`（已推送的 `MVP-03` 完成提交）
- 最近完成任务：`MVP-04`
- 下一工程任务：`MVP-05`

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
| `MVP-04` | `COMPLETED` | 本次提交 | MapLibre 地图壳、数据集初始视野、底图配置、本地降级、清理与浏览器验证已完成 |
| `MVP-05` | `READY_NEXT` | — | 下一步实现地理要素、地点图层、图层开关和图例 |
| `MVP-06`—`MVP-11` | `PENDING` | — | 按任务依赖顺序推进 |

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

## 7. 下一步边界

1. `MVP-03` 缩小版内容与工程门禁已完成，实施提交 `3ccdecc` 已推送。
2. `MVP-04` 实现与本地验证已完成；提交和推送仍须先经过用户确认。
3. 下一工程任务为 `MVP-05`，仅实现地理要素、地点图层、图层开关和图例。
4. `MVP-05` 必须继续使用当前正式数据与审核门禁，不得从范围外候选绕过人工审核，也不得把低可信度地点或路线表现为确定事实。
