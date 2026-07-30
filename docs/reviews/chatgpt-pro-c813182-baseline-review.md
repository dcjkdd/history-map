# c813182 前置基线：ChatGPT Pro 协作与 Codex 独立验收

- 验收日期：2026-07-30
- 审查基线：`c8131827804b023cf02d5ea759cf7b768d3c220e`
- 基线分支：`master`
- ChatGPT Pro 对话：<https://chatgpt.com/c/6a6a0268-1544-83ec-9e8b-6e63f43bf956>
- 最终裁决：ChatGPT Pro 仅作为外部审查输入；实际修正由 Codex 根据源码和本地验证独立确定

## 1. 交付给 ChatGPT Pro 的源码包

- 文件：`history-map-c8131827804b-pro-review.zip`
- 大小：`53,854 bytes`
- SHA-256：`c96e34dbb5880ecdba5aa1f96b5bb376b94b293d1a876392457824ff7a6ac36c`
- 内容：基线提交中与前置文档审查有关的 23 个文件
- 排除项：`.git`、`node_modules`、构建产物、覆盖率、缓存、数据库、运行/浏览器状态、`.env`、密钥、Cookie、私有资料目录和原始压缩包
- 检查：压缩包可解压；打包前与包内常见私钥、AWS、GitHub、OpenAI、Google、Slack 凭据模式扫描无命中

## 2. ChatGPT Pro 的有效发现

1. `MVP-PRE-00` 把 `frontend/`、`backend/`、`scripts/`、`deploy/` 空目录作为提交验收条件不可靠。Git 不保留空目录，远程检出无法复现该条件。
2. 资料模板需要支持逐条结论与引用绑定，不能只在实体级笼统挂来源。
3. 空间数据登记需要明确数据版本、来源、访问日期、许可证链接、署名要求及几何处理过程。
4. `APPROVED` 必须绑定真实人工审核人和日期；Codex 或自动脚本不得代签。
5. 当前审核表把两条逻辑路线误写为 `RouteSegment`，但正式路线尚未分段，应先记为 `RoutePlan`。

## 3. ChatGPT Pro 交付缺陷

ChatGPT Pro 声明补丁为：

- `38,657 bytes`
- SHA-256 `e2b780408d3480972e32fe899838d9e590dfbf265f05faa00716ad020a880c2c`
- 包含 README 和 `.gitignore` 修正

Codex 实际下载并复算的文件为：

- 文件：`history-map-c813182-minimal-review-fixes.patch`
- `40,050 bytes`
- SHA-256 `dba4627902e5aefd8611785ce7c1ed3dea11225e05cf0b0b416f76b5cbdba3f7`
- `git apply --stat`：6 个文件，164 行新增、97 行删除
- 实际不包含 README 或 `.gitignore`

因此该补丁不能按 ChatGPT Pro 原声明视为已验证产物。Codex 只把它当作审查建议来源，没有直接应用到工作区。

此外，ChatGPT Pro 在首次产出补丁后未正常结束，浏览器侧追问又触发了第二轮重复扫描。Codex 已停止重复运行，并要求只交付现有结果。发现交付哈希和文件列表不一致后，Codex 尝试发送纠错证据，但页面未形成可确认的纠正回复；该项按外部交付失败记录，不再继续消耗时间。

## 4. Codex 的采纳与拒绝

已采纳并重新实现：

- 修正空目录验收条件，不新增无意义 `.gitkeep`
- 将 npm 门禁限定到 `MVP-00` 创建 `frontend/package.json` 之后
- 统一任务冲突处理与 ADR-0001 的权威顺序
- 在资料模板加入稳定 `claimId`、逐条 Citation、Source 定位和空间许可字段
- 将逻辑路线审核项改为 `RoutePlan`
- 为 Source、逐条结论、Citation、Geography 和实际 RouteSegment 补全后续审核覆盖
- 收紧 `APPROVED` 的人工审核人、日期和签字边界
- 为常见覆盖率、缓存和日志产物补全 `.gitignore`

未采纳：

- 不在 CONTENT-00 阶段直接新增 `ClaimBinding` 运行时实体；具体 JSON 表达方式留给 `MVP-01` 数据契约确定
- 不在尚无正式数据时引入数据文件 SHA-256 签字流程；可在 `MVP-11` 发布门禁实现时再评估
- 不改写用户明确指定的唯一项目根路径
- 不创建前端源码、后端、数据库、Docker 或正式 `mvp-v1.json`

## 5. 独立验证

已通过：

- `git apply --check`：Pro 下载补丁可应用到 `c813182` 基线
- 隔离目录应用：使用 `git archive` 导出的基线副本成功应用 Pro 补丁，未直接污染工作区
- `git diff --check`
- Markdown 相对链接：22 个 Markdown 文件全部通过
- Markdown 表格列数检查
- `.nvmrc`：`nvm use` 得到 Node `v24.18.0`
- npm：`11.16.0`
- 发布门禁静态检查：当前批准记录数仍为 0；未发现已批准或待修改的数据行；不存在 `mvp-v1.json`
- 当前跟踪文件常见私钥与 Token 模式扫描无命中

不适用：

- lint、typecheck、单元测试、合同测试、生产构建和 E2E：当前基线没有 `package.json` 或应用源码，这些门禁从 `MVP-00` 起执行

## 6. 剩余风险

1. 第一批史料版本、页码、坐标、路线、空间数据许可证仍全部待人工核对，不能称为已验证历史内容。
2. `MVP-01` 必须选择逐条结论到 Citation 的运行时 JSON 表达方式，并保持本文档门禁；当前只定义内容输入与验收要求。
3. 外部底图服务的真实许可、配额和署名尚未选择或验证。
4. 本次修正目前只在本地工作区，未提交、未推送、未创建 PR、未部署。
