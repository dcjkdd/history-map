# PHASE2-01 隔离地形视觉试验

本目录只保存可复现的试验页面源码，不进入正式 Vite 入口，也不改变正式历史语义。生成的 Copernicus DEM 派生图片、Terrarium 瓦片、geoBoundaries 裁剪结果和浏览器截图必须输出到系统临时目录；在 PHASE2-01 的数据源与视觉方向获用户确认前，不提交这些派生产物。

运行入口与完整数据源、许可、bbox、构建和浏览器证据记录在 `docs/research/phase2-01-terrain-source-audit.md`。试验页面同时叠加：

实际执行进度、已遇到的下载输出缓冲、端口沙箱与应用内浏览器等待卡点，以及每个卡点的最大等待时间和恢复命令，记录在 `docs/research/phase2-01-execution-log.md`。恢复任务必须先读该文件，禁止重复无边界等待。

- 正式 JSON 的 5 个 `DISPUTED` 地点；
- 正式 JSON 的黄河、渭河和秦岭现代概览；
- 正式 JSON 的 3 个 `INFERENCE / LOW` RouteSegment；
- geoBoundaries 的河南、陕西省级边界与试验标签；
- Copernicus GLO-90 2021 COG 派生的分层设色、hillshade 和本地 Terrarium 瓦片。

两种模式共享同一数据和范围：

1. 俯视 hillshade + 地形分层设色；
2. 倾斜 MapLibre terrain。

它们只回答视觉方向问题，不批准关中通道几何、历史路线、距离、地形军事作用 Claim 或任何新的发布数据。
