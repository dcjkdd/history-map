# PHASE2-01 地形与定位数据源审计及视觉试验

状态：研究与隔离试验，**尚未批准为正式实现**。访问日期：2026-08-03。

## 1. 试验范围与最低判读条件

- 展示 bbox：`[108.45, 33.65, 112.80, 35.45]`（WGS 84 / OGC:CRS84 坐标顺序），覆盖现有长安、潼关、灵宝、陕州、洛阳五个代表点，并保留黄河谷地、渭河下游与秦岭北缘的周边地形。
- DEM 原始取整 bbox：`[108, 33, 113, 36]`，共 15 个 1°×1° GLO-90 COG，避免展示边缘插值缺口。
- 目标地图缩放：俯视约 z6.5—7.2；倾斜 terrain 约 z6.8、pitch 54°。本试验只生成 z5—9 Terrarium 瓦片。
- 最低可读分辨率：1024×768；同时验证 1440×900。判读问题不是“地图是否加载”，而是用户能否不读长文就指出山地、较低平原/河谷、黄河与渭河、秦岭、潼关和东西方向。
- 90m 输入在本 bbox 横向约 5,200 个采样，远高于 1024/1440 视口的有效地图像素；是否足够仍以真实截图为准，不能只由采样数宣布通过。

## 2. 候选数据源审计

### 2.1 DEM / terrain

| 候选 | 发布机构、版本与覆盖 | 规格与处理边界 | 许可、再分发、秘密与静态部署 | 结论 |
| --- | --- | --- | --- | --- |
| Copernicus DEM GLO-90 | 欧盟 Copernicus / ESA；本试验使用 AWS 公开的 2021 release；全球陆地，90m / 3 arc-second | `COP-DEM_GLO-90-DGED`；1° COG，1200×1200，float32，DEFLATE/PREDICTOR=3；WGS84-G1150 / EPSG:4326，垂直 EGM2008 / EPSG:3855、米；是含建筑/植被的 DSM，不是裸地 DTM。无效值按非有限或 `<= -10000` 拦截；裁剪后双线性采样，编码 Terrarium PNG；分层设色另存 PNG | 免费许可允许复制、传播、修改和组合；修改产物必须显示指定 `produced using Copernicus WorldDEM-90 …` 文字。不需要账号、Token 或运行时配额；区域派生产物可离线静态托管。根与 `/history-map/` 均用相对 URL；不含秘密 | **进入视觉试验，当前推荐候选** |
| Copernicus DEM GLO-30 | 同机构；AWS 2021 release，CDSE 当前有更新 release；全球 30m / 1 arc-second | 1° COG 3600×3600；同为 DSM。相同范围约为 GLO-90 像素数 9 倍，原始单瓦片样本约 42.3MB，而 GLO-90 样本约 5.14MB | 同类免费许可与指定署名；无 Token，可静态部署，但输入/派生体积和处理时间显著增大 | 本阶段不下载；区域总览的屏幕像素不支持先付出约 8 倍压缩体积，若 GLO-90 截图不能辨认潼关周边坡面再做局部补试 |
| NASA SRTMGL1 v003 / SRTMGL3 | NASA LP DAAC；约 30m / 90m，北纬 60°—南纬 56° | WGS84 高程栅格；需要另做拼接、无效值和重采样核验 | NASA 主导任务数据通常按 Earthdata 开放政策使用并建议致谢，但实际下载常需要 Earthdata Login；离线派生可行，构建期凭证不能进入仓库 | 技术可行的备选；因获取摩擦与本次不需要第二套近似分辨率 DEM，不进入视觉试验 |
| Mapzen / Tilezen Terrain Tiles v1.1 | AWS Open Data；2017 Q4 组合数据，全球 | Terrarium/normal/geotiff；中国在较高 zoom 主要使用 SRTM，低 zoom 混合 GMTED 等；多源归属 | 无 Token、可直接静态请求或镜像，但版本陈旧、来源与逐源署名链复杂，更新不规律 | 只作为编码与工程参考，淘汰为正式地形来源 |

官方依据：

- [AWS Registry：Copernicus DEM 2021 COG、GLO-30/GLO-90、无账号公开桶](https://registry.opendata.aws/copernicus-dem/)
- [Copernicus AWS GLO-90 COG 结构与分辨率](https://copernicus-dem-90m.s3.amazonaws.com/readme.html)
- [Copernicus Data Space：DSM 定义、CRS、精度、release 与指定署名](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM)
- [NASA Earthdata：SRTM 数据集入口](https://www.earthdata.nasa.gov/centers/lp-daac)
- [NASA Earthdata 数据使用政策](https://www.earthdata.nasa.gov/engage/open-data-services-software/data-use-policy)
- [Tilezen joerd 数据源记录](https://github.com/tilezen/joerd/blob/master/docs/data-sources.md) 与 [署名记录](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)

### 2.2 分层设色、hillshade 与编码

本试验不再引入第三方渲染服务。构建脚本从同一 GLO-90 高程生成：

1. 纯分层设色 PNG（不预烘焙阴影）；
2. z5—9 Terrarium RGB 瓦片；
3. MapLibre 在浏览器中从同一 DEM 瓦片生成 hillshade，倾斜方案再启用 `terrain`。

这样两种截图的差异只来自视角/terrain，而不是换源。处理无重投影到新的存储 CRS；切片时按 Web Mercator 瓦片像素中心反算经纬度并双线性采样。Terrarium 公式为 `height = R×256 + G + B/256 - 32768`。MapLibre 官方 style spec 支持 `raster-dem` 的 `terrarium` 编码及 hillshade/terrain；运行时不访问外部服务。

### 2.3 省级定位

| 候选 | 版本/范围/坐标 | 许可与部署 | 结论 |
| --- | --- | --- | --- |
| geoBoundaries gbOpen CHN ADM1 | API `current` 于访问日返回 `CHN-ADM1-43563684`、2019 边界表达、34 单元；来源为 geoBoundaries / Wikimedia Commons；固定几何 commit `9469f09`；GeoJSON / WGS84 | API 记录本文件 `boundaryLicense=Public Domain`；项目整体建议显著标注 geoBoundaries。无 Token，可固定 commit、筛选河南/陕西后离线静态部署 | **试验采用**；行政边界仅作现代省级方位，不表示唐代边界 |
| Natural Earth Admin-1 | 全球小比例尺现代行政区，当前版本与现有正式 v5.0.0 水系来源并不相同 | Public Domain，建议 `Made with Natural Earth`，无 Token | 可用，但本阶段用 geoBoundaries 独立验证省级定位，避免误把现有 Natural Earth 水系批准扩大到新行政数据 |
| GADM | 全球 ADM，当前下载许可限制再分发与商业使用 | 不适合公开静态仓库的清晰再分发边界 | **淘汰** |

依据：[geoBoundaries API](https://www.geoboundaries.org/api.html)、[当前 CHN ADM1 元数据](https://www.geoboundaries.org/api/current/gbOpen/CHN/ADM1/)、[Natural Earth 使用条款](https://www.naturalearthdata.com/about/terms-of-use/)、[GADM 许可](https://gadm.org/license.html)。

### 2.4 河流、秦岭与标签

- **采用既有正式集合**：黄河、渭河、秦岭继续复用已逐行批准的 Natural Earth v5.0.0 几何与现有保守名称；不新增河道、山界或历史作用 Claim，保持 `UNKNOWN` 与“现代概览”边界。
- HydroRIVERS v1 为约 500m 的全球河网，亚洲下载和要素规模远超两个已批准名称的需求，也不直接解决中文名称；其许可与再分发还需附带 HydroSHEDS 条款。本阶段淘汰。
- 省名仅为“河南”“陕西”现代方位标签；潼关标签只复用正式 `Place.placeType=PASS` 与 `DISPUTED` 代表点，不新增关隘作用事实。

依据：[Natural Earth 使用条款](https://www.naturalearthdata.com/about/terms-of-use/)、[HydroRIVERS 产品页](https://www.hydrosheds.org/products/hydrorivers)。

## 3. 可复现处理与秘密边界

生成资产不得直接提交；只提交脚本、试验页面与本审计。建议命令：

```bash
source /Users/banq/.nvm/nvm.sh
nvm use
trial_sources=$(mktemp -d /private/tmp/history-map-phase2-01-sources.XXXXXX)
trial_site=$(mktemp -d /private/tmp/history-map-phase2-01-parent.XXXXXX)/site
scripts/phase2-01/fetch-trial-sources.sh "$trial_sources/data"
/Users/banq/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  scripts/phase2-01/build-terrain-spike.py \
  --source-dir "$trial_sources/data" \
  --formal-json frontend/public/data/anshi/mvp-v1.json \
  --spike-dir frontend/spikes/phase2-01 \
  --maplibre-dist frontend/node_modules/maplibre-gl/dist \
  --output-dir "$trial_site"
```

下载脚本拒绝覆盖已有路径；构建脚本也拒绝覆盖。下载范围固定为 N33—N35、E108—E112，不接受任意 URL、Token 或账号配置。输出包含输入 SHA-256、每个派生文件 SHA-256、总字节数和正式叠加要素计数。

## 4. 真实视觉、体积与性能证据

最终生成证据：单部署副本 88 个文件、`10,774,295` bytes；15 个压缩 COG 输入合计 `79,648,961` bytes；分层设色 PNG `2,030,838` bytes；z5—9 共 78 个 Terrarium PNG。正式叠加输出为 5 Place、3 Geography、3 RouteSegment，另有 1 个明确隔离的秦岭 display-only 标签锚点；省级试验输出为 2 个 boundary 和 2 个 label。

| 路径 / 视口 / 模式 | 运行证据 | 视觉观察 |
| --- | --- | --- |
| `/`，1024×768，俯视 | 干净标签页在浏览器默认 1280×720 首次 idle `400ms`、28 资源；随后覆盖为 1024×768 验证，Map/Canvas `1/1`、console 0 warning/error、无 overflow；展开署名与 reading/status/corridor 三矩形均不相交 | 山地纹理、河谷低地、黄河/渭河、秦岭、潼关和东西方向在不读侧栏长文时均可辨；潼关位于河谷与山地收束处最清楚 |
| `/`，1024×768，倾斜 | 同一 Map/Canvas 切换；console 仍为 0 warning/error；截图在 900ms 过渡后取得 | 起伏感增强，但透视缩短东西距离，标签更拥挤且裁剪边缘可见；通道整体不如俯视直接 |
| `/`，1440×900，俯视 | Map/Canvas `1/1`；console 0 warning/error；无 overflow；展开署名与三个 overlay 均不相交 | 五点、黄河谷地、秦岭北缘和洛阳—潼关方向关系最完整，是四图中判读效率最高者 |
| `/`，1440×900，倾斜 | Map/Canvas `1/1`；console 0 warning/error；无 overflow | 地形立体感明显，但空白背景和倾斜后的范围变形仍增加解释成本，更适合作为主动切换增强 |
| `/history-map/`，1024×768，俯视 | 干净标签页在浏览器默认 1280×720 首次 idle `395ms`、28 资源；随后覆盖为 1024×768 验证，Map/Canvas `1/1`、console 0 warning/error、无 overflow。HTML、CSS、JS、worker、relief、terrain、GeoJSON 请求均位于 `/history-map/` 且服务器返回 200 | 与根路径同源同样式；相对 URL 静态闭包成立 |

最终截图：

- `phase2-01-evidence-1024-topdown.png`
- `phase2-01-evidence-1024-terrain.png`
- `phase2-01-evidence-1440-topdown.png`
- `phase2-01-evidence-1440-terrain.png`

明显性能差异：俯视在浏览器默认 1280×720 的本地首次加载约 0.4s；倾斜启用 terrain 后会额外请求 z7/z9 DEM 瓦片并产生 GPU terrain 绘制，虽然本次 900ms 切换后无错误或明显卡顿，但它的运行成本高于默认俯视。受限浏览器页面作用域不暴露 Performance API，因此传输总量以 manifest 为准，不伪造逐模式 transfer size。署名在截图中完整展开、链接区域可见并完成不重叠矩形检查；本轮未单独记录折叠按钮的点击回切。

### 4.1 推荐与淘汰

- **推荐进入用户视觉选择：GLO-90 区域静态派生 + 默认俯视分层设色/hillshade。** 它在两个视口都最直接回答山地、平原/河谷、河流、潼关和东西通道问题；无需 Token，约 10.77MB 的试验副本可离线静态部署。
- **倾斜 terrain 保留为可选增强，不作为默认。** 它增强起伏，但压缩方向/距离关系、增加标签遮挡和裁剪边缘，且请求与 GPU 成本更高。
- **本阶段淘汰 GLO-30、Mapzen composite、GADM、HydroRIVERS。** 前者尚无截图证据证明区域总览值得约 8 倍输入压缩体积；其余分别因版本/归属复杂、再分发限制或规模与命名需求不匹配。
- 推荐仍不是正式选型签字。产品负责人必须查看四张图并确认；确认前不进入 PHASE2-02。

### 4.2 工程与内容门禁

- 修改后 `npm --prefix frontend run check` 通过：typecheck、`validate:data`（0 warning）、`audit:content`、18 个测试文件 / 116 个测试、正式根构建、worker 闭包均通过；仍保留 9 `PENDING_REVIEW`、5 `PENDING_SOURCE`、2 `REJECTED` 范围外记录。
- 正式 `/history-map/` 构建输出到 `/private/tmp`，index 引用 `/history-map/assets/...`，worker 闭包为 0 个缺失相对依赖；没有生成物进入工作树。
- 正式 JSON 与 lockfile SHA-256 未改变；高风险 Token/私钥模式扫描无命中。当前只新增本审计、执行卡点记录、两份脚本和隔离 spike 源码。
- 工程通过不能代替视觉选择或产品签字。本阶段到此停止等待用户选择，不 commit、不 push。

## 5. 阶段边界

本文件只为 PHASE2-01 的来源与视觉选择提供证据。它不批准正式地形基底，不新增唐代路线/河道/山界/距离/关隘作用，也不改变任何 `APPROVED`、`PENDING_REVIEW`、`PENDING_SOURCE`、`REJECTED`、`DISPUTED`、`APPROXIMATE`、`INFERENCE / LOW` 状态。视觉方向必须由产品负责人看截图后确认；确认前停止，不进入 PHASE2-02。
