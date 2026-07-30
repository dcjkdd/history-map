# 安史之乱 MVP 内容审核记录

- 状态：首批审核清单，尚未开始人工签字
- 建立日期：2026-07-29
- 资料笔记：`data/curated/anshi-mvp-source-notes.md`
- 当前批准记录数：0

## 审核状态

```text
PENDING_SOURCE   缺少明确资料或定位
PENDING_REVIEW   已有资料，等待内容负责人核对
APPROVED         已由人工核对并记录审核人/日期，可进入正式数据
CHANGES_REQUIRED 已核对但需要修改
REJECTED         不采用，保留原因
NOT_APPLICABLE   本项不适用
```

发布前，所有拟发布数据行必须清零 `PENDING_SOURCE`、`PENDING_REVIEW` 和 `CHANGES_REQUIRED`；状态说明、空白模板和已明确排除的 `REJECTED` 行不计入“清零”。`APPROVED` 行必须填写真实 reviewer 与 reviewDate，Codex 或自动脚本不得代签。

## 第一批审核表

| entityType | entityId | 工作标签 | factReviewed | coordinateReviewed | citationReviewed | sourceVersionReviewed | licenseReviewed | certaintyReviewed | reviewer | reviewDate | status | notes |
|---|---|---|---:|---:|---:|---:|---:|---:|---|---|---|---|
| Place | place-changan | 长安 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 不得直接使用现代市中心 |
| Place | place-luoyang | 洛阳 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 需区分历史城址与现代城市 |
| Place | place-shanzhou | 陕州 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 需核对唐代位置 |
| Place | place-lingbao | 灵宝 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 城邑、战场和空间范围不能默认同点 |
| Place | place-tongguan | 潼关 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 必须核对唐代关城与现代景区差异 |
| Event | event-01-defense-context | 潼关防线背景 | 否 | 不适用 | 否 | 否 | 不适用 | 否 | 待定 | 待定 | PENDING_SOURCE | 工作标签，非最终事件标题 |
| Event | event-02-yan-westward | 燕军西进背景 | 否 | 不适用 | 否 | 否 | 不适用 | 否 | 待定 | 待定 | PENDING_SOURCE | 工作标签，非最终事件标题 |
| Event | event-03-decision-to-advance | 唐军出关决策 | 否 | 不适用 | 否 | 否 | 不适用 | 否 | 待定 | 待定 | PENDING_SOURCE | 需并列不同记载和解释 |
| Event | event-04-lingbao-engagement | 灵宝方向交战 | 否 | 不适用 | 否 | 否 | 不适用 | 否 | 待定 | 待定 | PENDING_SOURCE | 不预设精确战场和兵力 |
| Event | event-05-tongguan-fall | 潼关失守 | 否 | 不适用 | 否 | 否 | 不适用 | 否 | 待定 | 待定 | PENDING_SOURCE | 需核对事件顺序 |
| Event | event-06-changan-consequence | 长安局势变化 | 否 | 不适用 | 否 | 否 | 不适用 | 否 | 待定 | 待定 | PENDING_SOURCE | 需明确叙事切片终点 |
| RoutePlan | route-yan-westward | 燕军向潼关方向推进 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 逻辑路线工作项；不能替代后续每个 RouteSegment 的审核行 |
| RoutePlan | route-tang-advance | 唐军出关行动 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 逻辑路线工作项；不能替代后续每个 RouteSegment 的审核行 |
| Geography | geography-yellow-river | 黄河 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 需记录数据版本、许可证、署名和处理过程 |
| Geography | geography-wei-river | 渭河 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 需记录数据版本、许可证、署名和处理过程 |
| Geography | geography-qinling | 秦岭 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 不凭视觉印象手画 |
| Geography | geography-guanzhong-corridor | 东入关中通道 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 必须说明是资料结论还是项目推断 |
| Source | SRC-PRIMARY-01 | 正史或编年史资料 1 | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_SOURCE | 需核对版本、稳定定位与使用边界 |
| Source | SRC-PRIMARY-02 | 正史或编年史资料 2 | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_SOURCE | 需核对版本、稳定定位与使用边界 |
| Source | SRC-MODERN-01 | 现代研究资料 | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_SOURCE | 需核对版本、稳定定位与引用边界 |
| Source | SRC-SPATIAL-01 | 空间数据 | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_SOURCE | 需核对数据版本、许可证链接、署名和处理许可 |

逐条结论（Claim）、Citation 和实际 RouteSegment 尚未生成，因此当前不创建虚假占位 ID。它们一旦进入候选数据，必须逐条追加审核行；实体级或 RoutePlan 级审核不能替代逐条结论、引用和路线分段审核。

## 首批签字

### 内容负责人

- 姓名：待定
- 日期：待定
- 结论：尚未签字（只有填写真实姓名、日期并明确写明“批准”后才生效）

### 产品负责人

- 姓名：待定
- 日期：待定
- 结论：尚未签字（只有填写真实姓名、日期并明确写明“批准”后才生效）
