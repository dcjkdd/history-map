# 安史之乱二维交互地图：MVP 实施进度

- 状态：执行进度索引
- 更新日期：2026-07-30
- 当前远端基线：`master@89473cd054f0fd8ff9c9709208e2d38ee9d2f9f4`
- 当前工作树任务：`MVP-02` 已实现，等待用户审阅和提交
- 下一工程任务：`MVP-04`（`MVP-03` 仍受内容门禁阻断）

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
| `MVP-02` | `IMPLEMENTED_PENDING_REVIEW` | 待提交 | 数据完整性校验命令、构建门禁和损坏数据失败测试已实现 |
| `MVP-03` | `BLOCKED_BY_CONTENT` | — | 等待人工提供并批准资料版本、页码或稳定定位、坐标/几何依据和许可证 |
| `MVP-04` | `READY_AFTER_MVP_02_REVIEW` | — | MVP-02 经用户审阅并形成提交后，可开发 MapLibre 地图壳 |
| `MVP-05`—`MVP-11` | `PENDING` | — | 按任务依赖顺序推进 |

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

## 4. MVP-02 当前工作树证据

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

MVP-02 当前仍在工作树中，尚未形成实施提交；必须经用户审阅后再提交。

## 5. 当前内容门禁

- `data/curated/anshi-mvp-source-notes.md` 当前批准记录数为 0。
- `docs/reviews/anshi-mvp-content-review.md` 尚未完成人工签字。
- 地点、事件槽位、RoutePlan、地理要素和 Source 仍为 `PENDING_SOURCE`。
- 当前 `mvp-v1.json` 只用于验证技术合同和加载边界。
- 不得把工作标签、猜测坐标、示例页码、未经说明的精确日期或项目推断转换成正式历史数据。

## 6. 下一步边界

1. 先由用户审阅 MVP-02 工作树；确认后再形成独立提交。
2. `MVP-03` 继续等待人工批准的资料、坐标/几何依据和许可证，不得录入或猜测正式历史内容。
3. MVP-02 经审阅后可进入 `MVP-04`，仅开发 MapLibre 地图容器、底图配置和本地降级方案。
4. MVP-05 仍必须等待通过校验的正式或审核中数据。
