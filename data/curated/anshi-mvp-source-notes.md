# 安史之乱 MVP 资料笔记

- 状态：缩小版正式数据已生成并通过内容组装门禁，等待最终工程检查与用户提交确认
- 建立日期：2026-07-29
- 叙事切片：潼关防线、灵宝出战与长安失守
- 当前已批准 Source/Citation/Claim 记录数：90（19 个 Source、36 个 Citation、35 个 Claim）
- 当前待审核候选：2 个 Source、6 个 Citation、1 个 Claim 为 `PENDING_REVIEW`；另有 4 个仅完成书目登记的 Source 为 `PENDING_SOURCE`、2 个不纳入缩小版的 Claim 为 `REJECTED`

## 1. 使用规则

1. 本文件是正式数据的唯一人工输入入口之一，不是可以直接发布的历史正文。
2. 工作标签只用于组织核对，不能被当作已确认的史实、日期、坐标或路线。
3. 每条拟展示结论必须有稳定 `claimId`，区分原文、项目归纳和项目推断，并逐条绑定一个或多个稳定 `citationId`；不能只在实体级笼统挂一组来源。
4. 每个 Citation 必须关联具体 Source，并填写页码或可复核的稳定定位。
5. 不填写示例页码、占位坐标或根据现代同名地点猜测的坐标。
6. `APPROVED` 只有在记录真实审核人、审核日期，并在内容审核记录中完成对应人工审核后才有效。只有相关结论、引用和资料均满足该条件的记录才能进入正式 `mvp-v1.json`。

状态值：

```text
PENDING_SOURCE   尚未选定或定位资料
PENDING_REVIEW   已有资料，等待人工核对
APPROVED         内容负责人已核对并记录审核人/日期，可进入正式数据
CHANGES_REQUIRED 已核对但需要修改
REJECTED         不采用，保留原因
```

## 2. 资料版本登记

在核对事件、地点或路线前，先登记实际使用的版本。当前已有 1 个用户提供的现代研究文件、1 个用户提供的地方志 PDF、3 个固定修订号的在线一手史料转录、5 个固定版本开放空间数据来源、1 个仅作内部技术核验的公开实时影像服务、1 个用于核对现代“稠桑原”居民点的政府公示报告、3 个用于核对潼关古址的公开网页或官方名单、3 个用于核对陕州故城与唐代治所关系的历史地理或官方公开网页、1 个用于核对隋唐洛阳城与应天门关系的官方网页，以及 2 个用于核对唐长安城与大明宫丹凤门关系的官方网页。与已接受的潼关现代旧城遗址代表点和不确定性摘要关联的 5 个 Source、灵宝现代“稠桑原”候选的环境报告和 World Imagery 技术 Source、用于黄河、渭河、秦岭现代背景的 Natural Earth Source、仅限支持已批准归纳的 EPUB Source、已批准有限使用的《资治通鉴》卷二百一十八和《资治通鉴（四库全书本）》卷二百一十七固定转录、陕州直接使用的河南档案信息网、三门峡日报和 OSM Source、洛阳直接使用的国家发展改革委网页和 OSM Source，以及长安直接使用的西安市地方志办公室、陕西省文物局和 OSM Source，已由 `banq` 于 2026-07-31 批准。CHGIS `hvd_83048` 仍保持 `PENDING_REVIEW`，其坐标不打包。另有 4 本书只核实到书目，尚未取得实际使用版本或正文，继续保持 `PENDING_SOURCE`。

| sourceId | 类型 | 书名/资料名 | 作者/提供方 | 版本/出版社或数据版本 | 年份/发布日期 | 页码体系或稳定定位 | 来源 URL/文件及访问日期 | 许可证名称与链接 | 必须署名/使用限制 | 状态 |
|---|---|---|---|---|---|---|---|---|---|---|
| SRC-PRIMARY-01 | 编年史在线转录 | 《资治通鉴》卷二百一十八 | 司马光等编纂；维基文库提供转录 | 维基文库固定修订 `oldid=1996147` | 修订时间 2020-11-07 | 固定修订链接 + 段首/段末原文定位 | `https://zh.wikisource.org/w/index.php?title=資治通鑑/卷218&oldid=1996147`；访问日期 2026-07-30 | 原典公版；维基文库转录按 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 与 [GFDL](https://www.gnu.org/licenses/fdl-1.3.html) 提供 | `banq` 于 2026-07-31 批准固定修订仅作少量归纳和交叉核对；不采用兵力、伤亡、精确传统纪日、长段原文或未经对校的精确引语，公开使用转录文字时仍须遵守维基文库署名和共享许可 | APPROVED |
| SRC-PRIMARY-02 | 正史在线转录 | 《旧唐书》卷一百四（高仙芝、封常清、哥舒翰传） | 刘昫等（传统署名）；维基文库提供转录 | 维基文库固定修订 `oldid=2020474`；页面标示 `textquality=25%` | 修订时间 2021-03-13 | 固定修订链接 + “哥舒翰”节 + 段首原文定位 | `https://zh.wikisource.org/w/index.php?title=舊唐書/卷104&oldid=2020474#哥舒翰`；访问日期 2026-07-30 | 原典公版；维基文库转录按 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 与 [GFDL](https://www.gnu.org/licenses/fdl-1.3.html) 提供 | 页面质量标记仅 25%，不得单独作为最终定稿底本；公开使用转录文字时按维基文库许可署名和共享 | PENDING_REVIEW |
| SRC-PRIMARY-03 | 编年史在线转录（四库全书本） | 《资治通鉴（四库全书本）》卷二百一十七 | 司马光等编纂；维基文库提供转录 | 维基文库固定修订 `oldid=783496`、pageid `241547` | 修订时间 2016-10-27T01:22:08Z；访问日期 2026-07-31 | 固定修订链接 + 段首/段末原文定位 | [固定修订](https://zh.wikisource.org/w/index.php?title=資治通鑑_%28四庫全書本%29/卷217&oldid=783496)；访问日期 2026-07-31 | 原典公版；维基文库转录按 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 与 [GFDL](https://www.gnu.org/licenses/fdl-1.3.html) 提供 | `banq` 于 2026-07-31 批准只作渡河、陈留、洛阳、陕郡、潼关宏观节点顺序的交叉核对；不采用兵力、伤亡、精确传统纪日、长段原文或路线几何。普通转录 `資治通鑑/卷217` 固定修订 `oldid=617834` 可见“炅昌”“至峽”等错字，本轮明确不采用 | APPROVED |
| SRC-MODERN-01 | 现代研究 | 《安史之乱：历史、宣传与神话》 | 张诗坪、胡可奇 | 上海人民出版社；版权页标示 2025 年 8 月第 1 版、2025 年 10 月第 3 次印刷；EPUB UUID `178046dc-39e2-47e4-9800-cd15154fe7df` | 2025（按版权页登记；CIP 行另载 2024，保留差异） | 章名 + EPUB 内部 XHTML 文件 + `body-pNNN`；脚注使用原有 `#foN` 锚点 | 用户提供 EPUB 文件；SHA-256 `47ed5030e6079cc084686d39eb23188f6e558968ece3b624c856953a2c56cc43`；访问日期 2026-07-30 | EPUB 未见开放许可证；仅批准本项目内部核对与少量归纳 | 不公开转用长段正文或书内图片；本次批准只覆盖已单独批准的 12 个 Citation，以及潼关、陕州、洛阳、长安战略作用、灵宝地点摘要和已审核 Event Claim，其他内容仍须逐条审核 | APPROVED |
| SRC-MODERN-02 | 现代研究（书目候选） | 《安禄山叛乱的背景》 | [加]蒲立本著；丁俊译 | 中西书局；ISBN `9787547514016` | 2018-04 | 仅核实书目；未取得用户实际书籍或可用正文 | [日本国立国会图书馆书目](https://ndlsearch.ndl.go.jp/en/books/R100000136-I1970023484928275874)；访问日期 2026-07-30 | 未发现开放许可证 | 必须取得实际使用版本后核对版权页和页码；不得从搜索摘要生成 Citation | PENDING_SOURCE |
| SRC-MODERN-03 | 现代研究（书目候选） | 《安禄山：皇帝宝座的觊觎者》 | [日]藤善真澄著；张恒怡译 | 中西书局；ISBN `9787547511787` | 2017-01（网络书目另有 2017-02，待版权页核对） | 仅核实书目；未取得用户实际书籍或可用正文 | [日本国立国会图书馆检索记录](https://ndlsearch.ndl.go.jp/en/search?cs=bib&from=0&q-title=%22%E5%AE%89%E7%A5%BF%E5%B1%B1%22&size=20)；访问日期 2026-07-30 | 未发现开放许可证 | 用户提供书名中的“觊觎着”按书目更正为“觊觎者”；必须取得实际版本后才能生成 Citation | PENDING_SOURCE |
| SRC-MODERN-04 | 现代历史写作（书目候选） | 《弃长安：安史之乱前后的内廷、诗人、政争与叛乱》 | 张明扬 | 天地出版社；ISBN `9787545566062` | 网络书目有 2021-12 与 2022-01 两种记录，待版权页核对 | 仅核实书目和目录；未取得用户实际书籍或可用正文 | [中国作家网书目](https://www.chinawriter.com.cn/n1/2022/0104/c405078-32323532.html)；访问日期 2026-07-30 | 未发现开放许可证 | 网络节选不能替代完整版本与页码核对；不得从简介或目录生成正式 Citation | PENDING_SOURCE |
| SRC-MODERN-05 | 现代研究（书目候选） | 《危机与重构：唐帝国及其地方诸侯》 | 李碧妍 | 北京师范大学出版社 2015 年第 1 版；ISBN `9787303183876` | 2015-08 | 仅核实书目；不同印次页数有差异，未取得用户实际书籍或正文 | [CiNii Books 书目](https://ci.nii.ac.jp/ncid/BB20254523)；访问日期 2026-07-30 | 未发现开放许可证 | 必须以用户实际印次版权页和页码登记；本书侧重安史乱后重构，是否支持当前叙事切片须读正文后判断 | PENDING_SOURCE |
| SRC-HERITAGE-01 | 官方文物名录 | 《第七批全国重点文物保护单位名单》 | 国务院公布；中国政府网提供名单 | 第七批；古遗址第 453 项，编号 `7-0453-1-453` | 2013-05 公布；访问日期 2026-07-30 | 名单“古遗址”第 453 项 | [中国政府网名单 PDF](https://www.gov.cn/guoqing/2014-07/21/dqpqgzdwwbhdwmd.pdf)；访问日期 2026-07-30 | 未发现允许复制整份名单的开放许可证 | 只作名称、时代范围和县级行政位置的引用依据；名单本身不提供唐代关城坐标、范围或 755—756 年对应关系 | APPROVED |
| SRC-HERITAGE-02 | 地方文物志公开转载 | 〈潼关故城〉 | 陕西省文物局主编《陕西省志·文物志》；渭南日报转载 | 网页发布日期 2024-09-13 | 2024-09-13；访问日期 2026-07-30 | 网页标题 + 正文段落 | [渭南日报网页](https://m.ylrb.com/2/2sjtcgjtz/xxqg21365/856810.shtml)；访问日期 2026-07-30 | 未发现开放许可证 | 只能引用或归纳网页文字，不复制图片；其“唐天授二年于现址建城”说法必须与其他历史地理资料并列审核，不能单独生成坐标 | APPROVED |
| SRC-HISTGEO-01 | 新闻报道与专家访谈 | 〈雄关天堑嵌明珠——陕西潼关古城的岁月沧桑〉 | 新华社 / 新华网 | 新华网网页 | 2024-12-06；访问日期 2026-07-30 | “潼关城：津楼落日望，萧索不胜秋”小节 | [新华网网页](https://www.news.cn/local/20241206/505d1668e2f64e7cb1cf4206c6b59d74/c.html)；访问日期 2026-07-30 | 未发现开放许可证 | 只作城址迁移与现场描述的现代核对线索；新闻报道不能替代考古报告或历史地理专论，图片和大段文字不得复制 | APPROVED |
| SRC-LOCALHIST-01 | 地方志 | 《潼关县志》 | 潼关县志编纂委员会编 | 陕西人民出版社；1992 年 4 月第 1 版、第 1 次印刷；ISBN `7-224-01959-3/Z·155`；印数 1—2000 | 1992-04 | 书内印刷页码 + PDF 页码；版本信息见 PDF 第 809 页 | 用户提供 `/Users/banq/Downloads/潼关县志.pdf`；SHA-256 `091a175d21246e6efcd975713047917495fbcc1730b8c29447852ab5e62a0cd0`；访问日期 2026-07-31 | 未发现开放许可证 | 仅用于内部核对和少量归纳；不得公开复制整书、附图或大段正文。PDF 带 OCR 文本层，但 Citation 必须以渲染页核对后的印刷页码为准 | APPROVED |
| SRC-SPATIAL-01 | 空间数据 | Natural Earth 1:10m Rivers + Lake Centerlines、Physical Region Labels | Natural Earth / `nvkelso/natural-earth-vector` | `v5.0.0` 固定标签；原始 GeoJSON SHA-256 分别为 `bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a`、`b7b26e50ea917d3696aec87f932def2bf5f890f5770e441d59c162c6f4c92a77` | 5.0.0；访问日期 2026-07-30 | 源要素属性定位：`66River`、`95River`、`873River`、秦岭 `NE_ID=1159103573` / `Q863798` | [官方仓库 v5.0.0](https://github.com/nvkelso/natural-earth-vector/tree/v5.0.0)；候选输出 `data/curated/spatial/anshi-natural-earth-v5.0.0.geojson` | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/) | 建议署名 “Made with Natural Earth”；仅作现代概览背景，不能证明唐代河道、精确山界、古址、战场、通道或路线 | APPROVED |
| SRC-SPATIAL-02 | 开放地图空间数据 | OpenStreetMap `way/1195138308`“潼关古城” | OpenStreetMap contributors | way 固定版本 `v3`、changeset `139538932`、时间戳 `2023-08-07T01:23:01Z`；67 个节点引用、66 个唯一节点，核对时节点均为 `v1` | way v3；访问日期 2026-07-31 | [way v3 固定版本 XML](https://api.openstreetmap.org/api/0.6/way/1195138308/3) + [当前 full XML](https://api.openstreetmap.org/api/0.6/way/1195138308/full)；固定 way XML SHA-256 `b88a731db27c488a3a94a9bfaa89ee9ca6fa8f5d9f877ebe74ad476ce4787a2e`，本次 full XML SHA-256 `2ad64aab0d590de91b2ffa1dba167740ba61aa2cb9bccd2b2484116f19babb35` | [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/) | 必须署名 `© OpenStreetMap contributors` 并遵守 ODbL；只把现代地图中标为 `historic=ruins`、`name=潼关古城` 的范围用于争议候选，不证明唐代关城身份 | APPROVED |
| SRC-SPATIAL-03 | 政府公示报告中的空间线索 | 《灵宝市城乡餐厨垃圾收运转及综合处理项目环境影响报告书（征求意见稿）》 | 名辰环境工程有限公司编制；灵宝市城市管理局公示 | PDF 元数据创建时间 2024-12-31；公示日期 2025-01-03；352 页；SHA-256 `17a8686f127887f180943f004c6db251161ca8585183a1fd7811a7660de7f582` | 2025-01-03；访问日期 2026-07-31 | PDF 第 30 页 / 印刷第 25 页表 2.6-1；PDF 第 101、124、253 页的三个厂址坐标；PDF 第 317 页附图 3 | [灵宝市政府公示页](https://www.lingbao.gov.cn/16119/616966560/1880866.html)；[报告 PDF](https://www.lingbao.gov.cn/group1/M00/05/2B/CqDIKWd92S6AIkAWAJU8MOAeIUg212.pdf) | 不适用（本项目仅引用必要的单项事实数据，不复制原表、附图或其编排） | `banq` 于 2026-07-31 批准该报告版本、必要坐标事实和内部 CRS 成组测试边界；不复刻整表、图片或版式，不得据此认定历史战场点、范围或路线 | APPROVED |
| SRC-HISTGEO-02 | 历史地名数据库 | CHGIS 时空地名辞典 `hvd_83048`“陕县” | China Historical GIS；哈佛大学与复旦大学发布 | 固定规范地名记录 `hvd_83048`；时间范围 558—1367；访问日期 2026-07-31 | JSON 规范记录 + source note；其中列出 742—757 年为陕郡治、758 年复为陕州治 | [固定 JSON 记录](https://tgaz.fudan.edu.cn/tgaz/placename/json/hvd_83048)；访问日期 2026-07-31 | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) | 只用于核对唐代“陕州/陕郡—陕县治所—陕县老城”关系；非商业限制未纳入本项目发布许可，不把 CHGIS 坐标打包进公开 GeoJSON/JSON。756 年州级记录 `hvd_115770` 的点位不是治所证据，本轮明确排除 | PENDING_REVIEW |
| SRC-HERITAGE-03 | 官方档案信息网页 | 〈河南三门峡 四大回音建筑之一蛤蟆塔〉 | 河南省档案馆河南档案信息网 | 网页发布日期标示 2021-08-24；站点路径日期 2022-06-29 | 网页标题 + 首段 | [河南档案信息网网页](https://www.hada.gov.cn/2022/06-29/154859.html)；访问日期 2026-07-31 | 未发现开放许可证 | `banq` 于 2026-07-31 批准仅归纳“宝轮寺塔位于陕州故城（陕县老城）东南部”和现存塔为金代重建等位置边界；不复制图片或大段正文，不用塔点证明唐代城中心 | APPROVED |
| SRC-HERITAGE-04 | 地方文保主管部门回应报道 | 〈陕州故城东城墙南段项目获批立项〉 | 三门峡市文化广电和旅游局回应；三门峡日报报道 | 网页发布日期 2026-01-14 | 标题下第 1—3 段 | [三门峡日报网页](https://szb.ismx.cn/smxrb/html/2026-01/14/content_855338.htm?div=-1)；访问日期 2026-07-31 | 网页声明版权归三门峡日报社，未经授权禁止下载、转载使用 | `banq` 于 2026-07-31 批准只作少量归纳；支持陕州故城的历史延续、唐宋城址基础和现代遗址范围说明，不复制正文、图片或把报道中的面积反推唐代城界 | APPROVED |
| SRC-SPATIAL-04 | 开放地图空间数据 | OpenStreetMap `node/12768197183`“宝轮寺塔” | OpenStreetMap contributors | node 固定版本 `v1`、changeset `165144967`、时间戳 `2025-04-19T09:34:39Z` | node v1；访问日期 2026-07-31 | [node v1 固定版本 XML](https://api.openstreetmap.org/api/0.6/node/12768197183/1)；SHA-256 `aeab32fa9a89440ccec25386e2908d10b386e49ff2ce1be9f8d7862b5c620514` | [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/) | `banq` 于 2026-07-31 批准固定节点和使用边界；必须署名 `© OpenStreetMap contributors` 并遵守 ODbL，只提供现代宝轮寺塔点位，不证明 755—756 年陕郡治所中心或城界 | APPROVED |
| SRC-HERITAGE-05 | 官方历史文化遗址网页 | 〈运河明珠 隋唐神韵——打造隋唐洛阳城国家历史文化公园〉 | 国家发展和改革委员会社会司 | 国家发展改革委网页；发布日期 2020-10-21 | 2020-10-21；访问日期 2026-07-31 | 正文首段与“四、隋唐洛阳城—应天门”小节 | [国家发展改革委网页](https://www.ndrc.gov.cn/xwdt/ztzl/dyhwhbhczly/dxal/202010/t20201021_1248645.html)；访问日期 2026-07-31 | 未发现开放许可证 | `banq` 于 2026-07-31 批准只作隋唐洛阳城现代遗址范围、组成和应天门身份的少量归纳；不复制图片或大段正文，不把遗址公园展示工程当作 755—756 年城界或建筑原貌 | APPROVED |
| SRC-SPATIAL-05 | 开放地图空间数据 | OpenStreetMap `way/865951589`“应天门” | OpenStreetMap contributors | way 固定版本 `v4`、changeset `178096116`、时间戳 `2026-02-04T13:55:22Z`；22 个节点引用、21 个唯一节点，其中 20 个节点为 `v2`、1 个为 `v1` | way v4；访问日期 2026-07-31 | [way v4 固定版本 XML](https://api.openstreetmap.org/api/0.6/way/865951589/4) + [当前 full XML](https://api.openstreetmap.org/api/0.6/way/865951589/full)；固定 way XML SHA-256 `bad02c638aab184fdfb0847fa58ce2ba63f798b011e24b08ec51d81e0b3ab4ee`，本次 full XML SHA-256 `698a1cee5f886d843b9c1e3c3459ddbd4dac1c4f150733ee2a544ee555dac8f8` | [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/) | `banq` 于 2026-07-31 批准固定版本、处理记录、ODbL 和署名边界；该 way 只用于 `DISPUTED` 的现代应天门展示地标代表点，不证明唐代洛阳城中心、755—756 年城界或历史建筑精确范围 | APPROVED |
| SRC-HERITAGE-06 | 官方地方志网页 | 〈隋大兴城、唐长安城遗址〉 | 西安市地方志办公室 | 西安市地方志办公室网页；发布时间 2025-08-27 16:41 | 2025-08-27；访问日期 2026-07-31 | 正文“唐长安城东到……”与“1957年……”段及遗址清单 | [西安市地方志办公室网页](https://xadfz.xa.gov.cn/xadq/rwxa/1960625284585664514.html)；访问日期 2026-07-31 | 未发现开放许可证 | `banq` 于 2026-07-31 批准只作隋大兴城与唐长安城关系、现代范围描述、主要遗址和“多数遗迹叠压于现代城市下”的少量归纳；不复制图片或大段正文，不据文字重建正式城界 | APPROVED |
| SRC-HERITAGE-07 | 官方世界文化遗产网页 | 〈唐长安城大明宫遗址〉 | 陕西省文物局 | 陕西省文物局“丝路申遗”遗产概况网页；发布日期 2012-11-30 | 2012-11-30；访问日期 2026-07-31 | 正文首段及“丹凤门遗址保护展示厅”“丹凤门遗址”图片说明 | [陕西省文物局网页](https://wwj.shaanxi.gov.cn/ztzl/ndzt/2013n/slsy/ycgk_2414/201211/t20121130_2143530.html)；访问日期 2026-07-31 | 未发现开放许可证 | `banq` 于 2026-07-31 批准只作大明宫属于唐长安城宫殿体系、其权力中心作用及丹凤门遗址展示性质的少量归纳；不复制图片或把展示建筑当作唐代原状 | APPROVED |
| SRC-SPATIAL-06 | 开放地图空间数据 | OpenStreetMap `way/280412702`“丹凤门” | OpenStreetMap contributors | way 固定版本 `v4`、changeset `98009320`、时间戳 `2021-01-23T08:13:44Z`；21 个节点引用、20 个唯一节点，其中 19 个节点为 `v2`、1 个为 `v3` | way v4；访问日期 2026-07-31 | [way v4 固定版本 XML](https://api.openstreetmap.org/api/0.6/way/280412702/4) + [当前 full XML](https://api.openstreetmap.org/api/0.6/way/280412702/full)；固定 way XML SHA-256 `0aa8ff3aa4a7a6295587da4c439f4e816d2f5246a2e6f9aeaa9eb4ecfae6c01e`，本次 full XML SHA-256 `29837c6e60ce1eadc0a088942fd43888048557922dc3f674911588c4d600f2d7` | [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/) | `banq` 于 2026-07-31 批准固定版本、处理记录、ODbL 和署名边界；该 way 标记现代地图中的丹凤门建筑，只能生成 `DISPUTED` 的大明宫遗址展示地标代表点，不证明唐长安城中心、755—756 年城界或历史建筑原状 | APPROVED |
| SRC-SPATIAL-07 | 公开实时影像服务（仅作技术交叉核验） | Esri World Imagery | Esri；灵宝核验范围的高分辨率影像 citation 为 Vantor Vivid | ArcGIS REST `currentVersion=11.3`；item `10df2279f9684e4a9f6a7f08febac2a9`，item 修改时间 2026-07-01；灵宝范围影像采集日期 2025-08-19、分辨率 0.34m、标示精度 5m、`Raster Basemaps 2026.R05` | 影像采集 2025-08-19；访问日期 2026-07-31 | EPSG:4326 bbox `[110.855, 34.600, 110.925, 34.642]`、1800×1080 临时导出；影像 SHA-256 `c710bc4c093c555994ca5d36773a81f318e8e754855f59a5303ceecf97589020`；范围 citation 查询 SHA-256 `ff247db44e1b5467573f789465a7e0c736ceeedd81e1c218c2ad8c4471d0f2e6` | [World Imagery 官方条目](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9)；[MapServer](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer)；访问日期 2026-07-31 | [Esri Master License Agreement / Terms of Use](https://goto.arcgis.com/termsofuse/viewtermsofuse)；署名 `Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community` | `banq` 于 2026-07-31 批准该影像版本和仅作内部 CRS 技术交叉核验的边界；不把影像文件、截图、建筑/道路/村界描绘或派生图层写入仓库或公开数据 | APPROVED |

空间数据还必须在实际记录中补充原始坐标系、覆盖范围、访问日期、裁剪/简化/重投影过程和输出文件标识。许可证名称、许可证链接与署名文字不能只写“可用”或“公开数据”。

## 3. 单条内容核对模板

复制本节用于每一条正式结论。

```text
记录 ID：
结论 ID（claimId）：
实体类型：Place / Event / RoutePlan / RouteSegment / Geography
实体 ID：
字段路径/展示位置：
工作标签：
拟展示结论：
结论类型：PRIMARY_RECORD / MODERN_RESEARCH / INFERENCE / DISPUTE
原文摘录：
项目归纳：
引用 ID 列表（citationIds，可多条）：
时间原文：
时间精度：
坐标或几何依据：
几何来源 ID 列表：
几何处理过程（含原始坐标系、裁剪/简化/重投影）：
可信度：
争议与替代观点：
核对人：
核对日期：
状态：PENDING_SOURCE

引用明细（每个 citationId 复制一份）：
引用 ID：
资料 ID：
章节：
页码或稳定定位：
必要短摘录：
该来源支持/反对的具体内容：
观点类型：
可信度：
```

### 3.1 EPUB 解析与稳定定位约定

本轮只解析用户提供的《安史之乱：历史、宣传与神话》EPUB，不联网补充史实。文件通过 ZIP 完整性检查；EPUB 的 NCX 元数据明确记录 `dtb:totalPageCount=0`、`dtb:maxPageNumber=0`，因此本轮不填写或推算纸书页码。

本轮稳定定位规则如下：

- `body-pNNN` 是指定 XHTML 文件中 `<body>` 的直接子级 `<p>` 按文档顺序从 1 开始编号。
- 该编号只对 SHA-256 为 `47ed5030e6079cc084686d39eb23188f6e558968ece3b624c856953a2c56cc43` 的本次 EPUB 有效。
- `#foN` 和 `#imgN` 是 EPUB 文件中已有的脚注或插图锚点，不是项目生成的页码。
- 下列“项目归纳”全部是对本书论述的候选转述，不代表项目已经确认其史实或因果解释。
- 本轮 EPUB 初始解析不从正文或书内示意图推导坐标、RouteSegment、标准化日期或路线几何；后续路线候选若使用已批准的现代代表点，必须另行登记为 `INFERENCE / LOW`，记录直连处理方法并逐段审核。

### 3.2 Citation 候选

| citationId | sourceId | 章节 | 稳定定位 | 该来源候选支持的内容 | 观点类型 | 可信度 | 状态 |
|---|---|---|---|---|---|---|---|
| CIT-ANSHI25-CH04-P018 | SRC-MODERN-01 | 第四章“大乱终起” | `OEBPS/text/part0004.html#body-p018`；原脚注 `#fo11` | `banq` 于 2026-07-31 批准用于 `event-02-yan-westward` 的燕军渡过黄河、占领陈留后西进洛阳的宏观节点顺序；不支持路线几何、速度、距离或精确日期 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH04-P032-P037 | SRC-MODERN-01 | 第四章“大乱终起” | `OEBPS/text/part0004.html#body-p032`—`body-p037` | 本书所述唐廷以河南防御迟滞燕军、等待西北精锐集结的总体部署 | MODERN_RESEARCH | UNKNOWN | PENDING_REVIEW |
| CIT-ANSHI25-CH05-P006-P014 | SRC-MODERN-01 | 第五章“大唐名将们的无解难题” | `OEBPS/text/part0005.html#body-p006`—`body-p014` | 洛阳的城防、仓储作用及本书对洛阳迅速失守的解释；只用于获批的洛阳地点摘要与战略作用归纳，不批准兵力、精确日期或作者的个体责任判断 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH05-P018-P023 | SRC-MODERN-01 | 第五章“大唐名将们的无解难题” | `OEBPS/text/part0005.html#body-p018`—`body-p023`；原脚注 `#fo11`—`#fo17` | `banq` 于 2026-07-31 批准用于潼关战略作用、`event-01-defense-context` 的阻断作用，以及 `event-02-yan-westward` 的陕郡退守潼关、燕军继续施压归纳；不支持路线几何、关城坐标、兵力或精确日期 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH08-P001-P003 | SRC-MODERN-01 | 第八章“强令唐军出关” | `OEBPS/text/part0008.html#body-p001`—`body-p003`；原脚注 `#fo1` | `banq` 于 2026-07-31 批准用于潼关战略作用，以及 `event-01-defense-context` 的标题、相对时间、摘要和叙事作用；不把作者概括扩展为精确防线、精确日期或唯一史实 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH08-P025-P033 | SRC-MODERN-01 | 第八章“强令唐军出关” | `OEBPS/text/part0008.html#body-p025`—`body-p033`；原脚注 `#fo12`—`#fo16` | 洛阳—陕郡—长安粮运链、陕郡黄河航运瓶颈，以及洛阳和陕郡失守对漕运的影响；只用于获批的陕州、洛阳与长安战略作用归纳，不生成港口、仓址、航道或路线 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH08-P034-P040 | SRC-MODERN-01 | 第八章“强令唐军出关” | `OEBPS/text/part0008.html#body-p034`—`body-p040`；原脚注 `#fo17`、`#fo18` | `banq` 于 2026-07-31 批准用于长安供养与粮运依赖的限定战略作用归纳；不批准替代运输线、军政控制风险或出关决策的完整因果解释 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH09-P001-P003 | SRC-MODERN-01 | 第九章“决定命运的灵宝之战” | `OEBPS/text/part0009.html#body-p001`—`body-p003`；原脚注 `#fo1`、`#fo2` | `banq` 于 2026-07-31 批准只采用 `body-p001` 核对唐军最终离开潼关及后续灵宝方向交战的叙事衔接；不采用传统纪日转换、`body-p002`—`body-p003` 的粮运/军政因果或责任判断 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH09-P015-P020 | SRC-MODERN-01 | 第九章“决定命运的灵宝之战” | `OEBPS/text/part0009.html#body-p015`—`body-p020`；原脚注 `#fo7` | `banq` 于 2026-07-31 批准用于灵宝地点摘要及“唐燕军战于灵宝西原”的相对地形文字背景；不支持战场坐标/范围、秦函谷关景区对应、传统纪日、道路宽度、兵力或书内示意图复用 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH09-P025-P026 | SRC-MODERN-01 | 第九章“决定命运的灵宝之战” | `OEBPS/text/part0009.html#body-p025`—`body-p026` | `banq` 于 2026-07-31 批准只核对“唐燕军战于灵宝西原”中双方交战开始；不采用传统纪日、秦函谷关旧址对应、道路、兵力、先锋构成或进军目的 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH09-P027-P042 | SRC-MODERN-01 | 第九章“决定命运的灵宝之战” | `OEBPS/text/part0009.html#body-p027`—`body-p042`；原脚注 `#fo9`—`#fo15` | 本书对双方部署、战场地形影响、唐军溃败及救援过程的重建；具体兵力和战术解释均待复核 | MODERN_RESEARCH | UNKNOWN | PENDING_REVIEW |
| CIT-ANSHI25-CH10-P001-P004 | SRC-MODERN-01 | 第十章“新君登基” | `OEBPS/text/part0010.html#body-p001`—`body-p004`；原脚注 `#fo1`、`#fo2` | `banq` 于 2026-07-31 批准用于潼关战略作用归纳及“燕军攻克潼关”中 `body-p002` 的收集散卒、主帅被控制带走和燕军占领顺序；不采用其余段落、兵力、伤亡、守关可能性、人物评价或扩展因果链 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH10-P005-P008 | SRC-MODERN-01 | 第十章“新君登基” | `OEBPS/text/part0010.html#body-p005`—`body-p008`；原脚注 `#fo3` | `banq` 于 2026-07-31 批准用于长安战略作用中“潼关失守后出现恐慌、皇帝离城”的限定归纳，并用于 `event-06-changan-consequence` 中玄宗离开长安的顺序核对；仍不采用精确日期、出城地点、路线、动机或责任判断 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ANSHI25-CH10-P036-P038 | SRC-MODERN-01 | 第十章“新君登基” | `OEBPS/text/part0010.html#body-p036`—`body-p038`；原脚注 `#fo18` | `banq` 于 2026-07-31 批准用于长安战略作用中“燕军随后占领长安”的限定归纳，并用于 `event-06-changan-consequence` 中燕军得知消息后再进入长安的顺序核对；不采用精确间隔、部队路线、兵力、入城地点、事件点或 `body-p038` 的占领后细节 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-ZZTJ217-R783496-P01 | SRC-PRIMARY-03 | 《资治通鉴（四库全书本）》卷二百一十七 | 固定修订 `oldid=783496`；段首“丁亥，安禄山自灵昌渡河”至“丁酉，禄山陷东京” | `banq` 于 2026-07-31 批准用于交叉核对灵昌渡河、陈留与洛阳宏观节点顺序；不采用兵力、伤亡、精确传统纪日、路线几何或长段原文 | PRIMARY_RECORD | UNKNOWN | APPROVED |
| CIT-ZZTJ217-R783496-P02 | SRC-PRIMARY-03 | 《资治通鉴（四库全书本）》卷二百一十七 | 固定修订 `oldid=783496`；段首“封常清帅余众至陕”至“禄山使其将崔乾佑屯陕” | `banq` 于 2026-07-31 批准用于交叉核对唐军由陕郡退至潼关、燕军在潼关前受阻并驻军陕郡的节点关系；不采用伤亡、精确传统纪日、具体路线或行动动机 | PRIMARY_RECORD | UNKNOWN | APPROVED |
| CIT-ZZTJ218-R1996147-P00 | SRC-PRIMARY-01 | 《资治通鉴》卷二百一十八 | 固定修订 `oldid=1996147`；段首“郭子仪、李光弼还常山”至段末“禄山议弃洛阳，走归范阳，计未决” | `banq` 于 2026-07-31 批准只用于交叉核对河北方向压力、燕军北向联络受阻和数月未进潼关；不采用段中兵力、伤亡、精确传统纪日或引语措辞 | PRIMARY_RECORD | UNKNOWN | APPROVED |
| CIT-ZZTJ218-R1996147-P01 | SRC-PRIMARY-01 | 《资治通鉴》卷二百一十八 | 固定修订 `oldid=1996147`；段首“会有告崔乾祐在陕”至段末“丙戌，引兵出关” | `banq` 于 2026-07-31 批准用于交叉核对哥舒翰、郭子仪、李光弼的固守意见、`event-01-defense-context` 的叙事衔接，以及 `event-03-decision-to-advance` 的“报告—异议—催令—出关”顺序；不把报告敌情视为已证事实，不采用兵力、精确传统纪日、具体动机、责任判断或长段原文 | PRIMARY_RECORD | UNKNOWN | APPROVED |
| CIT-ZZTJ218-R1996147-P02 | SRC-PRIMARY-01 | 《资治通鉴》卷二百一十八 | 固定修订 `oldid=1996147`；段首“己丑，遇崔乾祐之军于灵宝西原”至“辛卯，乾祐进攻潼关，克之” | `banq` 于 2026-07-31 批准核对“唐燕军战于灵宝西原”的地点、相对地形、交战与唐军溃败，以及“燕军攻克潼关”的收集散卒、主帅被控制带走和攻克潼关顺序；两个 Event 保持分离，不采用传统纪日、兵力、伤亡、战术、路线、精确坐标、直接引语或长段原文 | PRIMARY_RECORD | UNKNOWN | APPROVED |
| CIT-ZZTJ218-R1996147-P03 | SRC-PRIMARY-01 | 《资治通鉴》卷二百一十八 | 固定修订 `oldid=1996147`；段首“安禄山不意上遽西幸”至段末“无追迫之患” | `banq` 于 2026-07-31 批准只核对唐玄宗离开长安、燕军先留兵潼关、随后另遣军进入长安的叙事顺序；不采用精确传统纪日、精确间隔、兵力、离城或入城路线、地点、占领后部署、直接引语或长段原文 | PRIMARY_RECORD | UNKNOWN | APPROVED |
| CIT-JTS104-R2020474-GSH01 | SRC-PRIMARY-02 | 《旧唐书》卷一百四“哥舒翰” | 固定修订 `oldid=2020474#哥舒翰`；段首“先是，翰数奏禄山虽窃河朔”至“翰不得已，引师出关” | 传记叙述中的固守意见、对敌情的判断和被催促出关；页面转录质量仅 25%，必须对校整理本 | PRIMARY_RECORD | UNKNOWN | PENDING_REVIEW |
| CIT-JTS104-R2020474-GSH02 | SRC-PRIMARY-02 | 《旧唐书》卷一百四“哥舒翰” | 固定修订 `oldid=2020474#哥舒翰`；段首“六月四日，次于灵宝县之西原”至段末“潜杀之” | 传记叙述中的传统纪年、战场南北地形、交战和溃败；不支持现代公历换算、精确坐标或兵力定论 | PRIMARY_RECORD | UNKNOWN | PENDING_REVIEW |
| CIT-NE50-RIVERS-MVP | SRC-SPATIAL-01 | `ne_10m_rivers_lake_centerlines.geojson` | v5.0.0；`dissolve=66River` 按 WGS84 球面大圆距离计算的最长部分 + `dissolve=95River` 端点相接部分；`dissolve=873River` 唯一部分 | 黄河和渭河的现代 1:10m 概览线形候选；不代表唐代河道，不支持历史路线 | FACT | UNKNOWN | APPROVED |
| CIT-NE50-QINLING-MVP | SRC-SPATIAL-01 | `ne_10m_geography_regions_polys.geojson` | v5.0.0；`NE_ID=1159103573`、`WIKIDATAID=Q863798`、`NAME_ZH=秦岭` | 秦岭现代广义区域 Polygon 候选；Natural Earth 明示区域面较粗略，不能作为精确边界或战场范围 | FACT | UNKNOWN | APPROVED |
| CIT-GOV-NCH7-0453 | SRC-HERITAGE-01 | 《第七批全国重点文物保护单位名单》“古遗址” | 第 453 项，编号 `7-0453-1-453` | 名单把“潼关故城”登记为唐至明遗址，行政位置为陕西省渭南市潼关县；不支持遗址内部的唐代点位、边界或现代景区对应 | FACT | UNKNOWN | APPROVED |
| CIT-SXWWZ-TONGGUAN | SRC-HERITAGE-02 | 〈潼关故城〉 | 标题下首段及后续文保段 | 网页称潼关故城位于秦东镇南街村、为唐至明关城遗址，同时说明现存城址为明洪武遗存；其“唐天授二年于现址建城”说法需与其他材料并列核对 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-XINHUA-TONGGUAN-SITES | SRC-HISTGEO-01 | “潼关城：津楼落日望，萧索不胜秋” | 段首“在潼关古城景区外数公里”至“不断向山下迁移至如今的潼关县秦东镇一带” | 报道把汉、唐两代故城描述为麟趾塬高地上的相邻遗址，并称后世城址向山下秦东镇一带迁移；该说法与 `CIT-SXWWZ-TONGGUAN` 的“现址”表述存在待审核冲突 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-TGXZ1992-P418-P420 | SRC-LOCALHIST-01 | 第二章“县城”第一节“古潼关城” | 印刷第 418—420 页；PDF 第 439—441 页 | 县志把隋连城关迁往黄河南沿的时间记为唐天授二年，并在后续页描述明清扩建的旧城；第 420 页“潼关旧城示意图”未标年代、比例尺或坐标，不能据图反推唐城边界 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-TGXZ1992-P558 | SRC-LOCALHIST-01 | 第五章“潼关战事” | 印刷第 558 页；PDF 第 574 页；“安禄山、哥舒翰之战”条 | 县志概述安史之乱中守关、出关、战败和潼关失守的传统叙事；其中精确日期、兵力和战术细节必须与一手史料及权威整理本逐项对校 | MODERN_RESEARCH | UNKNOWN | PENDING_REVIEW |
| CIT-TGXZ1992-P632-P633 | SRC-LOCALHIST-01 | 第八章“文物”第一节“古遗址” | 印刷第 632—633 页；PDF 第 645—646 页；“古城堡”条 | 县志把“明潼关城”定位为黄、渭河交汇处南岸、距当时县城约 10 公里，并记作唐天授二年建关、宋金元设防、明清扩建；该表述可支持现代旧城遗址候选，但与新华社所述麟趾塬唐城存在冲突 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-OSM-W1195138308-V3 | SRC-SPATIAL-02 | OpenStreetMap `way/1195138308` | way `v3`；`historic=ruins`、`name=潼关古城`；本次 full XML 67 个节点引用、66 个唯一节点 | 提供现代开放地图中的“潼关古城”遗址范围。按经纬度平面多边形质心公式得到候选点 `[110.2909781, 34.6035548]`，且质心位于源环内；只支持现代遗址范围的代表点，不证明 755—756 年唐代关城 | FACT | DISPUTED | APPROVED |
| CIT-LB-EIA-P25-CHOUSANGYUAN | SRC-SPATIAL-03 | 第二章“总则”表 2.6-1“大气环境保护目标一览表” | PDF 第 30 页 / 印刷第 25 页“稠桑原”行；PDF 第 317 页附图 3再次标注该居民点 | `banq` 于 2026-07-31 批准报告中现代“稠桑原”原始坐标 `[110.872607, 34.615468]` 及使用边界；只支持现代居民点候选，不支持历史西原、756 年战场中心或区域边界 | FACT | DISPUTED | APPROVED |
| CIT-ESRI-WORLD-IMAGERY-LINGBAO-20260731 | SRC-SPATIAL-07 | World Imagery 灵宝技术核验范围 | EPSG:4326 bbox `[110.855, 34.600, 110.925, 34.642]`；影像块 citation 为 Vantor Vivid，采集日期 2025-08-19、0.34m、标示精度 5m、`Raster Basemaps 2026.R05`；临时导出 SHA-256 `c710bc4c093c555994ca5d36773a81f318e8e754855f59a5303ceecf97589020` | `banq` 于 2026-07-31 批准只用于五个居民点和三个厂址锚点的原值/GCJ-02 转换值技术比较；不支持影像复制、历史地点、村界、建筑、填埋场边界、战场范围或路线 | FACT | DISPUTED | APPROVED |
| CIT-CHGIS-HVD83048-SHANXIAN | SRC-HISTGEO-02 | CHGIS `hvd_83048`“陕县”规范记录 | 固定 JSON 记录；`historical_context.part of` 的 742—757 年条目 + source note 第 3、6 注 | 记录把陕县列为 742—757 年陕郡治所，并把该县治所对应到今三门峡市崖底乡西北陕县老城；只支持历史名称、治所关系和大致现代对应。其 CC BY-NC 坐标不进入公开候选文件，州级 `hvd_115770` 点位也不作为治所点 | MODERN_RESEARCH | DISPUTED | PENDING_REVIEW |
| CIT-HADA-BAOLUN-20210824 | SRC-HERITAGE-03 | 〈河南三门峡 四大回音建筑之一蛤蟆塔〉 | 标题下首段 | 网页把宝轮寺塔定位在三门峡市湖滨区陕州故城（陕县老城）东南部，并说明现存塔为金代重建；只支持获批摘要与现代代表点的相对位置，不支持唐代城中心或城界 | FACT | UNKNOWN | APPROVED |
| CIT-SMXRB-SHANZHOU-20260114 | SRC-HERITAGE-04 | 〈陕州故城东城墙南段项目获批立项〉 | 标题下第 1—3 段 | 报道转述地方文保主管部门信息：陕州故城自北魏置州后历代为州县治所，明代在唐宋城址基础上整修；只支持获批摘要和现代故城候选，不把报道所列现存规模当作唐代城界 | MODERN_RESEARCH | UNKNOWN | APPROVED |
| CIT-OSM-N12768197183-V1 | SRC-SPATIAL-04 | OpenStreetMap `node/12768197183` | node `v1`；`name=宝轮寺塔`、`official_name=宝轮寺三圣舍利宝塔`、`tower:type=pagoda` | 固定节点给出现代宝轮寺塔 WGS84 / OGC:CRS84 坐标 `[111.1488645, 34.7915940]`。无需裁剪、简化、质心计算或重投影；只用于获批的故城内现代地标代表点 | FACT | DISPUTED | APPROVED |
| CIT-NDRC-SUITANG-LUOYANG-20201021 | SRC-HERITAGE-05 | 〈运河明珠 隋唐神韵——打造隋唐洛阳城国家历史文化公园〉 | 正文首段与“四、隋唐洛阳城—应天门”小节 | 官方网页把隋唐洛阳城城址描述为约 47 平方公里、主要分布于今西工区等四区，并把应天门明确为隋唐洛阳城宫城正南门和原址保护展示项目；`banq` 于 2026-07-31 批准只支持地点摘要与现代展示地标的对应边界，不生成正式城界 | FACT | UNKNOWN | APPROVED |
| CIT-OSM-W865951589-V4 | SRC-SPATIAL-05 | OpenStreetMap `way/865951589` | way `v4`；`historic=city_gate`、`name=应天门`；本次 full XML 22 个节点引用、21 个唯一节点 | 提供现代开放地图中的应天门展示建筑范围。按经纬度平面多边形质心公式得到候选点 `[112.4545867, 34.6769987]`，且质心位于源环内；`banq` 于 2026-07-31 批准只作现代展示地标代表点，不证明 755—756 年洛阳城中心、城界或城门历史精确范围 | FACT | DISPUTED | APPROVED |
| CIT-XADFZ-TANG-CHANGAN-20250827 | SRC-HERITAGE-06 | 〈隋大兴城、唐长安城遗址〉 | “唐长安城东到……”与“1957年……”段及遗址清单 | `banq` 于 2026-07-31 批准用于唐长安城承继隋大兴城、遗迹叠压于现代城市及大明宫/丹凤门属于遗址清单的限定归纳；不据文字生成正式边界 | FACT | UNKNOWN | APPROVED |
| CIT-SXWWJ-DAMING-PALACE-20121130 | SRC-HERITAGE-07 | 〈唐长安城大明宫遗址〉 | 正文首段及丹凤门相关图片说明 | `banq` 于 2026-07-31 批准用于大明宫属于唐长安城宫殿和权力中心、丹凤门遗址与展示设施有别的限定归纳；不把展示建筑等同唐代原状或整座长安城中心 | FACT | UNKNOWN | APPROVED |
| CIT-OSM-W280412702-V4 | SRC-SPATIAL-06 | OpenStreetMap `way/280412702` | way `v4`；`building=yes`、`name=丹凤门`；本次 full XML 21 个节点引用、20 个唯一节点 | `banq` 于 2026-07-31 批准质心 `[108.9594728, 34.2828248]` 作为 `DISPUTED` 的现代大明宫遗址展示地标代表点；不证明唐长安城中心、城界或历史门址原状 | FACT | DISPUTED | APPROVED |

### 3.3 时间文本候选

以下只记录原书的时间表达，不转换公历日期，不写入 `normalizedDate`。

| entityId | 原书时间文本或顺序 | 稳定定位 | 审核提示 | 状态 |
|---|---|---|---|---|
| event-01-defense-context | “距离安禄山起兵已经半年” | `part0008.html#body-p001`；CIT-ANSHI25-CH08-P001-P003 | `banq` 于 2026-07-31 批准 `dateLabel`“安禄山起兵约半年后（原书相对表述）”；`normalizedDate=null`、`timePrecision=APPROXIMATE`，不把《资治通鉴》的传统纪日转换为公历 | APPROVED |
| event-02-yan-westward | 洛阳失守后至潼关防线形成 | `part0004.html#body-p018`；`part0005.html#body-p018`—`body-p023`；CIT-ZZTJ217-R783496-P01、CIT-ZZTJ217-R783496-P02 | `banq` 于 2026-07-31 批准 `dateLabel`“洛阳失守后至潼关防线形成”；`normalizedDate=null`、`timePrecision=APPROXIMATE`，表示一段过程而非同一天 | APPROVED |
| event-03-decision-to-advance | 朝廷催令、守将异议至唐军最终出关，是一段过程而非单一时点 | `part0009.html#body-p001`；CIT-ZZTJ218-R1996147-P01 | `banq` 于 2026-07-31 批准 `dateLabel`“唐军出关前的命令过程至实际出关（传统纪日未换算）”；`normalizedDate=null`、`timePrecision=APPROXIMATE`，不把传统纪日转换为公历 | APPROVED |
| event-04-lingbao-engagement | 唐军出关后在灵宝西原方向与燕军交战，败退后才进入潼关失守阶段 | CIT-ZZTJ218-R1996147-P02；`part0009.html#body-p025`—`body-p026` | `banq` 于 2026-07-31 批准 `dateLabel`“唐军出关后、潼关失守前（传统纪日未换算）”；`normalizedDate=null`、`timePrecision=APPROXIMATE`，不采用 EPUB 或编年史中的传统纪日换算 | APPROVED |
| event-05-tongguan-fall | 灵宝西原交战后，哥舒翰收集散卒，随后被部将控制并带走；燕军继而攻克潼关 | CIT-ZZTJ218-R1996147-P02；`part0010.html#body-p002` | `banq` 于 2026-07-31 批准 `dateLabel`“灵宝西原交战后（传统纪日未换算）”；`normalizedDate=null`、`timePrecision=APPROXIMATE`，不采用编年史传统纪日或电子书中的间隔推算 | APPROVED |
| event-06-changan-consequence | 潼关失守后唐玄宗离开长安；燕军得知后先留兵潼关，随后另遣军进入长安 | CIT-ZZTJ218-R1996147-P03；`part0010.html#body-p005`—`body-p008`、`body-p036`—`body-p037` | `banq` 于 2026-07-31 批准 `dateLabel`“潼关失守后至燕军占领长安（传统纪日未换算）”；`normalizedDate=null`、`timePrecision=APPROXIMATE`，明确表示连续阶段而非同一天，不采用精确间隔 | APPROVED |

### 3.3.1 Event 基础字段候选

以下字段只是供内容负责人审核的完整 Event 候选，不表示已经进入正式数据。

| eventId | sequence | title | eventType | dateLabel | normalizedDate | timePrecision | certainty | relatedPlaceIds | actorLabels | 身份/时间 citationIds | 状态 |
|---|---:|---|---|---|---|---|---|---|---|---|---|
| event-01-defense-context | 1 | 燕军受阻于潼关 | DEFENSE | 安禄山起兵约半年后（原书相对表述） | `null` | APPROXIMATE | UNKNOWN | `place-tongguan` | 唐军、燕军 | CIT-ANSHI25-CH08-P001-P003、CIT-ZZTJ218-R1996147-P00、CIT-ZZTJ218-R1996147-P01 | APPROVED |
| event-02-yan-westward | 2 | 燕军推进至潼关前 | MARCH | 洛阳失守后至潼关防线形成 | `null` | APPROXIMATE | UNKNOWN | `place-luoyang`、`place-shanzhou`、`place-tongguan` | 唐军、燕军 | CIT-ANSHI25-CH04-P018、CIT-ANSHI25-CH05-P018-P023、CIT-ZZTJ217-R783496-P01、CIT-ZZTJ217-R783496-P02 | APPROVED |
| event-03-decision-to-advance | 3 | 唐廷催令唐军出关 | POLITICAL | 唐军出关前的命令过程至实际出关（传统纪日未换算） | `null` | APPROXIMATE | UNKNOWN | `place-tongguan` | 唐廷、哥舒翰、郭子仪、李光弼 | CIT-ZZTJ218-R1996147-P01、CIT-ANSHI25-CH09-P001-P003 | APPROVED |
| event-04-lingbao-engagement | 4 | 唐燕军战于灵宝西原 | BATTLE | 唐军出关后、潼关失守前（传统纪日未换算） | `null` | APPROXIMATE | UNKNOWN | `place-lingbao` | 唐军、燕军 | CIT-ZZTJ218-R1996147-P02、CIT-ANSHI25-CH09-P015-P020、CIT-ANSHI25-CH09-P025-P026 | APPROVED |
| event-05-tongguan-fall | 5 | 燕军攻克潼关 | CAPTURE | 灵宝西原交战后（传统纪日未换算） | `null` | APPROXIMATE | UNKNOWN | `place-tongguan` | 唐军、燕军、哥舒翰、火拔归仁 | CIT-ZZTJ218-R1996147-P02、CIT-ANSHI25-CH10-P001-P004 | APPROVED |
| event-06-changan-consequence | 6 | 玄宗离开后燕军占领长安 | CAPTURE | 潼关失守后至燕军占领长安（传统纪日未换算） | `null` | APPROXIMATE | UNKNOWN | `place-changan` | 唐玄宗、唐廷、燕军 | CIT-ZZTJ218-R1996147-P03、CIT-ANSHI25-CH10-P005-P008、CIT-ANSHI25-CH10-P036-P038 | APPROVED |

### 3.4 Event Claim 候选

| claimId | entityId | 字段路径/展示位置 | 项目归纳候选 | citationIds | 观点类型 | 可信度 | 审核边界 | 状态 |
|---|---|---|---|---|---|---|---|---|
| claim-event-01-summary-modern-01 | event-01-defense-context | `Event.summary` | 出关前，燕军数月未能突破潼关，河北方向和北向联络也承受压力；哥舒翰、郭子仪、李光弼主张继续固守潼关，等待燕军态势进一步恶化。 | CIT-ANSHI25-CH08-P001-P003、CIT-ZZTJ218-R1996147-P00、CIT-ZZTJ218-R1996147-P01 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定摘要；只归纳现代研究与固定修订一手转录共同支持的态势与固守意见，不采用精确纪日、兵力、伤亡或引语措辞，不写成唯一史实 | APPROVED |
| claim-event-01-why-modern-01 | event-01-defense-context | `Event.whyItMatters` | 潼关的固守阻止燕军直接继续进入关中，并为河北等方向的战局发展争取时间；因此“继续固守还是出关”成为本叙事下一阶段的关键转折。 | CIT-ANSHI25-CH05-P018-P023、CIT-ANSHI25-CH08-P001-P003、CIT-ZZTJ218-R1996147-P01 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定叙事作用；不支持关城坐标、防线范围、路线几何或对出关责任的判断 | APPROVED |
| claim-event-02-summary-modern-01 | event-02-yan-westward | `Event.summary` | 燕军渡过黄河后攻占陈留、洛阳，继续向西推进；唐军由陕郡退守潼关，燕军随后驻于陕郡并受阻于潼关。 | CIT-ANSHI25-CH04-P018、CIT-ANSHI25-CH05-P018-P023、CIT-ZZTJ217-R783496-P01、CIT-ZZTJ217-R783496-P02 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准只表达宏观节点顺序；不生成精确路径，不沿现代道路绘制，不采用速度、距离、坐标或标准化日期 | APPROVED |
| claim-event-02-why-modern-01 | event-02-yan-westward | `Event.whyItMatters` | 这一推进使唐军的正面防御节点由洛阳、陕郡收缩至潼关，并形成下一阶段围绕潼关固守或出关的叙事背景。 | CIT-ANSHI25-CH05-P018-P023、CIT-ZZTJ217-R783496-P02 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准只作事件间叙事衔接；不采用地形或后勤的单一因果解释，不生成路线几何，不作责任判断 | APPROVED |
| claim-event-03-summary-modern-01 | event-03-decision-to-advance | `Event.summary` | 《资治通鉴》记载，唐廷在收到关于陕郡燕军兵少且无备的报告后催令哥舒翰进兵；哥舒翰表示应继续固守，郭子仪、李光弼亦上言不宜轻出，朝廷继续催促后，唐军最终引兵出关。 | CIT-ZZTJ218-R1996147-P01、CIT-ANSHI25-CH09-P001-P003 | PRIMARY_RECORD | UNKNOWN | `banq` 于 2026-07-31 批准该限定转述；只采用固定修订所载的报告、异议、催令与出关顺序，不把所报告的敌情当作已证事实，不采用精确传统纪日、兵力、直接引语、粮运/军政单一因果或责任判断 | APPROVED |
| claim-event-03-why-modern-01 | event-03-decision-to-advance | `Event.whyItMatters` | 这一命令过程使叙事由潼关固守转入唐军出关行动，并直接衔接后续灵宝方向交战。 | CIT-ZZTJ218-R1996147-P01、CIT-ANSHI25-CH09-P001-P003 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定叙事作用；只作事件间衔接，不生成 RouteSegment、精确路径、坐标或战场范围，也不判定出关决策的唯一原因或责任 | APPROVED |
| claim-event-04-summary-modern-01 | event-04-lingbao-engagement | `Event.summary` | 《资治通鉴》记载，唐军在灵宝西原遇燕军，燕军据守南近山、北临河的狭窄通道；双方交战后，唐军溃败。 | CIT-ZZTJ218-R1996147-P02、CIT-ANSHI25-CH09-P015-P020、CIT-ANSHI25-CH09-P025-P026 | PRIMARY_RECORD | UNKNOWN | `banq` 于 2026-07-31 批准该限定摘要；只归纳地点名称、相对地形、交战和唐军溃败。`place-lingbao` 只是 `DISPUTED` 的现代同名居民点叙事锚点，不是战场坐标；不采用传统纪日、兵力、伤亡、路线、秦函谷关景区对应、部署/火攻/风向重建或责任判断 | APPROVED |
| claim-event-04-why-modern-01 | event-04-lingbao-engagement | `Event.whyItMatters` | 这场战败结束了唐军由潼关出关后的推进，并形成后续败退与潼关失守的直接叙事衔接。 | CIT-ZZTJ218-R1996147-P02 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定叙事作用；只说明编年叙事中的前后顺序，不把潼关失守并入本 Event，不生成 RouteSegment、精确路径、坐标或战场范围，也不解释唯一败因 | APPROVED |
| claim-event-05-summary-modern-01 | event-05-tongguan-fall | `Event.summary` | 《资治通鉴》记载，灵宝西原战败后，哥舒翰回到潼关一带收集散卒；火拔归仁等随后控制哥舒翰并将其带走，崔乾祐继而进攻并攻克潼关。 | CIT-ZZTJ218-R1996147-P02、CIT-ANSHI25-CH10-P001-P004 | PRIMARY_RECORD | UNKNOWN | `banq` 于 2026-07-31 批准该限定摘要；只归纳收集散卒、主帅被控制带走及燕军攻克潼关的顺序，不采用传统纪日、兵力、伤亡、精确间隔、直接引语、行进路线，也不声称主帅被控制是失守的唯一原因 | APPROVED |
| claim-event-05-why-modern-01 | event-05-tongguan-fall | `Event.whyItMatters` | 潼关被攻克，使此前阻挡燕军继续进入关中的关键防御节点失去控制，并直接衔接后续长安局势变化。 | CIT-ZZTJ218-R1996147-P02、CIT-ANSHI25-CH10-P001-P004 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定叙事作用；只说明潼关战略作用和事件间衔接，不把灵宝战败并入本 Event，不生成关防范围、RouteSegment、精确路径、坐标或失守原因判断 | APPROVED |
| claim-event-06-summary-modern-01 | event-06-changan-consequence | `Event.summary` | 《资治通鉴》记载，潼关失守后唐玄宗离开长安；燕军得知后先留兵潼关，随后另遣军队进入并占领长安。 | CIT-ZZTJ218-R1996147-P03、CIT-ANSHI25-CH10-P005-P008、CIT-ANSHI25-CH10-P036-P038 | PRIMARY_RECORD | UNKNOWN | `banq` 于 2026-07-31 批准只归纳两个先后节点，不把离城与占领写成同一天；不采用精确传统纪日、精确间隔、兵力、离城或入城路线/地点、恐慌原因、动机、占领后部署或直接引语。`place-changan` 只作 `DISPUTED` 的现代展示地标叙事锚点，不是事件点 | APPROVED |
| claim-event-06-why-modern-01 | event-06-changan-consequence | `Event.whyItMatters` | 这一阶段使叙事由潼关防线失守转入长安失去唐廷控制，并构成缩小版 MVP 叙事切片的终点。 | CIT-ZZTJ218-R1996147-P03、CIT-ANSHI25-CH10-P005-P008、CIT-ANSHI25-CH10-P036-P038 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准只说明控制变化和产品叙事终点；不解释唯一因果，不把灵宝交战或潼关失守并入本 Event，不生成 RouteSegment、路线、城界、坐标或战场范围 | APPROVED |

### 3.5 Place、Geography 与 RoutePlan Claim 候选

| claimId | entityType | entityId | 字段路径/展示位置 | 项目归纳候选 | citationIds | 观点类型 | 可信度 | 审核边界 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| claim-place-tongguan-strategic-role-modern-01 | Place | place-tongguan | `Place.strategicRole` | 潼关在本叙事中是陕郡以西、进入关中的关键防御节点；其失守改变了长安方向的防务条件。 | CIT-ANSHI25-CH05-P018-P023、CIT-ANSHI25-CH08-P001-P003、CIT-ANSHI25-CH10-P001-P004 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定表述；不支持唐代关城坐标、关防范围、现代景区对应或其他未经审核的因果扩展 | APPROVED |
| claim-place-tongguan-site-dispute-modern-01 | Place | place-tongguan | `Place.summary` | 当前可访问资料足以确认“潼关故城”是唐至明遗址名称，但不足以把现存明代城址、秦东镇古城景区或任一网络 POI 直接认定为 755—756 年叙事所需的唐代关城点位；1992 年县志、地方文物志转载与新华社报道对唐代城址和后世城址关系的表述需要进一步对校。 | CIT-GOV-NCH7-0453、CIT-SXWWZ-TONGGUAN、CIT-XINHUA-TONGGUAN-SITES、CIT-TGXZ1992-P418-P420、CIT-TGXZ1992-P632-P633 | DISPUTE | UNKNOWN | `banq` 于 2026-07-31 批准作为缩小版不确定性摘要；不得把现代遗址代表点表述成已确认的唐城中心 | APPROVED |
| claim-place-tongguan-coordinate-candidate-01 | Place | place-tongguan | `Place.coordinateNote` 候选 | 候选点 `[110.2909781, 34.6035548]` 是 OpenStreetMap `way/1195138308` v3 所标“潼关古城”遗址范围的可复现平面多边形质心。县志第 632—633 页把该类黄、渭河交汇处南岸旧城遗址与唐天授二年建关联系起来，但新华社另称唐城位于麟趾塬；因此该点只代表现代地图中的旧城遗址范围，不是已确认的 755—756 年唐代关城中心。 | CIT-TGXZ1992-P632-P633、CIT-XINHUA-TONGGUAN-SITES、CIT-OSM-W1195138308-V3 | DISPUTE | DISPUTED | `banq` 于 2026-07-31 接受作为缩小版 MVP 的“现代旧城遗址代表点”；必须保持可见不确定性说明，不得称为已确认的唐城中心 | APPROVED |
| claim-place-lingbao-scope-modern-01 | Place | place-lingbao | `Place.summary` | 本叙事中的“灵宝”指灵宝西原一带的战场区域，而不是现代灵宝市中心单点；现有材料只支持南近山、北临黄河的狭窄通道这一相对地形关系。 | CIT-ANSHI25-CH09-P015-P020 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定表述；不把秦函谷关景区、现代灵宝市中心或任一网络 POI 直接认定为战场，坐标和范围均保持空白 | APPROVED |
| claim-place-lingbao-strategic-role-modern-01 | Place | place-lingbao | `Place.strategicRole` | 灵宝西原方向在本叙事中是唐军出关后与燕军交战、并由推进转入溃败的关键节点。 | CIT-ZZTJ218-R1996147-P02、CIT-ANSHI25-CH09-P015-P020、CIT-ANSHI25-CH09-P025-P026 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定叙事作用；只说明本叙事中的节点作用，不确认精确战场、坐标、边界、路线、部署、兵力、败因或责任 | APPROVED |
| claim-place-lingbao-coordinate-candidate-01 | Place | place-lingbao | `Place.coordinateNote` 候选 | 候选 `[110.872607, 34.615468]` 来自灵宝市政府公示环境报告中名为“稠桑原”的现代居民点。五个居民点与三个厂址锚点的成组技术核验支持把报告原值直接作为 OGC:CRS84 候选，排除 GCJ-02 转换；但报告未书面声明 WGS84 或 CGCS2000。它只代表现代同名地理线索，不是已确认的灵宝西原或 756 年战场中心。 | CIT-LB-EIA-P25-CHOUSANGYUAN、CIT-ESRI-WORLD-IMAGERY-LINGBAO-20260731 | FACT | DISPUTED | `banq` 于 2026-07-31 批准该原值候选、技术核验和使用边界；候选必须保持 `DISPUTED`，不得生成历史区域、缓冲区或路线，不得把六位小数解释为已证明的亚米精度 | APPROVED |
| claim-place-shanzhou-strategic-role-modern-01 | Place | place-shanzhou | `Place.strategicRole` | 本书中的“陕郡”既是洛阳与潼关之间的前沿节点，也是黄河粮运和陆路转运的瓶颈区域。 | CIT-ANSHI25-CH05-P018-P023、CIT-ANSHI25-CH08-P025-P033 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定表述；只归纳本书对军事推进和转运作用的叙述，不把“瓶颈”扩展成精确港口、仓址、航道或因果定论 | APPROVED |
| claim-place-shanzhou-scope-modern-01 | Place | place-shanzhou | `Place.summary` | 本叙事中的“陕州/陕郡”指唐代以陕县为治所的州郡节点，现代对应为三门峡市湖滨区陕州故城（陕县老城）一带，不是今天陕州区政府驻地；现有资料不足以恢复 755—756 年的城中心或城界。 | CIT-HADA-BAOLUN-20210824、CIT-SMXRB-SHANZHOU-20260114 | DISPUTE | DISPUTED | `banq` 于 2026-07-31 批准该限定摘要；CHGIS 只作非商业内部交叉核对，不作为该公开摘要的直接 Citation，也不复用其坐标；现存明清城墙范围不等同唐代城界 | APPROVED |
| claim-place-shanzhou-coordinate-candidate-01 | Place | place-shanzhou | `Place.coordinateNote` 候选 | 候选点 `[111.1488645, 34.7915940]` 是 OpenStreetMap `node/12768197183` v1 所标现代宝轮寺塔位置。河南档案信息网把该塔定位在陕州故城东南部，因此该点只作为现代故城内部地标代表点，不是已确认的 755—756 年陕郡治所中心。 | CIT-HADA-BAOLUN-20210824、CIT-OSM-N12768197183-V1、CIT-SMXRB-SHANZHOU-20260114 | DISPUTE | DISPUTED | `banq` 于 2026-07-31 接受为缩小版 MVP 的现代故城内部地标代表点；必须署名 OpenStreetMap，不生成城界、路线或缓冲区，不使用 CHGIS 州级点 `hvd_115770`，不把宝轮寺塔本身描述为安史之乱事件地点 | APPROVED |
| claim-place-luoyang-strategic-role-modern-01 | Place | place-luoyang | `Place.strategicRole` | 本书将洛阳描述为城防、仓储和漕运节点；其失守使燕军获得物资，并切断长安原有粮运链的重要部分。 | CIT-ANSHI25-CH05-P006-P014、CIT-ANSHI25-CH08-P025-P033 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定表述；只归纳本书的城防、仓储和漕运作用，不批准兵力、精确仓址、运输路线或作者对失守责任的判断 | APPROVED |
| claim-place-luoyang-scope-modern-01 | Place | place-luoyang | `Place.summary` | 本叙事中的“洛阳”指安史之乱初期的东都及其所在的隋唐洛阳城；该城址以洛水贯穿其间，主要分布在今洛阳市西工区、老城区、瀍河区和洛龙区，不能用单一现代城市中心点替代。现有候选不恢复 755—756 年的完整城界。 | CIT-ANSHI25-CH05-P006-P014、CIT-NDRC-SUITANG-LUOYANG-20201021 | DISPUTE | DISPUTED | `banq` 于 2026-07-31 批准该限定摘要；不使用现代洛阳市中心点替代历史城址，不把国家历史文化公园或约 47 平方公里的现代概述直接复制为正式城界 | APPROVED |
| claim-place-luoyang-coordinate-candidate-01 | Place | place-luoyang | `Place.coordinateNote` 候选 | 候选点 `[112.4545867, 34.6769987]` 是 OpenStreetMap `way/865951589` v4 所标现代应天门展示建筑范围的平面多边形质心。国家发展改革委网页把应天门明确为隋唐洛阳城宫城正南门并说明其保护展示工程，因此该点只作为现代遗址展示地标代表点，不是 755—756 年洛阳城中心、城界或事件发生点。 | CIT-NDRC-SUITANG-LUOYANG-20201021、CIT-OSM-W865951589-V4 | DISPUTE | DISPUTED | `banq` 于 2026-07-31 接受为缩小版 MVP 的现代遗址展示地标代表点；必须署名 OpenStreetMap，保留固定 way 和节点版本，不生成城界、路线或缓冲区，不把展示建筑范围当作唐代城门原状 | APPROVED |
| claim-place-changan-strategic-role-modern-01 | Place | place-changan | `Place.strategicRole` | 本书强调长安作为首都对关东粮运存在依赖；潼关失守后，长安出现恐慌、皇帝离城，随后被燕军占领。 | CIT-ANSHI25-CH08-P025-P033、CIT-ANSHI25-CH08-P034-P040、CIT-ANSHI25-CH10-P005-P008、CIT-ANSHI25-CH10-P036-P038 | MODERN_RESEARCH | UNKNOWN | `banq` 于 2026-07-31 批准该限定表述；只归纳本书对首都粮运依赖与失守后局势变化的叙述，不批准精确日期、路线、出城或入城地点，也不支持唐长安城坐标或城址范围 | APPROVED |
| claim-place-changan-scope-modern-01 | Place | place-changan | `Place.summary` | 本叙事中的“长安”指隋大兴城基础上形成的唐长安城；其绝大部分遗迹叠压在现代西安城区之下，不能用现代西安市中心或现存明城墙范围替代。现有候选不恢复 755—756 年的完整城界。 | CIT-XADFZ-TANG-CHANGAN-20250827 | DISPUTE | DISPUTED | `banq` 于 2026-07-31 批准该限定摘要；官方网页中的现代对应范围只作文字说明，不转成正式 Polygon，不把仍存或展示的单个遗址当作整座唐长安城 | APPROVED |
| claim-place-changan-coordinate-candidate-01 | Place | place-changan | `Place.coordinateNote` 候选 | 候选点 `[108.9594728, 34.2828248]` 是 OpenStreetMap `way/280412702` v4 所标现代丹凤门建筑范围的平面多边形质心。西安市地方志办公室把丹凤门列入唐长安城遗址，陕西省文物局把大明宫描述为唐长安城宫殿和权力中心并区分丹凤门遗址展示设施，因此该点只作为现代大明宫遗址展示地标代表点，不是 755—756 年长安城中心、城界或具体事件发生点。 | CIT-XADFZ-TANG-CHANGAN-20250827、CIT-SXWWJ-DAMING-PALACE-20121130、CIT-OSM-W280412702-V4 | DISPUTE | DISPUTED | `banq` 于 2026-07-31 批准该代表点；必须署名 OpenStreetMap，保留固定 way 和节点版本，不生成城界、路线或缓冲区，不把展示建筑范围当作唐代丹凤门原状 | APPROVED |
| claim-geography-yellow-river-role-modern-01 | Geography | geography-yellow-river | 后续历史作用候选 | 本书把黄河同时描述为灵宝战场北侧边界、唐军运输与救援通道，以及溃败时难以泅渡的障碍。 | CIT-ANSHI25-CH09-P015-P020、CIT-ANSHI25-CH09-P027-P042 | MODERN_RESEARCH | UNKNOWN | 不纳入缩小版 `Geography.summary`；保留供未来历史作用审核，不表示该说法被判定为错误 | REJECTED |
| claim-geography-qinling-role-modern-01 | Geography | geography-qinling | 后续历史作用候选 | 本书称灵宝战场南侧受秦岭余脉和山地限制，并将跨越秦岭的替代运输线描述为高成本通道。 | CIT-ANSHI25-CH08-P034-P040、CIT-ANSHI25-CH09-P015-P020 | MODERN_RESEARCH | UNKNOWN | 不纳入缩小版 `Geography.summary`；保留供未来历史作用审核，不表示该说法被判定为错误 | REJECTED |
| claim-geography-yellow-river-background-01 | Geography | geography-yellow-river | `Geography.summary` | 本图使用 Natural Earth v5.0.0 已选黄河源线段作为现代概览水系背景；该线不主张完整覆盖同名河流，也不代表唐代河道。 | CIT-NE50-RIVERS-MVP | FACT | UNKNOWN | 缩小版选用；只陈述数据用途和年代边界，不支持历史事件、战场或路线判断 | APPROVED |
| claim-geography-wei-river-background-01 | Geography | geography-wei-river | `Geography.summary` | 本图使用 Natural Earth v5.0.0 已选渭河源线段作为现代概览水系背景；该线不主张完整覆盖同名河流，也不代表唐代河道。 | CIT-NE50-RIVERS-MVP | FACT | UNKNOWN | 缩小版选用；只陈述数据用途和年代边界，不支持历史事件、战场或路线判断 | APPROVED |
| claim-geography-qinling-background-01 | Geography | geography-qinling | `Geography.summary` | 本图使用 Natural Earth v5.0.0 已选秦岭广义区域作为现代山地背景；该 Polygon 不代表精确山界或唐代历史边界。 | CIT-NE50-QINLING-MVP | FACT | UNKNOWN | 缩小版选用；只陈述数据用途和精度边界，不支持历史战场或路线判断 | APPROVED |
| claim-geography-guanzhong-corridor-modern-01 | Geography | geography-guanzhong-corridor | `Geography.summary` | 本书材料可支持“洛阳—陕郡—灵宝/函谷旧址—潼关”之间存在受黄河与山地约束的东入关中通道这一叙事作用。 | CIT-ANSHI25-CH05-P018-P023、CIT-ANSHI25-CH09-P015-P020 | MODERN_RESEARCH | UNKNOWN | 缩小版 MVP 仅保留为后续叙事线索，不发布独立 Geography，不决定 `LineString` 或 `Polygon`，不提供宽度、坐标或几何处理依据 | PENDING_REVIEW |
| claim-route-yan-westward-plan-modern-01 | RoutePlan | route-yan-westward | 逻辑路线说明 | 《资治通鉴》固定修订与本书共同支持“洛阳—陕郡—潼关”的宏观节点顺序；项目据此将已批准的洛阳、陕州、潼关现代代表点按相邻节点分成两段直连，作为燕军向潼关方向推进的解释性示意。 | CIT-ANSHI25-CH04-P018、CIT-ANSHI25-CH05-P018-P023、CIT-ZZTJ217-R783496-P01、CIT-ZZTJ217-R783496-P02 | INFERENCE | LOW | `banq` 于 2026-07-31 批准只表达宏观顺序和方向；`appearAtEventId=event-02-yan-westward`，不沿现代道路，不增加中间节点，不采用距离、速度、渡口或精确日期。灵宝没有直接证据支持作为本路线节点，明确排除 | APPROVED |
| claim-route-yan-westward-segment-01-inference-01 | RouteSegment | route-yan-westward-01 | `RouteSegment.summary` | 本段以已批准的洛阳与陕州现代代表点直接连线，只表达燕军由洛阳向陕郡方向西进的宏观节点关系，不代表历史道路或行军轨迹。 | CIT-ANSHI25-CH04-P018、CIT-ZZTJ217-R783496-P01、CIT-ZZTJ217-R783496-P02、CIT-OSM-W865951589-V4、CIT-OSM-N12768197183-V1 | INFERENCE | LOW | `banq` 于 2026-07-31 批准该分段和处理方法；几何仅含应天门现代展示地标代表点 `[112.4545867, 34.6769987]` 与宝轮寺塔现代故城内部地标代表点 `[111.1488645, 34.7915940]` 两个端点，不插值、不路由，不主张唐代城中心、道路、渡口、里程或速度 | APPROVED |
| claim-route-yan-westward-segment-02-inference-01 | RouteSegment | route-yan-westward-02 | `RouteSegment.summary` | 本段以已批准的陕州与潼关现代代表点直接连线，只表达燕军由陕郡向潼关方向继续推进的宏观节点关系，不代表历史道路、攻关位置或行军轨迹。 | CIT-ANSHI25-CH05-P018-P023、CIT-ZZTJ217-R783496-P02、CIT-OSM-N12768197183-V1、CIT-OSM-W1195138308-V3 | INFERENCE | LOW | `banq` 于 2026-07-31 批准该分段和处理方法；几何仅含宝轮寺塔现代故城内部地标代表点 `[111.1488645, 34.7915940]` 与潼关现代旧城遗址代表点 `[110.2909781, 34.6035548]` 两个端点，不插值、不路由，不主张唐代城中心、关城、道路、攻关位置、里程或速度 | APPROVED |
| claim-route-tang-advance-plan-modern-01 | RoutePlan | route-tang-advance | 逻辑路线说明 | 《资治通鉴》固定修订与本书共同支持唐军从潼关出关、随后在灵宝西原方向交战；项目据此将已批准的潼关与灵宝现代代表点直接连线，作为唐军出关行动的解释性示意。 | CIT-ZZTJ218-R1996147-P01、CIT-ZZTJ218-R1996147-P02、CIT-ANSHI25-CH09-P001-P003、CIT-ANSHI25-CH09-P015-P020、CIT-ANSHI25-CH09-P025-P026 | INFERENCE | LOW | `banq` 于 2026-07-31 批准只表达潼关→灵宝的宏观方向；`appearAtEventId=event-03-decision-to-advance`，不沿现代道路，不增加中间节点，不采用距离、速度、精确日期或撤退路线。陕州、洛阳只属意图方向，未证明战败前实际到达，明确排除 | APPROVED |
| claim-route-tang-advance-segment-01-inference-01 | RouteSegment | route-tang-advance-01 | `RouteSegment.summary` | 本段以已批准的潼关与灵宝现代代表点直接连线，只表达唐军从潼关出关后向灵宝西原方向推进并发生交战的宏观关系，不代表历史道路、战场坐标、行军轨迹或溃败撤退路线。 | CIT-ZZTJ218-R1996147-P01、CIT-ZZTJ218-R1996147-P02、CIT-ANSHI25-CH09-P001-P003、CIT-ANSHI25-CH09-P015-P020、CIT-ANSHI25-CH09-P025-P026、CIT-OSM-W1195138308-V3、CIT-LB-EIA-P25-CHOUSANGYUAN、CIT-ESRI-WORLD-IMAGERY-LINGBAO-20260731 | INFERENCE | LOW | `banq` 于 2026-07-31 批准该分段和处理方法；几何仅含潼关现代旧城遗址代表点 `[110.2909781, 34.6035548]` 与灵宝现代“稠桑原”同名居民点锚点 `[110.872607, 34.615468]` 两个端点；不插值、不路由，不主张唐代关城、战场、道路、部署、行军轨迹、撤退线、里程或速度 | APPROVED |

### 3.5.1 RoutePlan 与 RouteSegment 基础字段候选

RoutePlan 只用于组织内容审核；正式数据模型实际保存下面逐段审核的 RouteSegment。所有字段仍为候选，不表示已经进入正式数据。

| routeId | routeName | side | actionType | appearAtEventId | 宏观节点顺序 | certainty | 状态 |
|---|---|---|---|---|---|---|---|
| route-yan-westward | 燕军向潼关方向推进（示意） | YAN | ADVANCE | event-02-yan-westward | `place-luoyang` → `place-shanzhou` → `place-tongguan` | LOW | APPROVED |
| route-tang-advance | 唐军出关行动（示意） | TANG | ADVANCE | event-03-decision-to-advance | `place-tongguan` → `place-lingbao` | LOW | APPROVED |

| segmentId | routeId | segmentNo | fromPlaceId | toPlaceId | appearAtEventId | geometry | summary claimId | certainty | 状态 |
|---|---|---:|---|---|---|---|---|---|---|
| route-yan-westward-01 | route-yan-westward | 1 | place-luoyang | place-shanzhou | event-02-yan-westward | `[112.4545867, 34.6769987]` → `[111.1488645, 34.7915940]` 两点直连 | claim-route-yan-westward-segment-01-inference-01 | LOW | APPROVED |
| route-yan-westward-02 | route-yan-westward | 2 | place-shanzhou | place-tongguan | event-02-yan-westward | `[111.1488645, 34.7915940]` → `[110.2909781, 34.6035548]` 两点直连 | claim-route-yan-westward-segment-02-inference-01 | LOW | APPROVED |
| route-tang-advance-01 | route-tang-advance | 1 | place-tongguan | place-lingbao | event-03-decision-to-advance | `[110.2909781, 34.6035548]` → `[110.872607, 34.615468]` 两点直连 | claim-route-tang-advance-segment-01-inference-01 | LOW | APPROVED |

### 3.6 书内示意图的审核边界

| 资源 | EPUB 定位 | 可用于人工核对的内容 | 当前不能做什么 | 状态 |
|---|---|---|---|---|
| 图 8“漕运路线示意图” | `OEBPS/text/part0008.html#img8`；`OEBPS/images/pic_8.1.jpg` | 理解作者对水运、陆运和山地转运关系的表达 | 不得直接复制为地图图层，不得反推路线坐标 | PENDING_REVIEW |
| 图 9“灵宝之战战场情况和战前布置示意图” | `OEBPS/text/part0009.html#img9`；`OEBPS/images/pic_9.1.jpg` | 理解作者所画黄河、山地和双方部署的相对关系 | 图为示意图且未见开放许可证；不得地理配准、描线或当作精确战场图 | PENDING_REVIEW |
| 图 10“灵宝之战过程示意图” | `OEBPS/text/part0009.html#img10`；`OEBPS/images/pic_9.2.jpg` | 理解作者对战役过程的图示重建 | 不得生成 RouteSegment、兵力位置或精确路线 | PENDING_REVIEW |

版权页署名“绘图：许汉卿”，但 EPUB 中未发现允许复用或改编这些图的开放许可证。图片只能作为内部内容审核线索；若未来需要从中派生空间数据，必须另行取得许可并由人工记录几何来源、处理过程和可信度。

### 3.7 本轮仍缺少的材料

- 本书只能作为现代研究来源候选，不能替代项目要求的正史/编年史版本核对。
- 长安、洛阳、陕州、灵宝与潼关各有一个已人工接受、必须保持 `DISPUTED` 的现代遗址、展示地标或同名居民点代表点；两条示意行动方向的分段几何仍未获得来源。`geography-guanzhong-corridor` 已由用户确认推迟，不再阻断缩小版 MVP。
- 黄河、渭河、秦岭的 Natural Earth 现代概览几何、直接来源链和保守展示摘要已由 `banq` 于 2026-07-31 批准，因此三个 Geography 具备缩小版发布条件；它们仍不能替代唐代河道、古址或战场空间依据。
- `geography-wei-river` 未找到足以形成历史叙事作用 Claim 的直接材料，因此缩小版只采用现代背景说明；黄河和秦岭原有的历史作用候选也明确排除出缩小版，保留供未来审核。
- 潼关现有官方名单、地方文物志转载、新华社报道、1992 年《潼关县志》和 OpenStreetMap v3 遗址范围共 5 个专项来源。它们足以形成一个可复现、但存在城址争议的现代旧城遗址代表点候选；若要把可信度提升到可确认的 755—756 年唐城点位，仍应取得艾冲〈古代潼关城址的变迁〉（《历史地理》第十八辑，目录起始页 122）全文或考古报告。
- 兵力、战术、出关原因和战损等内容包含作者重建或争议性解释，必须由内容负责人决定是否采用、降低可信度或并列其他观点。
- 《资治通鉴》与《旧唐书》的维基文库固定修订只解决了在线稳定定位；尤其《旧唐书》页面标示转录质量仅 25%，正式采用前必须对校权威整理本。
- 用户新增的 4 本书目前只有书目信息，未取得实际版权页、正文和页码，不能生成 Citation 或 Claim。
- 下方地点清单中潼关、陕州、洛阳、长安、灵宝已经完成坐标候选、地点摘要及各自直接来源链的人工批准；除灵宝不额外编写战略作用外，其余四地的限定战略作用也已批准。五个 Place 实体状态均为 `APPROVED`。其余事件和路线仍保留各自状态，不能因单项进展而一并升级。
- 灵宝摘要已按固定哈希 EPUB 的 `part0009.html#body-p015`—`body-p020` 重新核对，并用《资治通鉴》公开转录和《读史方舆纪要》卷四十八交叉检查“灵宝西原、南山、黄河、狭道”的相对关系；`banq` 于 2026-07-31 批准该限定文字摘要。现代“稠桑原”坐标已通过成组技术核验排除 GCJ-02 转换，并由 `banq` 于 2026-07-31 批准为必须保持 `DISPUTED` 的现代同名居民点代表点；这不证明 756 年战场中心，也不生成历史范围或路线。

### 3.8 Natural Earth 空间候选处理记录

- 候选输出：`data/curated/spatial/anshi-natural-earth-v5.0.0.geojson`
- 可复现脚本：`scripts/prepare-anshi-spatial-candidates.mjs`
- 原始坐标系：Natural Earth GeoJSON 标示的 `OGC:CRS84`，坐标顺序为经度、纬度；本轮未重投影。
- 处理：只按源数据属性选择要素；不裁剪、不简化、不按视觉描线。
- 黄河：按 WGS84 球面大圆距离取 `dissolve=66River` 的最长部分，并只拼接 `dissolve=95River` 中与其端点完全相等的部分；删除一个重复共享端点，不添加过渡坐标。这里只证明已选源线段未经裁剪，不主张它们完整覆盖同名河流。
- 渭河：`dissolve=873River` 只有一个线段，去除外层 `MultiLineString` 包装后保留全部 273 个源坐标。
- 秦岭：按 `NE_ID=1159103573`、`WIKIDATAID=Q863798`、`NAME_ZH=秦岭` 选取源 Polygon，保留全部 88 个源坐标。
- 覆盖范围记录：每个候选要素写入 `bbox`、源部分/环数量与坐标数；河流另写起止坐标。它们用于核查固定源要素和已选线段，不是历史位置或历史边界的证据。
- `banq` 于 2026-07-31 批准三个输出几何作为现代广义概览背景，状态为 `APPROVED`、`certainty=UNKNOWN`；批准不改变限制说明，也不表示唐代精确河道或边界。生成脚本写入相同审核署名和日期，确保批准元数据可复现。

复现命令（输入文件必须与登记的 SHA-256 一致）：

```bash
node scripts/prepare-anshi-spatial-candidates.mjs \
  /path/to/ne_10m_rivers_lake_centerlines.geojson \
  /path/to/ne_10m_geography_regions_polys.geojson \
  data/curated/spatial/anshi-natural-earth-v5.0.0.geojson
```

### 3.9 潼关古址网络线索的采用边界

- 官方文保名单只把“潼关故城”登记为唐至明遗址并定位到潼关县，不能据此选择唐代关城中心点。
- 用户提供的 1992 年《潼关县志》已完成文件哈希、版权页、印刷页码和相关页面渲染核对。县志第 632—633 页把黄、渭河交汇处南岸的一处旧城遗址记作唐天授二年建关、后世扩建；第 418—420 页另给出迁关叙述和“潼关旧城示意图”。该示意图没有坐标，且主要反映后世旧城形态，不作地理配准或描线。
- 陕西省文物志转载称唐天授二年“于现址”建城，同时明确现存遗存主要为明洪武城址；1992 年县志也把黄、渭交汇处南岸旧城与 691 年建关联系起来。新华社报道则把汉、唐故城描述为麟趾塬高地上的相邻遗址，并称后世城址向山下秦东镇一带迁移。三者不能在未经对校时合并成一个确定唐城点位。
- OpenStreetMap `way/1195138308` v3 提供一个现代“潼关古城”遗址范围。候选输出按 67 个节点引用（66 个唯一节点）的经纬度平面多边形质心计算，未裁剪、简化或重投影，结果为 `[110.2909781, 34.6035548]`，并确认质心位于源环内。该点只代表现代 OSM 遗址范围，必须标为 `DISPUTED`。
- Wikidata `Q6757995` 的坐标只引用英文维基百科，未提供独立历史地理证据，本轮不采用。CHGIS 的潼关厅点位对应 1747—1911 年行政治所且为 CC BY-NC 4.0，只用于内部交叉核对，不写入公开候选文件。
- 坐标候选保存在 `data/curated/spatial/anshi-place-candidates.geojson`。`banq` 于 2026-07-31 接受将其作为“现代旧城遗址代表点”并保留显著不确定性，同时批准对应的 `Place.summary` 冲突说明、限定的 `Place.strategicRole` 和各自直接来源链；代表点不得称为正式唐城坐标。

### 3.10 灵宝“稠桑原”坐标线索的采用边界

- 灵宝市政府 2025-01-03 公示的环境影响报告在表 2.6-1 中把“稠桑原”列为现代人群环境保护目标，原表经度、纬度分别为 `110.872607`、`34.615468`；PDF 第 317 页附图 3也标出同名居民点。
- 报告 PDF 已按 SHA-256 `17a8686f127887f180943f004c6db251161ca8585183a1fd7811a7660de7f582` 固定，并完成 PDF 第 30 页原表、第 101 页厂区西南角坐标、第 124 页监测点坐标、第 253 页建设项目坐标和第 317 页附图的渲染核对。报告仍未书面声明坐标参考系。
- 本项目将该单个公开坐标按单项事实数据引用处理，`licenseReviewed=不适用`，不再要求为这一单点取得开放许可证；必须保留报告、页码和表号引用，不复制原表、附图或其编排。该判断不自动扩展到批量提取、整表、图像或派生图层复用。
- 2026-07-31 的 OpenStreetMap 精确名称查询未找到坡寨村、坡寨村后城子组、原门上、稠桑原或雷家沟村要素；附近查询只找到 `函谷关镇` 节点 `3157352047` v4，不能用该镇点代替任一居民点或战场。OSM 结果因此不参与原值/转换值选择。
- 技术核验从表 2.6-1 取坡寨村、坡寨村后城子组、原门上、稠桑原、雷家沟村五个居民点，再用报告第 101、124、253 页三个相互接近的厂址坐标作锚点。同时测试“原值直接叠加 EPSG:4326 影像”与“把原值视为 GCJ-02 后转换为 WGS84”两种假设。转换会使八个样本整体西南移约 `517.7—518.0m`。
- 独立底图使用 Esri World Imagery：item `10df2279f9684e4a9f6a7f08febac2a9`、MapServer `currentVersion=11.3`，灵宝范围的影像 citation 为 Vantor Vivid，采集日期 2025-08-19、分辨率 0.34m、标示精度 5m、发布批次 `Raster Basemaps 2026.R05`。本次临时 EPSG:4326 导出范围为 `[110.855, 34.600, 110.925, 34.642]`、1800×1080，SHA-256 为 `c710bc4c093c555994ca5d36773a81f318e8e754855f59a5303ceecf97589020`；影像及截图不进入仓库。
- 五个居民点中，坡寨村后城子组、原门上、稠桑原三个可区分样本支持原值直接叠加；坡寨村和雷家沟村因两种候选附近均可见聚落而记为歧义，没有样本支持 GCJ-02 转换。更强的厂址锚点也支持原值：原值位于坡寨村东侧、可见填埋设施北侧，符合报告“西侧 123 米为坡寨村、南侧为生活垃圾填埋场”的文字；GCJ-02 转换后厂址整体移入坡寨村聚落，与报告现场关系冲突。
- 据此，GCJ-02 转换假设被排除，报告原值登记为与 WGS84 / CGCS2000 兼容的未移动经纬度，并作为 `OGC:CRS84` 候选写入 `data/curated/spatial/anshi-place-candidates.geojson`。技术记录和复算结果见 `data/curated/spatial/lingbao-crs-technical-review.json`，可用 `node scripts/verify-lingbao-crs-candidate.mjs --check` 验证。
- 本方法仍不能区分 WGS84 与 CGCS2000；二者差异小于本项目地图尺度和本次可核验精度。来源中的六位小数只表示抄录精度，不表示亚米级准确度。该残余不确定性必须保留在 `coordinateNote` 中。
- 坐标参考系技术硬阻塞已解除；`banq` 于 2026-07-31 批准该候选、两个直接 Source/Citation 和使用边界。候选只能标为现代同名居民点代表点并保持 `DISPUTED`；它不证明现代居民点与唐代灵宝西原、秦函谷关旧址或 756 年战场中心重合。该候选现已按上述限制进入正式 `mvp-v1.json`。

### 3.11 陕州故城代表点候选的采用边界

- EPUB `part0008.html#body-p025`—`body-p033` 已按固定 SHA-256 重新定位，只支持作者对洛阳—陕郡—长安粮运链、黄河航运瓶颈和陆路转运的叙述，不提供城址坐标、太原仓坐标或路线几何。
- CHGIS `hvd_83048` 的 source note 把陕县列为 742—757 年陕郡治所，并对应到今三门峡市崖底乡西北陕县老城。756 年按“陕州”名称检索返回的州级记录 `hvd_115770` 坐标与治所记录明显不同，且没有 source note；本轮将其视为州级行政对象点而非治所证据，明确不采用。
- CHGIS 页面声明 `CC BY-NC 4.0`。项目当前没有承诺仅限非商业使用，因此 CHGIS 只作内部历史地名交叉核对，不把它的坐标写入公开 GeoJSON 或正式 JSON。
- 三门峡日报转述地方文保主管部门信息，称陕州故城在唐宋城址基础上延续整修；河南档案信息网把宝轮寺塔定位为陕州故城（陕县老城）东南部。两者可支持选择一个现代故城内部地标，但不能恢复唐代城中心或城界。
- OpenStreetMap `node/12768197183` v1 把宝轮寺塔记录为点 `[111.1488645, 34.7915940]`，固定 XML SHA-256 为 `aeab32fa9a89440ccec25386e2908d10b386e49ff2ce1be9f8d7862b5c620514`。该节点原生为 WGS84 / OGC:CRS84，经度、纬度顺序直接保留；未裁剪、简化、重投影、计算质心或生成缓冲区。
- 候选写入 `data/curated/spatial/anshi-place-candidates.geojson`，可信度为 `DISPUTED`。`banq` 于 2026-07-31 接受它作为“现代故城内部地标代表点”；不得称为 755—756 年陕郡治所中心、太原仓位置、交战地点或路线节点。

### 3.12 洛阳应天门代表点候选的采用边界

- EPUB `part0005.html#body-p006`—`body-p014` 只支持作者对洛阳城防、含嘉仓及失守后果的解释；`part0008.html#body-p025`—`body-p033` 只支持洛阳—陕郡—长安粮运链的作者归纳。两者均不提供古城坐标、城界或路线几何。
- 国家发展改革委 2020-10-21 网页称隋唐洛阳城“洛水贯其中”，遗址总面积约 47 平方公里，主要分布在今洛阳市西工区、老城区、瀍河区和洛龙区，并说明其由宫城、皇城、东城、含嘉仓城、郭城和西苑组成；同页明确应天门是隋唐洛阳城宫城正南门，2019 年建成遗址保护展示工程。该网页只能支持历史城址与现代展示地标的对应边界，不能把约 47 平方公里概述直接转成正式 Polygon。
- OpenStreetMap `way/865951589` v4 把应天门记录为闭合建筑范围，标签为 `historic=city_gate`、`name=应天门`。固定 way XML SHA-256 为 `bad02c638aab184fdfb0847fa58ce2ba63f798b011e24b08ec51d81e0b3ab4ee`；本次 full XML SHA-256 为 `698a1cee5f886d843b9c1e3c3459ddbd4dac1c4f150733ee2a544ee555dac8f8`，含 22 个节点引用、21 个唯一节点，其中 20 个节点为 `v2`、1 个为 `v1`。
- 源环 bbox 为 `[112.4536587, 34.6765044, 112.4555557, 34.6774965]`。直接按 OGC:CRS84 经度、纬度顺序使用平面多边形质心公式，四舍五入至 7 位小数得到 `[112.4545867, 34.6769987]`；已验证点在源环内。未裁剪、简化、重投影、生成缓冲区或推导城界。
- 候选写入 `data/curated/spatial/anshi-place-candidates.geojson`，可信度为 `DISPUTED`。`banq` 于 2026-07-31 接受它作为“现代应天门遗址展示地标代表点”；不得称为 755—756 年洛阳城中心、完整城界、历史城门原状、含嘉仓位置或具体战斗地点。

### 3.13 长安丹凤门代表点候选的采用边界

- EPUB `part0008.html#body-p025`—`body-p040` 只支持作者对长安供养、粮运与出关压力的解释；`part0010.html#body-p005`—`body-p008` 和 `body-p036`—`body-p038` 只支持长安恐慌、皇帝离城与燕军随后占领的作者叙述。它们均不提供唐长安城坐标、城界、宫城位置或路线几何。
- 西安市地方志办公室 2025-08-27 网页说明唐长安城承继隋大兴城的规模和布局，给出现代对应范围，并明确绝大部分遗迹已叠压在现代城市下；同页把大明宫、丹凤门列入唐长安城遗址。该网页只能支持历史城址与现代西安的区别，不能把文字范围直接转成正式 Polygon。
- 陕西省文物局 2012-11-30 网页把大明宫列为唐长安城三处大型宫室之一，并以“丹凤门遗址保护展示厅”和“丹凤门遗址”分别标注相关图片。该页可支持选择一个现代大明宫遗址展示地标，但不能证明展示建筑就是唐代丹凤门原状，也不能把大明宫点位称为整座唐长安城中心。
- OpenStreetMap `way/280412702` v4 把丹凤门记录为闭合建筑范围，标签为 `building=yes`、`name=丹凤门`。固定 way XML SHA-256 为 `0aa8ff3aa4a7a6295587da4c439f4e816d2f5246a2e6f9aeaa9eb4ecfae6c01e`；本次 full XML SHA-256 为 `29837c6e60ce1eadc0a088942fd43888048557922dc3f674911588c4d600f2d7`，含 21 个节点引用、20 个唯一节点，其中 19 个节点为 `v2`、1 个为 `v3`。
- 源环 bbox 为 `[108.9583422, 34.2826377, 108.9606638, 34.2830177]`。直接按 OGC:CRS84 经度、纬度顺序使用平面多边形质心公式，四舍五入至 7 位小数得到 `[108.9594728, 34.2828248]`；已验证点在源环内。未裁剪、简化、重投影、生成缓冲区或推导城界。
- 候选写入 `data/curated/spatial/anshi-place-candidates.geojson`，可信度和状态分别为 `DISPUTED / APPROVED`。`banq` 于 2026-07-31 接受它作为“现代大明宫丹凤门遗址展示地标代表点”；不得称为 755—756 年长安城中心、完整城界、历史丹凤门原状、唐玄宗离城位置或燕军入城地点。

### 3.14 “燕军受阻于潼关”事件的采用边界

- 用户提供 EPUB 的 SHA-256 仍为 `47ed5030e6079cc084686d39eb23188f6e558968ece3b624c856953a2c56cc43`。`part0008.html` 第 1—3 个正文段落支持“起兵约半年后”、燕军多线受牵制、未突破潼关和继续固守意见；原脚注 `#fo1` 明确指向《资治通鉴》卷二百一十八“至德元载五月”条。
- 维基文库固定修订 `oldid=1996147` 中，`CIT-ZZTJ218-R1996147-P00` 记录河北方向交战、北向联络受阻和安禄山所述“守潼关数月不能进”；`CIT-ZZTJ218-R1996147-P01` 记录哥舒翰、郭子仪、李光弼的固守意见。固定转录只作交叉核对和少量归纳，不公开采用长段原文，不采信段中兵力、伤亡或把传统纪日转换为公历；若以后需要精确引语，仍须对校权威整理本。
- 完整 Event 候选标题为“燕军受阻于潼关”，`eventType=DEFENSE`，`sequence=1`。时间只写“安禄山起兵约半年后（原书相对表述）”，并保持 `normalizedDate=null`、`timePrecision=APPROXIMATE`、`certainty=UNKNOWN`。
- `Event.summary` 只归纳现代研究与一手转录共同支持的态势和固守意见；`Event.whyItMatters` 只说明潼关的阻断作用与后续“固守还是出关”的叙事衔接。二者都不支持关城坐标、防线范围、路线几何、精确日期或对出关责任的判断。
- 本事件不新增地点、坐标、RouteSegment 或标准化日期。`banq` 于 2026-07-31 已批准 Event 基础字段、两条 Claim、新增 Citation、`SRC-PRIMARY-01` 的有限使用边界，以及两条既有 EPUB Citation 的事件用途；以上批准不扩展到兵力、伤亡、精确日期、引语措辞、几何或后续出关事件。

### 3.15 “燕军推进至潼关前”事件候选的采用边界

- 用户提供 EPUB 的 SHA-256 仍为 `47ed5030e6079cc084686d39eb23188f6e558968ece3b624c856953a2c56cc43`。`part0004.html#body-p018` 只用于候选归纳燕军渡过黄河、占领陈留和洛阳的宏观节点顺序；`part0005.html#body-p018`—`body-p023` 只用于候选归纳唐军由陕郡退守潼关、燕军继续向潼关施压。两处作者对机动、地形和补给的分析不写成确定因果。
- 普通维基文库《资治通鉴》卷二百一十七固定修订 `oldid=617834` 可见“炅昌”“至峽”等转录错字，本候选明确不采用该版。改用《资治通鉴（四库全书本）》卷二百一十七固定修订 `oldid=783496`：`CIT-ZZTJ217-R783496-P01` 只核对灵昌渡河、陈留、洛阳节点，`P02` 只核对陕郡退守潼关、燕军受阻和驻军陕郡的节点关系。若以后需要精确纪日或引语，仍须对校权威整理本。
- 完整 Event 候选标题为“燕军推进至潼关前”，`eventType=MARCH`，`sequence=2`。时间只写“洛阳失守后至潼关防线形成”，并保持 `normalizedDate=null`、`timePrecision=APPROXIMATE`、`certainty=UNKNOWN`；`relatedPlaceIds` 只使用已获批的洛阳、陕州、潼关地点记录。
- `Event.summary` 只归纳“渡河—陈留—洛阳—陕郡—潼关”宏观节点及唐军防御节点收缩；`Event.whyItMatters` 只说明它为下一阶段固守或出关提供叙事背景。二者都不支持精确路线、现代道路、速度、距离、坐标、标准化日期、地形/后勤单一因果或责任判断。
- 本事件不新增地点、坐标、RouteSegment 或路线几何。`banq` 于 2026-07-31 已批准 `SRC-PRIMARY-03` 的有限使用边界、两条新增 Citation、两条既有 EPUB Citation 的事件用途、完整 Event 字段和两条 Claim；批准不扩展到兵力、伤亡、精确传统纪日、引语措辞、几何、地形/后勤单一因果或责任判断。

### 3.16 “唐廷催令唐军出关”事件候选的采用边界

- 用户提供 EPUB 的 SHA-256 仍为 `47ed5030e6079cc084686d39eb23188f6e558968ece3b624c856953a2c56cc43`。`part0009.html#body-p001` 只用于交叉核对唐军最终离开潼关及其与后续灵宝方向交战的叙事衔接；同段传统纪日不转换为公历。`body-p002`—`body-p003` 及 `part0008.html#body-p034`—`body-p040` 对粮运、军政压力和人物动机的解释不纳入本候选的正式摘要或叙事作用。
- 维基文库《资治通鉴》卷二百一十八固定修订 `oldid=1996147` 的 `CIT-ZZTJ218-R1996147-P01` 记录收到陕郡敌军兵少、无备的报告，唐廷催令进兵，哥舒翰及郭子仪、李光弼提出固守意见，随后朝廷继续催促，唐军最终出关。这里只核对“报告—异议—催令—出关”的叙事顺序，不把报告内容当作已证敌情，不采信兵力，不公开采用长段原文或未经对校的精确引语。
- 完整 Event 候选标题为“唐廷催令唐军出关”，`eventType=POLITICAL`，`sequence=3`。时间只写“唐军出关前的命令过程至实际出关（传统纪日未换算）”，并保持 `normalizedDate=null`、`timePrecision=APPROXIMATE`、`certainty=UNKNOWN`；`relatedPlaceIds` 只使用已获批的潼关地点记录。
- `Event.summary` 只转述固定修订所载的报告、固守异议、反复催令和最终出关顺序；`Event.whyItMatters` 只说明从潼关固守转入出关行动并衔接后续灵宝方向交战。二者都不支持精确传统纪日或公历日期、兵力、直接引语、粮运/军政单一因果、责任判断、RouteSegment、精确路径、坐标或战场范围。
- `banq` 于 2026-07-31 已批准 Event 基础字段、两条 Claim、`CIT-ZZTJ218-R1996147-P01` 的新增事件用途和 `CIT-ANSHI25-CH09-P001-P003` 的限定用途。批准不扩展到精确传统纪日或公历日期、兵力、报告敌情真伪、直接引语、粮运/军政单一因果、责任判断、RouteSegment、精确路径、坐标或战场范围；该 Event 现已按上述限制进入正式 `mvp-v1.json`。

### 3.17 “唐燕军战于灵宝西原”事件候选的采用边界

- 用户提供 EPUB 的 SHA-256 仍为 `47ed5030e6079cc084686d39eb23188f6e558968ece3b624c856953a2c56cc43`。`part0009.html#body-p015`—`body-p020` 只用于已经批准的“南近山、北临黄河的狭窄通道”相对地形摘要，并候选扩展到本 Event 的文字背景；`body-p025`—`body-p026` 只候选核对唐燕交战开始。段中的传统纪日、秦函谷关旧址对应、道路宽度、兵力、先锋构成和进军目的均不采用。
- `part0009.html#body-p027`—`body-p042` 对双方兵力、部署、陌刀、火攻、风向、指挥、溃败和责任的详细重建不纳入本缩小候选，继续保持 `PENDING_REVIEW`；不得从书内示意图反推战场坐标、边界或路线。
- 维基文库《资治通鉴》卷二百一十八固定修订 `oldid=1996147` 的 `CIT-ZZTJ218-R1996147-P02` 候选只核对唐军在灵宝西原遇燕军、燕军所据通道“南近山、北临河”的相对关系、双方交战、唐军溃败，以及败退后才进入潼关失守阶段的叙事顺序。该 Citation 当前覆盖到潼关失守，但本 Event 不把后续失守并入同一事件，也不采用其中兵力、伤亡、战术细节、传统纪日、路线或长段原文。
- 完整 Event 候选标题为“唐燕军战于灵宝西原”，`eventType=BATTLE`，`sequence=4`。时间只写“唐军出关后、潼关失守前（传统纪日未换算）”，保持 `normalizedDate=null`、`timePrecision=APPROXIMATE`、`certainty=UNKNOWN`；`relatedPlaceIds` 只引用已批准的 `place-lingbao`，其现代“稠桑原”代表点仍为 `DISPUTED` 的叙事锚点，不是 756 年战场坐标。
- `Event.summary` 只归纳地点名称、相对地形、交战和唐军溃败；`Event.whyItMatters` 只说明唐军出关推进结束，并衔接后续败退与潼关失守。二者都不支持精确战场点或范围、现代秦函谷关景区对应、标准化日期、兵力、伤亡、路线、部署/火攻/风向重建、唯一败因或责任判断。
- `banq` 于 2026-07-31 已批准 Event 基础字段、两条 Claim、`CIT-ZZTJ218-R1996147-P02`、`CIT-ANSHI25-CH09-P025-P026` 及 `CIT-ANSHI25-CH09-P015-P020` 的新增事件用途。批准不扩展到精确战场点或范围、现代秦函谷关景区对应、传统纪日或公历日期、兵力、伤亡、路线、部署/火攻/风向重建、唯一败因或责任判断；该 Event 现已按上述限制进入正式 `mvp-v1.json`。

### 3.18 “燕军攻克潼关”事件候选的采用边界

- 用户提供 EPUB 的 SHA-256 仍为 `47ed5030e6079cc084686d39eb23188f6e558968ece3b624c856953a2c56cc43`。`part0010.html#body-p002` 候选只核对灵宝战败后哥舒翰收集散卒、火拔归仁控制并带走哥舒翰、燕军随后占领潼关的顺序。`body-p001` 的追击、壕沟、踩踏和伤亡估算，`body-p002` 的兵力、守关可能性和“无人负责”因果分析，以及 `body-p003`—`body-p004` 的人物评价、后续遭遇和兵力归纳均不纳入本 Event。
- 维基文库《资治通鉴》卷二百一十八固定修订 `oldid=1996147` 的 `CIT-ZZTJ218-R1996147-P02` 已获批用于灵宝交战和后续潼关失守的顺序。本候选只进一步把“哥舒翰收集散卒—火拔归仁等控制并带走哥舒翰—崔乾祐攻克潼关”登记为独立 Event；不采用传统纪日、兵力、伤亡、直接引语、精确间隔、行进路线或长段原文，也不把先后关系写成唯一因果。
- 《潼关县志》印刷第 558 页的 `CIT-TGXZ1992-P558` 是较晚的地方叙事，仍保持 `PENDING_REVIEW`；本候选不依赖它，也不采用其中日期、兵力或战术细节。
- 完整 Event 候选标题为“燕军攻克潼关”，`eventType=CAPTURE`，`sequence=5`。时间只写“灵宝西原交战后（传统纪日未换算）”，保持 `normalizedDate=null`、`timePrecision=APPROXIMATE`、`certainty=UNKNOWN`；`relatedPlaceIds` 只引用已批准的 `place-tongguan`，其现代旧城遗址代表点仍为 `DISPUTED`，不是 756 年关城中心或攻关位置。
- `Event.summary` 只归纳收集散卒、主帅被控制带走和燕军攻克潼关的顺序；`Event.whyItMatters` 只说明关键防御节点失去控制并衔接后续长安局势变化。二者均不支持精确关城、关防范围、传统纪日或公历日期、兵力、伤亡、精确间隔、路线、直接引语或唯一失守原因。
- `banq` 于 2026-07-31 已批准 Event 基础字段、两条 Claim、`CIT-ZZTJ218-R1996147-P02` 的新增独立事件用途和 `CIT-ANSHI25-CH10-P001-P004` 的限定事件用途。批准不扩展到精确关城或关防范围、传统纪日或公历日期、兵力、伤亡、反事实、直接引语、精确间隔、路线或唯一失守原因；该 Event 现已按上述限制进入正式 `mvp-v1.json`。

### 3.19 “玄宗离开后燕军占领长安”事件候选的采用边界

- 用户提供 EPUB 的 SHA-256 仍为 `47ed5030e6079cc084686d39eb23188f6e558968ece3b624c856953a2c56cc43`。`part0010.html#body-p005`—`body-p008` 只核对潼关失守后的长安局势与玄宗离城，`body-p036`—`body-p037` 只核对燕军得知消息后再进入长安；`body-p038` 的占领后杀戮和人事细节不采用。书中的精确日期、精确间隔、兵力、出入城路线与地点、恐慌或忠诚分析、动机推测、反事实和人物评价均不纳入本 Event。
- 维基文库《资治通鉴》卷二百一十八固定修订 `oldid=1996147` 的 `CIT-ZZTJ218-R1996147-P03` 只核对“唐玄宗离开长安—燕军先留兵潼关—随后另遣军进入长安”的叙事顺序。原文中的传统纪日和精确间隔不换算、不写入候选，也不采用兵力、离城或入城路线、地点、占领后部署、直接引语或长段原文。
- 完整 Event 候选标题为“玄宗离开后燕军占领长安”，`eventType=CAPTURE`，`sequence=6`。时间只写“潼关失守后至燕军占领长安（传统纪日未换算）”，保持 `normalizedDate=null`、`timePrecision=APPROXIMATE`、`certainty=UNKNOWN`，明确表示两个先后节点构成的连续阶段，而非同一天。
- `relatedPlaceIds` 只引用已批准的 `place-changan`；其现代丹凤门展示建筑代表点仍为 `DISPUTED` 的叙事锚点，不是玄宗离城、燕军入城或占领事件的坐标。`Event.summary` 只归纳离开与随后占领的顺序，`Event.whyItMatters` 只说明长安失去唐廷控制并作为缩小版 MVP 的叙事终点；不生成城界、RouteSegment、路线、事件点或唯一因果解释。
- `banq` 于 2026-07-31 已批准本节采用边界、Event 基础字段、两条 Claim、`CIT-ZZTJ218-R1996147-P03` 及两个 EPUB Citation 的新增事件用途。批准不扩展到精确传统纪日或公历日期、精确间隔、兵力、离城/入城路线与地点、占领后细节、动机推测、唯一因果、城界或事件点；该 Event 现已按上述限制进入正式 `mvp-v1.json`。

### 3.20 “燕军向潼关方向推进”RoutePlan 与分段候选的采用边界

- 已批准的历史内容只支持“洛阳—陕郡—潼关”的宏观节点顺序：`CIT-ZZTJ217-R783496-P01` 核对燕军攻占洛阳，`CIT-ZZTJ217-R783496-P02` 核对唐军由陕郡退守潼关、燕军驻于陕郡并受阻于潼关，两个 EPUB Citation 只作现代研究交叉核对。现有证据没有把灵宝列为燕军抵达潼关前的直接节点，因此本路线明确不经过 `place-lingbao`。
- RoutePlan 候选固定为 `routeId=route-yan-westward`、`side=YAN`、`actionType=ADVANCE`、`certainty=LOW`，并在 `event-02-yan-westward` 首次出现。RoutePlan 是审核组织项，不能替代 `route-yan-westward-01` 与 `route-yan-westward-02` 两个 RouteSegment 的逐段审核。
- 几何只使用三个已经批准但保持 `DISPUTED` 的现代代表点：洛阳应天门展示地标 `[112.4545867, 34.6769987]`、陕州故城内宝轮寺塔地标 `[111.1488645, 34.7915940]`、潼关现代旧城遗址代表点 `[110.2909781, 34.6035548]`。每个相邻节点只生成含两个端点的直线，不增加中间顶点，不调用道路/步行/驾车路由，不沿现代交通线，也不计算或展示历史里程与速度。
- 两段均为 `INFERENCE / LOW` 的解释性示意线，只表达宏观方向；不主张三个现代锚点是唐代城市或关城中心，不主张直线是唐代道路、行军轨迹、渡口、攻关位置、控制范围或战场边界。候选几何保存在 `data/curated/spatial/anshi-route-candidates.geojson`，文件和正式数据必须保持分离。
- `banq` 于 2026-07-31 已批准 RoutePlan、两个 RouteSegment、逻辑路线 Claim、两个分段 Claim、直连处理方法和 `INFERENCE / LOW` 使用边界。批准不扩展到唐代道路、行军轨迹、城市/关城中心、渡口、攻关位置、距离、速度或未登记中间节点；两个 RouteSegment 现已按上述限制进入正式 `mvp-v1.json`。

### 3.21 “唐军出关行动”RoutePlan 与分段候选的采用边界

- 已批准的历史内容只支持唐军从潼关出关，并随后在灵宝西原方向与燕军交战：`CIT-ZZTJ218-R1996147-P01` 核对最终引兵出关，`CIT-ZZTJ218-R1996147-P02` 核对灵宝西原交战，三个 EPUB Citation 只作现代研究交叉核对。材料中继续向陕州、洛阳的内容属于意图方向，不能证明唐军在灵宝战败前实际抵达；本路线因此明确不包含 `place-shanzhou` 或 `place-luoyang`。
- RoutePlan 候选固定为 `routeId=route-tang-advance`、`side=TANG`、`actionType=ADVANCE`、`certainty=LOW`，并在 `event-03-decision-to-advance` 首次出现。只生成 `route-tang-advance-01` 一个 RouteSegment；灵宝交战结束推进，溃败或撤退不是本 `ADVANCE` RoutePlan 的组成部分。
- 几何只使用两个已经批准但保持 `DISPUTED` 的现代代表点：潼关现代旧城遗址代表点 `[110.2909781, 34.6035548]` 与灵宝现代“稠桑原”同名居民点叙事锚点 `[110.872607, 34.615468]`。只生成含两个端点的直线，不增加中间顶点，不调用道路/步行/驾车路由，不沿现代交通线，也不计算或展示历史里程与速度。
- 该段为 `INFERENCE / LOW` 的解释性示意线，只表达宏观方向；不主张现代潼关锚点是 756 年关城，不主张现代“稠桑原”锚点是灵宝西原战场中心，也不主张直线是唐代道路、部署、行军轨迹、撤退线、战场边界或控制范围。
- `banq` 于 2026-07-31 已批准 RoutePlan、`route-tang-advance-01` RouteSegment、逻辑路线 Claim、分段 Claim、直连处理方法和 `INFERENCE / LOW` 使用边界。批准不扩展到唐代关城、战场、道路、部署、行军轨迹、撤退线、距离、速度或未登记中间节点。随后 `claim-place-lingbao-strategic-role-modern-01` 也已独立获批；该 RouteSegment 现已按上述限制进入正式 `mvp-v1.json`。

### 3.22 灵宝 `Place.strategicRole` 字段补充候选

- 正式 `PlaceProperties` 契约要求每个 Place 同时具有 `summary`、`strategicRole` 和 `coordinateNote` 三个独立的 `SourcedClaim`。现有 `place-lingbao` 只有已批准的 `Place.summary` 与 `Place.coordinateNote`，此前“5 个 Place 已完整”的进度统计遗漏了这一字段级要求。
- 新增 `claim-place-lingbao-strategic-role-modern-01`，候选文字为：“灵宝西原方向在本叙事中是唐军出关后与燕军交战、并由推进转入溃败的关键节点。”证据仅绑定已登记并批准用途的 `CIT-ZZTJ218-R1996147-P02`、`CIT-ANSHI25-CH09-P015-P020` 和 `CIT-ANSHI25-CH09-P025-P026`。
- 该候选为 `MODERN_RESEARCH / UNKNOWN`，只说明本叙事中的节点作用；不确认精确战场、坐标、边界、路线、部署、兵力、败因或责任。`banq` 于 2026-07-31 已独立批准该 Claim；至此 `place-lingbao` 的三个必填 `SourcedClaim` 齐全。

## 4. 第一批地点核对清单

以下名称来自已批准的 MVP 叙事范围，只是核对对象，不表示古址坐标或战略判断已经确认。

| placeId | 工作标签 | 必须核对的问题 | 坐标要求 | 最低资料要求 | 状态 |
|---|---|---|---|---|---|
| place-changan | 长安 | 本叙事使用的历史名称、城址范围、失守前后作用 | 已批准丹凤门现代展示建筑质心候选，必须保持 `DISPUTED`，不用现代西安市中心或明城墙范围替代 | 战略作用、地点摘要、坐标候选及各自直接 Citation 已批准；不确认 755—756 年城中心、城界、历史城门原状或事件点 | APPROVED |
| place-luoyang | 洛阳 | 事件中的名称、控制状态和西进路线起点语义 | 已批准应天门现代展示建筑质心候选，必须保持 `DISPUTED`，不用现代洛阳市中心替代 | 地点摘要、战略作用、坐标候选及各自直接 Citation 已批准；不确认 755—756 年城中心、城界或历史城门原状 | APPROVED |
| place-shanzhou | 陕州 | 唐代地名对应、与灵宝及潼关的空间关系 | 已批准宝轮寺塔现代地标代表点，必须保持 `DISPUTED`，不用现代陕州区政府驻地替代 | 地点摘要、战略作用、坐标候选及各自直接 Citation 已批准；不确认唐代城中心或城界 | APPROVED |
| place-lingbao | 灵宝 | “灵宝出战”所指空间范围、战场与城邑是否同点 | 已批准相对地形文字摘要；政府报告原值 `[110.872607, 34.615468]` 已通过成组技术核验排除 GCJ-02 转换，并作为 `DISPUTED` 的 OGC:CRS84 候选写入 GeoJSON | `banq` 于 2026-07-31 已批准摘要、战略作用、坐标候选、两个技术 Source/Citation 和使用边界；不得称为唐代灵宝西原、战场中心、范围或路线 | APPROVED |
| place-tongguan | 潼关 | 唐代关城位置、关防范围、与现代景区的差异 | 现代旧城遗址范围质心候选已批准，必须保留 `DISPUTED`、来源链和替代观点 | 坐标候选、地点摘要和限定的战略作用均已批准；不确认唐城中心 | APPROVED |

## 5. 第一批事件核对清单

以下事件名是叙事槽位，不是最终标题。正式事件顺序、日期和因果解释必须由资料确定。

| eventId | 工作标签 | 需要回答的问题 | 不得提前假定 | 状态 |
|---|---|---|---|---|
| event-01-defense-context | 潼关防线背景 | 潼关防线形成时的双方态势和空间约束是什么 | “燕军受阻于潼关”的完整 Event 字段、两条 Claim 和现代研究/一手转录交叉核对链已批准；不假定精确日、不把后世解释当原始记录 | APPROVED |
| event-02-yan-westward | 燕军推进至潼关前 | “洛阳失守后至潼关防线形成”的完整 Event、两条 Claim 和现代研究/固定修订一手转录交叉核对链已批准 | 只采用宏观节点顺序；不把现代道路当行军路线，不生成 RouteSegment、坐标或精确日期 | APPROVED |
| event-03-decision-to-advance | 唐军出关决策 | “报告—异议—催令—出关”的完整 Event 字段、两条 Claim 和固定修订/EPUB 限定证据链已批准 | 不把报告敌情、传统纪日、粮运/军政解释或责任判断写成单一确定事实 | APPROVED |
| event-04-lingbao-engagement | 灵宝方向交战 | “灵宝西原相遇—南山北河狭道—交战—唐军溃败”的完整 Event 字段、两条 Claim 和固定修订/EPUB 限定证据链已批准 | 不编造精确战场点、范围、兵力、伤亡、路线、战术重建或唯一败因 | APPROVED |
| event-05-tongguan-fall | 潼关失守 | “收集散卒—主帅被控制带走—燕军攻克潼关”的完整 Event 字段、两条 Claim 和固定修订/EPUB 限定证据链已批准 | 不把先后关系写成唯一因果，不采用精确关城、日期、兵力、伤亡或路线 | APPROVED |
| event-06-changan-consequence | 长安局势变化 | “玄宗离开长安—燕军先留兵潼关—随后另遣军进入长安”的完整 Event 字段、两条 Claim 和固定修订/EPUB 限定证据链已批准 | 不把离城与占领压缩成同一天，不采用精确间隔、兵力、路线、地点、占领后细节或唯一因果 | APPROVED |

## 6. 第一批路线核对清单

| routeId | 工作标签 | 候选节点仅用于核对 | 需要的证据 | 状态 |
|---|---|---|---|---|
| route-yan-westward | 燕军向潼关方向推进 | 洛阳、陕州、潼关；灵宝明确排除 | `banq` 于 2026-07-31 批准两个 `INFERENCE / LOW` 直连 RouteSegment、节点顺序、现代代表点用途、处理方法和 `appearAtEventId=event-02-yan-westward`；不代表历史路线 | APPROVED |
| route-tang-advance | 唐军出关行动 | 潼关、灵宝；陕州、洛阳和撤退线明确排除 | `banq` 于 2026-07-31 批准一个 `INFERENCE / LOW` 直连 RouteSegment、节点顺序、现代代表点用途、处理方法和 `appearAtEventId=event-03-decision-to-advance`；不代表历史路线 | APPROVED |

## 7. 第一批地理要素核对清单

| geographyId | 工作标签 | 需要核对的叙事作用 | 空间数据要求 | 状态 |
|---|---|---|---|---|
| geography-yellow-river | 黄河 | 与陕州、灵宝、潼关空间关系相关的河段 | 已批准 Natural Earth v5.0.0 已选源线段和保守摘要；不主张完整覆盖同名河流或代表唐代河道 | APPROVED |
| geography-wei-river | 渭河 | 与关中和长安防御空间关系相关的河段 | 已批准 Natural Earth v5.0.0 已选源线段和保守摘要；不主张完整覆盖同名河流或代表唐代河道 | APPROVED |
| geography-qinling | 秦岭 | 只表达本叙事所需的地形约束 | 已批准 Natural Earth v5.0.0 广义区域和保守摘要；不得当作精确边界或唐代历史边界 | APPROVED |
| geography-guanzhong-corridor | 东入关中通道（后续候选） | 解释性通道的范围与证据基础 | 缩小版 MVP 不发布独立几何、不计入数量或批准门禁；后续若恢复，必须另行核对资料、几何形式、可信度和处理过程 | PENDING_SOURCE |

## 8. CONTENT-00 完成边界

本模板及首批清单已建立，当前已有 19 个 Source、36 个 Citation、35 个 Claim 获得真实人工批准；5 个 Place、3 个 Geography、6 个 Event 和 2 个逻辑路线槽位均已组装，两个 RoutePlan 及共 3 个 `INFERENCE / LOW` RouteSegment 均已获得真实人工批准。`banq` 于 2026-07-31 独立批准 `claim-place-lingbao-strategic-role-modern-01` 后，16/16 个逻辑实体达到字段齐全的发布条件；正式 `mvp-v1.json` 已生成，并由组装器同时校验本文件与内容审核表。其余 `PENDING_REVIEW` 与 4 本 `PENDING_SOURCE` 书目候选不纳入本次已批准范围。东入关中通道的独立几何已推迟，不计入本版批准门禁。

在完成这些人工核对前：

- 可以搭建前端骨架、数据契约和空白地图。
- 可以创建明确标记为非发布数据的测试 fixture。
- 不得生成声称正式可发布的安史之乱内容数据。
