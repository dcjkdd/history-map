# 安史之乱 MVP 内容审核记录

- 状态：缩小版正式集合已完成行级人工审核和 MVP-11 自动映射审计；产品负责人于 2026-08-02 明确当前二维原型不满足地形解释目标，最终三方产品签字暂停，任何角色均不得代签或把既有工程通过改写为产品通过
- 建立日期：2026-07-29
- 资料笔记：`data/curated/anshi-mvp-source-notes.md`
- 当前已批准 Source/Citation/Claim 记录数：90（19 个 Source、36 个 Citation、35 个 Claim）
- 当前待审核候选：2 个 Source、6 个 Citation、1 个 Claim；另有 4 个仅完成书目登记的 Source 为 `PENDING_SOURCE`、2 个不纳入缩小版的 Claim 为 `REJECTED`

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
| Place | place-changan | 长安 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 地点摘要、战略作用和 OSM 丹凤门现代展示建筑质心均已批准；必须保持 `DISPUTED`，不得使用现代市中心或明城墙范围，也不得称为 755—756 年城中心、完整城界、历史城门原状或事件点 |
| Place | place-luoyang | 洛阳 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 地点摘要、战略作用和 OSM 应天门现代展示建筑质心均已批准；必须保持 `DISPUTED`，不得使用现代市中心，也不得称为 755—756 年城中心、完整城界或历史城门原状 |
| Place | place-shanzhou | 陕州 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 地点摘要、战略作用和 OSM 宝轮寺塔现代故城内部地标代表点均已批准；必须保持 `DISPUTED`，不得使用现代陕州区政府驻地，也不得称为 755—756 年城中心或城界 |
| Place | place-lingbao | 灵宝 | 是 | 是 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 限定摘要、战略作用、现代“稠桑原” OGC:CRS84 候选、技术核验和直接 Source/Citation 均已批准；必须保持 `DISPUTED`，不得替代唐代灵宝西原、战场中心、范围或路线 |
| Place | place-tongguan | 潼关 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 坐标、摘要和限定战略作用均已批准；现代旧城遗址代表点必须保持 `DISPUTED`，不确认 755—756 年唐城中心、关防范围或现代景区对应 |
| Event | event-01-defense-context | 燕军受阻于潼关 | 是 | 不适用 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 完整 Event 字段、两条 Claim 和现代研究/固定修订一手转录交叉核对链已批准；时间保持 `APPROXIMATE`，不采用精确公历日期、兵力、伤亡、坐标、防线范围或路线几何 |
| Event | event-02-yan-westward | 燕军推进至潼关前 | 是 | 不适用 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 完整字段、两条 Claim 和现代研究/固定修订一手转录证据链已批准；时间保持 `APPROXIMATE`，不生成路线几何、坐标或精确日期 |
| Event | event-03-decision-to-advance | 唐廷催令唐军出关 | 是 | 不适用 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 完整 Event 字段、两条限定 Claim、固定修订所载“报告—异议—催令—出关”顺序及 EPUB 的离关/叙事衔接用途已批准；不批准报告敌情真伪、精确传统纪日、兵力、粮运/军政单一因果、责任判断或路线几何 |
| Event | event-04-lingbao-engagement | 唐燕军战于灵宝西原 | 是 | 不适用 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 完整 Event 字段、两条限定 Claim、“灵宝西原相遇—南山北河狭道—交战—唐军溃败”及后续叙事衔接已批准；不批准精确战场点/范围、秦函谷关景区对应、传统纪日、兵力、伤亡、路线、战术重建或唯一败因 |
| Event | event-05-tongguan-fall | 燕军攻克潼关 | 是 | 不适用 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 完整 Event 字段、两条限定 Claim、“收集散卒—主帅被控制带走—燕军攻克潼关”顺序及战略衔接已批准；不批准精确关城/关防范围、传统纪日、兵力、伤亡、反事实、间隔、路线、直接引语或唯一失守原因 |
| Event | event-06-changan-consequence | 玄宗离开后燕军占领长安 | 是 | 不适用 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 完整 Event 字段、两条 Claim 及“玄宗离开长安—燕军先留兵潼关—随后另遣军进入长安”证据链已批准；两个节点作为近似阶段而非同一天，不采用精确纪日/间隔、兵力、路线、地点、占领后细节或唯一因果 |
| RoutePlan | route-yan-westward | 燕军向潼关方向推进（示意） | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准“洛阳—陕州—潼关”逻辑顺序、两个 `INFERENCE / LOW` 直连分段、直连处理方法和 `event-02-yan-westward` 首次出现；灵宝明确排除。RoutePlan 签字不替代下面两个 RouteSegment 的逐段签字 |
| RoutePlan | route-tang-advance | 唐军出关行动（示意） | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准“潼关→灵宝”逻辑顺序、一个 `INFERENCE / LOW` 直连分段、直连处理方法和 `event-03-decision-to-advance` 首次出现；陕州、洛阳和撤退线明确排除。RoutePlan 签字不替代下面 RouteSegment 的逐段签字 |
| RouteSegment | route-yan-westward-01 | 洛阳至陕州示意方向 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准两个已批准现代代表点直接连线；`side=YAN`、`actionType=ADVANCE`、`appearAtEventId=event-02-yan-westward`、`certainty=LOW`。不插值、不路由，不代表唐代道路、城市中心、渡口、里程或速度 |
| RouteSegment | route-yan-westward-02 | 陕州至潼关示意方向 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准两个已批准现代代表点直接连线；`side=YAN`、`actionType=ADVANCE`、`appearAtEventId=event-02-yan-westward`、`certainty=LOW`。不插值、不路由，不代表唐代道路、关城、攻关位置、里程或速度 |
| RouteSegment | route-tang-advance-01 | 潼关至灵宝示意方向 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准两个已批准但 `DISPUTED` 的现代代表点直接连线；`side=TANG`、`actionType=ADVANCE`、`appearAtEventId=event-03-decision-to-advance`、`certainty=LOW`。不插值、不路由，不代表唐代关城、战场、道路、部署、行军轨迹、撤退线、里程或速度 |
| Geography | geography-yellow-river | 黄河 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 已批准 Natural Earth v5.0.0 几何和保守展示摘要；只作现代概览，不主张完整覆盖同名河流或代表唐代河道 |
| Geography | geography-wei-river | 渭河 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 已批准 Natural Earth v5.0.0 几何和保守展示摘要；只作现代概览，不主张完整覆盖同名河流或代表唐代河道 |
| Geography | geography-qinling | 秦岭 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 已批准 Natural Earth v5.0.0 广义区域和保守展示摘要；不得作为精确山界或唐代历史边界 |
| Geography | geography-guanzhong-corridor | 东入关中通道（后续候选） | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_SOURCE | 用户已确认不纳入缩小版 MVP；不发布独立几何，不计入本版数量或批准门禁 |
| Source | SRC-PRIMARY-01 | 《资治通鉴》卷二百一十八（维基文库固定修订） | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准 `oldid=1996147` 及转录许可边界，仅作少量归纳和交叉核对；不采用兵力、伤亡、精确传统纪日、长段原文或未经权威整理本对校的精确引语 |
| Source | SRC-PRIMARY-02 | 《旧唐书》卷一百四（维基文库固定修订） | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_REVIEW | 已登记 `oldid=2020474`；页面转录质量标记仅 25%，必须对校权威整理本 |
| Source | SRC-PRIMARY-03 | 《资治通鉴（四库全书本）》卷二百一十七（维基文库固定修订） | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准 `oldid=783496`、pageid、修订时间、转录许可和宏观节点有限使用边界；普通转录 `oldid=617834` 因“炅昌”“至峽”等明显错字明确排除 |
| Source | SRC-MODERN-01 | 《安史之乱：历史、宣传与神话》EPUB | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准固定哈希 EPUB 仅用于内部核对和少量归纳；保留版权页 2025/CIP 2024 差异，不公开转用长段正文或书内图片，其他 Citation 仍须逐条审核 |
| Source | SRC-MODERN-02 | 蒲立本《安禄山叛乱的背景》 | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_SOURCE | 书目候选：丁俊译，中西书局 2018，ISBN `9787547514016`；尚缺实际书籍/文件与页码 |
| Source | SRC-MODERN-03 | 藤善真澄《安禄山：皇帝宝座的觊觎者》 | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_SOURCE | 书目候选：张恒怡译，中西书局，ISBN `9787547511787`；出版月记录有差异，待版权页核对 |
| Source | SRC-MODERN-04 | 张明扬《弃长安》 | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_SOURCE | 书目候选：天地出版社，ISBN `9787545566062`；2021-12/2022-01 记录有差异，待版权页核对 |
| Source | SRC-MODERN-05 | 李碧妍《危机与重构》 | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_SOURCE | 书目候选：北京师范大学出版社 2015，ISBN `9787303183876`；不同印次页数有差异 |
| Source | SRC-HERITAGE-01 | 第七批全国重点文物保护单位名单 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 已批准古遗址第 453 项、编号 `7-0453-1-453`、名称、时代范围和行政位置的引用边界；名单不提供唐代点位 |
| Source | SRC-HERITAGE-02 | 陕西省文物志转载〈潼关故城〉 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 已批准作为冲突说明来源；“于现址”说法必须与县志和新华社的不同表述并列，不复制图片或大段正文 |
| Source | SRC-HISTGEO-01 | 新华社潼关城址报道 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准作为城址争议的现代核对来源；新闻不能替代考古报告或历史地理专论，不复制图片或大段正文 |
| Source | SRC-LOCALHIST-01 | 1992 年《潼关县志》 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 已批准登记版本和内部引用边界；只使用渲染核对后的印刷页码，不复制附图或大段正文 |
| Source | SRC-SPATIAL-01 | Natural Earth v5.0.0 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 已批准固定标签、两个输入 SHA-256、Public Domain 许可、署名建议和无裁剪/简化处理过程 |
| Source | SRC-SPATIAL-02 | OpenStreetMap way 1195138308 v3 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 已批准固定版本、处理记录、ODbL 1.0 和署名边界；只表示现代 ruins 范围 |
| Source | SRC-SPATIAL-03 | 灵宝市政府公示环境影响报告 | 不适用 | 不适用 | 不适用 | 是 | 不适用 | 不适用 | banq | 2026-07-31 | APPROVED | 批准 PDF 哈希、表 2.6-1、三个厂址坐标及只登记必要事实的边界；不复制原表或附图，不用于历史战场点、范围或路线 |
| Source | SRC-HISTGEO-02 | CHGIS `hvd_83048`“陕县” | 不适用 | 不适用 | 不适用 | 否 | 否 | 不适用 | 待定 | 待定 | PENDING_REVIEW | 已核对 742—757 年陕郡治所与陕县老城对应；CC BY-NC 坐标不得打包，州级 `hvd_115770` 点位明确排除 |
| Source | SRC-HERITAGE-03 | 河南档案信息网宝轮寺塔网页 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准用于宝轮寺塔位于陕州故城东南部及现存塔年代边界；不复制图片或正文 |
| Source | SRC-HERITAGE-04 | 三门峡日报陕州故城文保报道 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准少量归纳；版权页禁止未经授权转载，只用于故城延续和唐宋城址基础，不用现存规模反推唐代城界 |
| Source | SRC-SPATIAL-04 | OSM node 12768197183 v1 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 固定节点、哈希、ODbL、署名和无变换处理过程已批准；只表示现代宝轮寺塔点位 |
| Source | SRC-HERITAGE-05 | 国家发展改革委隋唐洛阳城网页 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准用于城址约 47 平方公里、主要分布区域、城址组成与应天门为宫城正南门的少量归纳；不得直接生成城界 |
| Source | SRC-SPATIAL-05 | OSM way 865951589 v4 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 固定 way/full XML 哈希、节点版本、ODbL、署名和质心处理已批准；只表示现代应天门展示建筑范围 |
| Source | SRC-HERITAGE-06 | 西安市地方志办公室唐长安城遗址网页 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准用于隋大兴城与唐长安城关系、现代对应范围、主要遗址及多数遗迹叠压在现代城市下的限定归纳；不得直接生成城界 |
| Source | SRC-HERITAGE-07 | 陕西省文物局大明宫遗址网页 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准用于大明宫属于唐长安城宫殿体系、权力中心作用及丹凤门遗址展示设施的限定归纳；不复制图片或当作唐代原状 |
| Source | SRC-SPATIAL-06 | OSM way 280412702 v4 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 固定 way/full XML 哈希、节点版本、ODbL、署名和质心处理已批准；只表示现代丹凤门建筑范围 |
| Source | SRC-SPATIAL-07 | Esri World Imagery 灵宝技术核验范围 | 不适用 | 不适用 | 不适用 | 是 | 是 | 不适用 | banq | 2026-07-31 | APPROVED | 批准 item、服务版本、Vantor Vivid 影像块信息和仅作内部 CRS 核验的边界；影像不进入仓库，不描绘或复用建筑、道路、村界、填埋场边界或派生几何 |
| Citation | CIT-ANSHI25-CH04-P018 | 第四章 P018 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于渡河、陈留、洛阳宏观节点及原脚注 `#fo11`；不支持路线几何、速度、距离或精确日期 |
| Citation | CIT-ANSHI25-CH04-P032-P037 | 第四章 P032–P037 | 不适用 | 不适用 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_REVIEW | 核对河南防御与等待西北精锐的材料 |
| Citation | CIT-ANSHI25-CH05-P006-P014 | 第五章 P006–P014 | 不适用 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只用于获批的洛阳地点摘要和战略作用归纳；不批准兵力、精确日期或作者的个体责任判断 |
| Citation | CIT-ANSHI25-CH05-P018-P023 | 第五章 P018–P023 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于潼关战略作用、`event-01-defense-context`，以及 `event-02-yan-westward` 的陕郡退守潼关、燕军继续施压；不支持路线几何、关城坐标、兵力或精确日期 |
| Citation | CIT-ANSHI25-CH08-P001-P003 | 第八章 P001–P003 | 不适用 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于潼关战略作用，以及 `event-01-defense-context` 的标题、相对时间、摘要和叙事作用；不扩展为精确防线、精确日期或唯一史实 |
| Citation | CIT-ANSHI25-CH08-P025-P033 | 第八章 P025–P033 | 不适用 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只用于获批的陕州、洛阳与长安战略作用归纳；不生成港口、仓址、航道或路线 |
| Citation | CIT-ANSHI25-CH08-P034-P040 | 第八章 P034–P040 | 不适用 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只批准用于长安粮运依赖的限定战略作用归纳；不批准替代运输线、军政控制风险或出关决策的完整因果解释 |
| Citation | CIT-ANSHI25-CH09-P001-P003 | 第九章 P001–P003 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只批准采用 P001 核对唐军最终离开潼关及后续灵宝方向交战的叙事衔接；不采用传统纪日转换、P002–P003 的粮运/军政因果或责任判断 |
| Citation | CIT-ANSHI25-CH09-P015-P020 | 第九章 P015–P020 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于灵宝地点摘要及本 Event 的相对地形文字背景；不批准战场坐标、范围、秦函谷关景区对应、传统纪日、道路宽度、兵力或书内示意图复用 |
| Citation | CIT-ANSHI25-CH09-P025-P026 | 第九章 P025–P026 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只批准核对唐燕交战开始；不采用传统纪日、秦函谷关旧址对应、道路、兵力、先锋构成或进军目的 |
| Citation | CIT-ANSHI25-CH09-P027-P042 | 第九章 P027–P042 | 不适用 | 不适用 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_REVIEW | 核对部署、地形影响、溃败和救援的作者重建 |
| Citation | CIT-ANSHI25-CH10-P001-P004 | 第十章 P001–P004 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准“潼关失守改变长安方向防务条件”归纳及本 Event 中 `body-p002` 的收集散卒、主帅被控制带走和燕军占领顺序；不批准其余段落、兵力、伤亡、守关可能性、人物评价或扩展因果链 |
| Citation | CIT-ANSHI25-CH10-P005-P008 | 第十章 P005–P008 | 不适用 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于“潼关失守后长安出现恐慌、皇帝离城”的长安战略作用归纳，并用于本 Event 核对玄宗离城顺序；不采用精确日期、出城地点、路线、动机或责任判断 |
| Citation | CIT-ANSHI25-CH10-P036-P038 | 第十章 P036–P038 | 不适用 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于“燕军随后占领长安”的长安战略作用归纳，并用于本 Event 核对燕军得知消息后再进入长安；不采用精确间隔、部队路线、兵力、入城地点、事件点或 P038 的占领后细节 |
| Citation | CIT-ZZTJ217-R783496-P01 | 《资治通鉴（四库全书本）》灵昌渡河至洛阳段 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准核对灵昌渡河、陈留、洛阳宏观节点；不采用兵力、伤亡、精确传统纪日、路线几何或长段原文 |
| Citation | CIT-ZZTJ217-R783496-P02 | 《资治通鉴（四库全书本）》陕郡至潼关段 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准核对唐军由陕郡退守潼关、燕军受阻并驻军陕郡；不采用伤亡、精确传统纪日、具体路线或行动动机 |
| Citation | CIT-ZZTJ218-R1996147-P00 | 《资治通鉴》潼关受阻与北向压力段 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准只用于交叉核对河北方向压力、燕军北向联络受阻和数月未进潼关；不采用兵力、伤亡、精确传统纪日或引语措辞 |
| Citation | CIT-ZZTJ218-R1996147-P01 | 《资治通鉴》固守与出关段 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于固守意见、`event-01-defense-context` 的叙事衔接及 `event-03-decision-to-advance` 的“报告—异议—催令—出关”顺序；不把报告敌情视为已证事实，不采用兵力、精确传统纪日、具体动机、责任判断或长段原文 |
| Citation | CIT-ZZTJ218-R1996147-P02 | 《资治通鉴》灵宝交战段 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准灵宝西原交战及后续潼关失守顺序，并把收集散卒、主帅被控制带走及攻克潼关登记为独立 Event；不采用传统纪日、兵力、伤亡、战术、路线、直接引语、精确坐标或长段原文 |
| Citation | CIT-ZZTJ218-R1996147-P03 | 《资治通鉴》长安后续段 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准只核对玄宗离开、燕军先留兵潼关并随后另遣军进入长安的顺序；不采用精确传统纪日/间隔、兵力、路线、地点、占领后部署、直接引语或长段原文 |
| Citation | CIT-JTS104-R2020474-GSH01 | 《旧唐书》哥舒翰固守与出关段 | 不适用 | 不适用 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_REVIEW | 页面转录质量仅 25%；对校权威整理本后核对固守意见与出关记载 |
| Citation | CIT-JTS104-R2020474-GSH02 | 《旧唐书》哥舒翰灵宝交战段 | 不适用 | 不适用 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_REVIEW | 对校传统纪年、南北地形和溃败叙述；不直接换算公历或采信兵力 |
| Citation | CIT-NE50-RIVERS-MVP | Natural Earth 黄河/渭河要素 | 不适用 | 是 | 不适用 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 已批准 v5.0.0 要素选择和现代概览适用边界；不表示唐代河道，也不支持历史路线 |
| Citation | CIT-NE50-QINLING-MVP | Natural Earth 秦岭要素 | 不适用 | 是 | 不适用 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 已批准源要素 ID 和广义区域适用边界；不得作为精确山界或历史战场范围 |
| Citation | CIT-GOV-NCH7-0453 | 全国重点文保名单第 453 项 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 已批准“潼关故城”、唐至明、潼关县的名单定位；不得据此审核唐代坐标或边界 |
| Citation | CIT-SXWWZ-TONGGUAN | 陕西省文物志转载〈潼关故城〉 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 已批准唐至明、秦东镇南街村、现存明代遗存和“于现址”表述作为冲突链的一方，不单独生成坐标 |
| Citation | CIT-XINHUA-TONGGUAN-SITES | 新华社“潼关城”小节 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于说明麟趾塬汉唐故城与后世迁移说法，作为代表点不确定性的反方证据 |
| Citation | CIT-TGXZ1992-P418-P420 | 《潼关县志》第 418—420 页 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 已批准迁关叙述、后世旧城说明和“示意图无坐标”这一使用边界；不得描线或反推唐城边界 |
| Citation | CIT-TGXZ1992-P558 | 《潼关县志》第 558 页 | 不适用 | 不适用 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_REVIEW | 只作守关、出关、战败和失守的地方叙事交叉核对；日期、兵力和战术细节须对校 |
| Citation | CIT-TGXZ1992-P632-P633 | 《潼关县志》第 632—633 页 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于说明黄渭交汇处南岸旧城与 691 年建关的县志说法；必须与麟趾塬说法并列展示 |
| Citation | CIT-OSM-W1195138308-V3 | OSM way 1195138308 v3 | 不适用 | 是 | 不适用 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准质心 `[110.2909781, 34.6035548]` 作为现代 ruins 范围代表点；不得审核为已确认唐城 |
| Citation | CIT-LB-EIA-P25-CHOUSANGYUAN | 环评报告表 2.6-1“稠桑原”行 | 是 | 是 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 批准原值 `[110.872607, 34.615468]` 为现代同名居民点候选的报告依据；附图只确认现代标签，不确认历史战场 |
| Citation | CIT-ESRI-WORLD-IMAGERY-LINGBAO-20260731 | World Imagery 灵宝技术核验范围 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准只用于原值/GCJ-02 转换值技术比较；不批准影像复制、描图、历史地点、村界、建筑、填埋场边界、战场范围或路线 |
| Citation | CIT-CHGIS-HVD83048-SHANXIAN | CHGIS `hvd_83048` 陕县记录 | 否 | 否 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_REVIEW | 核对 742—757 年陕郡治所和陕县老城对应；不审核或复用 CHGIS 坐标，州级点不作为治所证据 |
| Citation | CIT-HADA-BAOLUN-20210824 | 河南档案信息网宝轮寺塔首段 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于宝轮寺塔位于陕州故城东南部及金代重建边界；不支持唐代城中心或城界 |
| Citation | CIT-SMXRB-SHANZHOU-20260114 | 三门峡日报故城文保报道第 1—3 段 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准用于历代治所延续与唐宋城址基础；现存城墙规模不等于唐代城界 |
| Citation | CIT-OSM-N12768197183-V1 | OSM node 12768197183 v1 | 不适用 | 是 | 不适用 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 接受 `[111.1488645, 34.7915940]` 为 `DISPUTED` 现代故城内部地标代表点；不确认唐代治所中心 |
| Citation | CIT-NDRC-SUITANG-LUOYANG-20201021 | 国家发展改革委隋唐洛阳城正文与应天门小节 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准历史城址与现代城区关系、城址组成及应天门身份的限定归纳；不把约 47 平方公里概述当作正式 Polygon |
| Citation | CIT-OSM-W865951589-V4 | OSM way 865951589 v4 | 不适用 | 是 | 不适用 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 接受质心 `[112.4545867, 34.6769987]` 为 `DISPUTED` 的现代展示地标代表点；不确认历史城市中心、城界或门址原状 |
| Citation | CIT-XADFZ-TANG-CHANGAN-20250827 | 西安市地方志办公室唐长安城遗址正文 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准历史城址与现代西安区别、遗迹叠压关系及大明宫/丹凤门属于遗址清单的限定归纳；不据文字生成 Polygon |
| Citation | CIT-SXWWJ-DAMING-PALACE-20121130 | 陕西省文物局大明宫正文与丹凤门图片说明 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准大明宫宫殿与权力中心身份，以及丹凤门遗址和展示设施区别的限定归纳；不确认城市中心或唐代原状 |
| Citation | CIT-OSM-W280412702-V4 | OSM way 280412702 v4 | 不适用 | 是 | 不适用 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 接受质心 `[108.9594728, 34.2828248]` 为 `DISPUTED` 的现代大明宫遗址展示地标代表点；不确认长安城中心、城界或门址原状 |
| Claim | claim-event-01-summary-modern-01 | 潼关防线背景摘要 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准现代研究与《资治通鉴》固定修订共同支持的态势与固守意见归纳；不采用精确纪日、兵力、伤亡、引语措辞或唯一史实表述 |
| Claim | claim-event-01-why-modern-01 | 潼关防线作用 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准阻断作用和后续“固守还是出关”的叙事衔接；不审核关城坐标、防线范围、路线几何或出关责任 |
| Claim | claim-event-02-summary-modern-01 | 渡河—陈留—洛阳—陕郡—潼关宏观节点顺序 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准只表达宏观节点，不沿现代道路绘制，不采用速度、距离、坐标或标准化日期 |
| Claim | claim-event-02-why-modern-01 | 正面防御节点收缩至潼关的叙事衔接 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准只作下一阶段固守或出关的背景；不采用地形/后勤单一因果，不生成路线几何或责任判断 |
| Claim | claim-event-03-summary-modern-01 | 报告—异议—催令—出关顺序 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只批准转述《资治通鉴》固定修订所载顺序；报告中的敌情不视为已证事实，不采用兵力、精确传统纪日、直接引语、粮运/军政单一因果或责任判断 |
| Claim | claim-event-03-why-modern-01 | 从固守转入出关行动的叙事衔接 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只批准连接潼关固守与后续灵宝方向交战；不生成 RouteSegment、精确路径、坐标、战场范围或唯一动因 |
| Claim | claim-event-04-summary-modern-01 | 灵宝西原交战与唐军溃败 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只批准归纳地点名称、南山北河相对地形、交战与溃败；现代“稠桑原”只作 `DISPUTED` 叙事锚点，不批准精确战场、传统纪日、兵力、伤亡、路线、战术重建或责任判断 |
| Claim | claim-event-04-why-modern-01 | 出关推进结束并衔接潼关失守 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只批准事件顺序，不把潼关失守并入本 Event，不生成路线/战场几何，也不解释唯一败因 |
| Claim | claim-event-05-summary-modern-01 | 收集散卒—主帅被控制—潼关失守顺序 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只批准一手固定修订与 EPUB `body-p002` 共同支持的顺序；不批准精确关城、传统纪日、兵力、伤亡、反事实、间隔、路线、直接引语或唯一因果 |
| Claim | claim-event-05-why-modern-01 | 关键防御节点失去控制并衔接长安局势 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 只批准战略作用与事件衔接；不把灵宝战败并入本 Event，不生成关防/路线几何或失守原因判断 |
| Claim | claim-event-06-summary-modern-01 | 玄宗离开—燕军留关—随后占领长安顺序 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准只归纳两个先后节点，不写成同一天；不采用精确纪日/间隔、兵力、离城或入城路线/地点、动机、占领后部署或直接引语，现代丹凤门点不是事件点 |
| Claim | claim-event-06-why-modern-01 | 长安失去唐廷控制并作为叙事终点 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准只说明控制变化和产品叙事终点；不解释唯一因果，不生成 RouteSegment、路线、城界、坐标或战场范围 |
| Claim | claim-place-tongguan-strategic-role-modern-01 | 潼关战略作用 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准限定表述：“潼关在本叙事中是陕郡以西、进入关中的关键防御节点；其失守改变了长安方向的防务条件。”不支持关城坐标、范围或现代景区对应 |
| Claim | claim-place-tongguan-site-dispute-modern-01 | 潼关古址不确定性说明 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准为缩小版 `Place.summary`；只能说明现有资料冲突，不能把现代代表点认定为 755—756 年唐城中心 |
| Claim | claim-place-tongguan-coordinate-candidate-01 | 潼关现代旧城遗址代表点 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 接受 OSM ruins 范围质心作为 `DISPUTED` 代表点；必须保留县志与新华社的城址冲突说明，不得称为唐城中心 |
| Claim | claim-place-lingbao-scope-modern-01 | 灵宝战场区域 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准“灵宝西原及南山—黄河间狭窄通道”的限定相对描述；坐标、范围、秦函谷关景区和现代灵宝市中心对应均保持空白 |
| Claim | claim-place-lingbao-strategic-role-modern-01 | 灵宝在本叙事中的节点作用 | 是 | 不适用 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 批准：“灵宝西原方向在本叙事中是唐军出关后与燕军交战、并由推进转入溃败的关键节点。”只说明叙事作用，不确认精确战场、坐标、边界、路线、部署、兵力、败因或责任 |
| Claim | claim-place-lingbao-coordinate-candidate-01 | 现代“稠桑原”居民点 OGC:CRS84 候选 | 是 | 是 | 是 | 是 | 不适用 | 是 | banq | 2026-07-31 | APPROVED | 批准原值 `[110.872607, 34.615468]`、成组技术核验和使用边界；必须保持 `DISPUTED`，不得称为唐代灵宝西原、秦函谷关旧址或 756 年战场中心 |
| Claim | claim-place-shanzhou-strategic-role-modern-01 | 陕郡战略作用 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准限定的军事推进和转运作用；不生成港口、仓址、航道或路线 |
| Claim | claim-place-shanzhou-scope-modern-01 | 陕州/陕郡现代对应限定摘要 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 接受“陕州故城一带、非现代陕州区政府驻地”的限定表述；不确认唐代城中心或城界 |
| Claim | claim-place-shanzhou-coordinate-candidate-01 | 宝轮寺塔现代故城内部地标代表点 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 接受 OSM 固定节点为 `DISPUTED` 代表点；不得称为 755—756 年陕郡治所中心或事件地点 |
| Claim | claim-place-luoyang-strategic-role-modern-01 | 洛阳战略作用 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准限定的城防、仓储和漕运作用；不批准兵力、精确仓址、运输路线或作者对失守责任的判断 |
| Claim | claim-place-luoyang-scope-modern-01 | 洛阳历史城址与现代城市关系 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准“洛水贯穿、主要分布于今洛阳四区、非单一现代市中心”的限定摘要；不恢复 755—756 年完整城界 |
| Claim | claim-place-luoyang-coordinate-candidate-01 | 应天门现代展示建筑代表点 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 接受 OSM way v4 质心为 `DISPUTED` 代表点；不等同历史城市中心、完整城界、历史门址原状或事件点 |
| Claim | claim-place-changan-strategic-role-modern-01 | 长安战略作用 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 批准限定的首都粮运依赖及潼关失守后局势变化归纳；不批准精确日期、路线、出城或入城地点，也不支持唐长安城坐标或范围 |
| Claim | claim-place-changan-scope-modern-01 | 唐长安城与现代西安关系 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 接受隋大兴城基础、现代遗迹叠压及不用现代市中心或明城墙范围替代的限定摘要；不恢复 755—756 年完整城界 |
| Claim | claim-place-changan-coordinate-candidate-01 | 丹凤门现代大明宫遗址展示地标代表点 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 接受 OSM way v4 质心为 `DISPUTED` 代表点；不等同长安城中心、完整城界、唐代门址原状或具体事件点 |
| Claim | claim-geography-yellow-river-role-modern-01 | 黄河历史作用候选 | 不适用 | 不适用 | 否 | 否 | 否 | 否 | banq | 2026-07-31 | REJECTED | 不纳入缩小版摘要；保留供未来历史作用审核，不表示该说法被判定为错误 |
| Claim | claim-geography-qinling-role-modern-01 | 秦岭历史作用候选 | 不适用 | 不适用 | 否 | 否 | 否 | 否 | banq | 2026-07-31 | REJECTED | 不纳入缩小版摘要；保留供未来历史作用审核，不表示该说法被判定为错误 |
| Claim | claim-geography-yellow-river-background-01 | 黄河现代背景说明 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 缩小版 `Geography.summary`；只说明 Natural Earth 现代概览数据用途和年代边界 |
| Claim | claim-geography-wei-river-background-01 | 渭河现代背景说明 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 缩小版 `Geography.summary`；只说明 Natural Earth 现代概览数据用途和年代边界 |
| Claim | claim-geography-qinling-background-01 | 秦岭现代背景说明 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | 缩小版 `Geography.summary`；只说明 Natural Earth 现代广义区域和精度边界 |
| Claim | claim-geography-guanzhong-corridor-modern-01 | 东入关中通道叙事作用（后续候选） | 否 | 不适用 | 否 | 否 | 否 | 否 | 待定 | 待定 | PENDING_REVIEW | 不纳入缩小版 MVP，不决定 LineString 或 Polygon |
| Claim | claim-route-yan-westward-plan-modern-01 | 洛阳—陕州—潼关解释性节点顺序 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | `INFERENCE / LOW`；只批准宏观方向与两段组织方法，不沿现代道路，不加入灵宝，不采用距离、速度、渡口或精确日期 |
| Claim | claim-route-yan-westward-segment-01-inference-01 | 洛阳至陕州现代锚点直连说明 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | `INFERENCE / LOW`；只批准两个现代代表点直接连线，不主张唐代城中心、道路、行军轨迹、渡口、里程或速度 |
| Claim | claim-route-yan-westward-segment-02-inference-01 | 陕州至潼关现代锚点直连说明 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | `INFERENCE / LOW`；只批准两个现代代表点直接连线，不主张唐代城中心、关城、道路、攻关位置、行军轨迹、里程或速度 |
| Claim | claim-route-tang-advance-plan-modern-01 | 潼关→灵宝解释性节点顺序 | 是 | 不适用 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | `INFERENCE / LOW`；只批准宏观方向与单段组织方法，不沿现代道路，不加入陕州或洛阳，不采用撤退线、距离、速度或精确日期 |
| Claim | claim-route-tang-advance-segment-01-inference-01 | 潼关至灵宝现代锚点直连说明 | 是 | 是 | 是 | 是 | 是 | 是 | banq | 2026-07-31 | APPROVED | `INFERENCE / LOW`；只批准两个现代代表点直接连线，不主张唐代关城、灵宝西原战场中心、道路、部署、行军轨迹、撤退线、里程或速度 |

本轮已依据 `data/curated/anshi-mvp-source-notes.md` 为真实生成的 42 个 Citation 和 38 个 Claim 逐条建立审核行。`banq` 于 2026-07-31 已批准 19 个 Source、36 个 Citation 和 35 个 Claim：包括五个现代遗址或展示地标代表点、五个限定摘要、五个战略作用及直接来源链；灵宝五个居民点/三个厂址锚点 CRS 技术核验和两个直接 Source/Citation；六个 Event 的完整字段、各两条 Claim、《资治通鉴》固定修订的有限使用边界及直接 Citation；黄河、渭河、秦岭现代概览几何、保守摘要和 Natural Earth 来源链；以及两个 RoutePlan、共三个 `INFERENCE / LOW` RouteSegment 和五条路线 Claim。5 个 Place、3 个 Geography、6 个 Event 和 2 个逻辑路线槽位共 16/16 个逻辑实体已达到字段齐全的发布条件；任何批准都不确认 755—756 年唐城中心、精确战场、防线、历史路线或公历日期。CHGIS `hvd_83048` 仍只作 `PENDING_REVIEW` 的内部交叉核对，CHGIS 坐标和州级点明确不进入候选。原有两条涉及历史战场作用的 Geography Claim 明确排除出缩小版，但保留文字供未来审核。东入关中通道的 Geography 工作项及对应 Claim 保留为缩小版之后候选，不计入本版门禁。EPUB Source 的批准只覆盖固定文件版本、受限使用边界和已逐条批准的 Citation；4 本新增书继续保持 `PENDING_SOURCE`。实体级或 RoutePlan 级审核不能替代逐条结论、引用和路线分段审核。

## 首批签字

### 内容负责人

- 姓名：banq
- 日期：2026-07-31
- 结论：批准潼关、陕州、洛阳、长安、灵宝各自的限定地点摘要、战略作用、现代遗址或展示地标代表点及直接来源链；灵宝现代“稠桑原”同名居民点 OGC:CRS84 候选和成组 CRS 技术核验必须保持 `DISPUTED`；批准六个 Event 的完整字段、各两条 Claim、《资治通鉴》固定修订有限使用边界和直接 Citation；批准“燕军向潼关方向推进”的“洛阳—陕州—潼关”宏观节点顺序、两个 `INFERENCE / LOW` 现代锚点直连 RouteSegment、三条 Claim、直连处理方法和 `event-02-yan-westward` 首次出现边界，灵宝明确排除；批准“唐军出关行动”的“潼关→灵宝”宏观节点顺序、一个 `INFERENCE / LOW` 现代锚点直连 RouteSegment、两条 Claim、直连处理方法和 `event-03-decision-to-advance` 首次出现边界，陕州、洛阳和撤退线明确排除；两条路线均不批准唐代道路、行军轨迹、渡口、攻关位置、战场中心、距离或速度；另批准 Natural Earth Source、2 个直接 Citation、3 个现代概览几何和 3 个保守摘要 Claim。EPUB 批准只覆盖固定文件版本、受限使用边界和已逐条批准 Citation；CHGIS 仍只作内部交叉核对，其余记录未签字

### 产品负责人

- 姓名：待定
- 日期：待定
- 结论：尚未签字（只有填写真实姓名、日期并明确写明“批准”后才生效）

## MVP-11 发布前最终签字门禁

本节是第一期 MVP 的最终三方签字，不由上面的行级 `APPROVED`、首批内容签字、自动测试或浏览器路径单独替代。Codex 只记录可复核证据，不勾选负责人结论，不填写签字姓名或日期。

> 2026-08-02 产品复核结论：当前二维原型无法直接看出山川形势、关隘作用、省级方位、基本路线和军队行动原因，产品验收不成立。本节保持未签状态并作为历史门禁记录；不得因行级内容已批准、工程门禁通过或浏览器路径可用而补签。后续产品签字改由 [第二期地形优先验收标准](../plans/phase-2-terrain-acceptance.md) 管理。

### 当前可复核证据

| 门禁 | 当前证据 | 状态 |
|---|---|---|
| 正式集合映射 | `npm --prefix frontend run audit:content`：5 Place、6 Event、3 Geography、3 实际 RouteSegment、33 运行时 Claim、36 Citation、19 Source，共 105 个正式键均有唯一 `APPROVED` 审核行 | 已通过 |
| RoutePlan 边界 | 2 个 RoutePlan 和 2 条 RoutePlan Claim 仅作审核组织；3 个实际 RouteSegment 分别具有独立审核行 | 已通过 |
| 范围外记录 | 9 条 `PENDING_REVIEW`、5 条 `PENDING_SOURCE`、2 条 `REJECTED` 明确保留在正式集合之外；没有为“清零”而批准或删除 | 已通过 |
| Claim / Citation / Source | 33 条 Claim 的 `entityType/entityId/field/citationIds` 与资料笔记逐条一致；36 个 Citation 均有章节及页码或稳定定位并解析到 19 个有版本标识的 Source | 已通过 |
| 空间来源 | 7 个空间 Source 的数据版本、访问日期、坐标系、覆盖范围、许可名称、使用限制、处理过程和输出对象均可解析；需要开放许可的 Source 同时有许可证链接和署名文字 | 已通过 |
| 不确定性与占位 | 5 个 Place 继续为 `DISPUTED`；6 个 Event 继续为 `APPROXIMATE` 且 `normalizedDate=null`；3 个 RouteSegment 继续为 `INFERENCE / LOW`；正式 JSON 不含 `TODO_REVIEW`、示例页码、占位坐标或待审核状态 | 已通过 |
| 工程门禁 | Node `24.18.0`、npm `11.16.0`；`npm ci` 通过；`check` 通过，18 个测试文件、116 个测试；根/非根构建和双 worker 闭包校验通过 | 已通过 |
| 裸静态资源 | 根 `/`、根 `/data/`、worker，以及 `/history-map/`、站点根 `/data/`、非根 worker 均由干净构建取得 HTTP 200 | 已通过 |
| 当前真实浏览器回归 | 用户显式交付根路径与 `/history-map/` 标签页后，从干净裸静态构建完成根路径连续 1→6 事件、长安详情、地点/事件主动定位、子路径事件与地点交互、路线图层关闭/恢复；根路径 `1024×768`、子路径 `1440×900` 均无横向溢出，正常 console 0 warning/error，并始终只有 1 个 MapLibre/Canvas | 已通过 |

范围外记录保留理由如下：

- `SRC-MODERN-02`—`05` 只有书目，缺少实际版本和正文；`SRC-PRIMARY-02` 与两条《旧唐书》Citation 因转录质量仅 25% 待对校；`SRC-HISTGEO-02` 与 `CIT-CHGIS-HVD83048-SHANXIAN` 只作带非商业许可的内部核对，不打包坐标。
- `CIT-ANSHI25-CH04-P032-P037`、`CIT-ANSHI25-CH09-P027-P042`、`CIT-TGXZ1992-P558` 涉及尚未采用的部署、战术、兵力、日期或地方叙事，继续等待逐项审核。
- `geography-guanzhong-corridor` 与 `claim-geography-guanzhong-corridor-modern-01` 是用户明确推迟的后续候选，不属于缩小版正式集合。
- `claim-geography-yellow-river-role-modern-01` 与 `claim-geography-qinling-role-modern-01` 只是不纳入本版历史作用摘要的保留项；`REJECTED` 不表示其内容已被判为错误，也不能为了“清零”删除。

### 产品负责人核对与签字

- [ ] 核心故事可在 5—10 次交互内讲清，并能回答 D-007 的五个问题。
- [ ] 页面没有被非核心功能干扰。
- [ ] 地图、时间轴、详情、引用与不确定性的信息层级清楚。
- 签字姓名：
- 签字日期：
- 结论（批准 / 不批准并说明）：

### 内容负责人最终核对与签字

- [ ] 正式 Place、Event、Geography、实际 RouteSegment、逐条 Claim、Citation 和 Source 版本全部复核。
- [ ] 坐标、时间和争议信息没有被过度确定化；空间数据许可证、署名和处理过程已核对。
- [ ] 范围外 `PENDING_SOURCE`、`PENDING_REVIEW`、`REJECTED` 候选保留合理，且不属于本次正式发布集合。
- [ ] 不存在编造页码、占位数据和未说明推断。
- 签字姓名：
- 签字日期：
- 结论（批准 / 不批准并说明）：

### 开发负责人核对与签字

- [ ] `npm --prefix frontend run check` 通过。
- [ ] 根路径和 `/history-map/` 裸静态部署的真实浏览器回归完成，正常 console 无 warning/error，且保持单一 MapLibre/Canvas。
- [ ] 正常样式与本地降级样式均通过验收。
- [ ] 无 Blocker 和 Major 缺陷。
- [ ] 构建产物为纯静态文件，不依赖后端、数据库或秘密。
- 签字姓名：
- 签字日期：
- 结论（批准 / 不批准并说明）：

产品、内容、开发三方负责人填写真实姓名、日期并明确批准后，才可把整期 MVP 标记为完成。当前工程通过、行级 `APPROVED` 和 HTTP 200 均不自动满足本节。
