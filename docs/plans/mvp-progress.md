# 安史之乱二维交互地图：MVP 实施进度

- 状态：执行进度索引
- 更新日期：2026-07-30
- 当前远端基线：`master@0394d7e56d99897c58c27763280ac2d1361f9ea0`
- 下一工程任务：`MVP-02`

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
| `MVP-02` | `READY_NEXT` | — | 下一步建立数据完整性校验命令和构建门禁 |
| `MVP-03` | `BLOCKED_BY_CONTENT` | — | 等待人工提供并批准资料版本、页码或稳定定位、坐标/几何依据和许可证 |
| `MVP-04` | `PENDING` | — | 完成 MVP-02 后可与 MVP-03 并行开发 MapLibre 地图壳 |
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

## 4. 当前内容门禁

- `data/curated/anshi-mvp-source-notes.md` 当前批准记录数为 0。
- `docs/reviews/anshi-mvp-content-review.md` 尚未完成人工签字。
- 地点、事件槽位、RoutePlan、地理要素和 Source 仍为 `PENDING_SOURCE`。
- 当前 `mvp-v1.json` 只用于验证技术合同和加载边界。
- 不得把工作标签、猜测坐标、示例页码、未经说明的精确日期或项目推断转换成正式历史数据。

## 5. MVP-02 进入条件与目标

进入 MVP-02 前必须：

1. 从远端 `master` 最新提交开始。
2. 执行 `nvm use`，确认 Node.js 为 `24.18.0`。
3. 在 `frontend/` 执行 `npm ci` 和 `npm run check`，确认 MVP-01 门禁仍通过。
4. 保持技术空数据集和内容审核边界，不录入正式历史内容。

MVP-02 只实现：

- 重复 ID、悬空引用和非法枚举检查。
- WGS84 经纬度范围检查。
- Event `sequence` 和 RouteSegment `segmentNo` 连续性检查。
- `appearAtEventId`、默认事件、Claim/Citation/Source 引用完整性检查。
- LOW、DISPUTED、UNKNOWN 地点的坐标说明要求。
- `npm run validate:data`，并接入 `build` 与 `check`。
- 故意损坏的数据集和门禁失败测试。

MVP-02 不校验历史事实本身，不联网补全资料，不自动修复数据，也不引入后端、数据库或新的通用框架。
