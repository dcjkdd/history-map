# PHASE2-01 执行记录、卡点与恢复边界

状态：进行中；本文件记录 2026-08-03 的真实执行结果，供独立任务恢复。它不代表数据源或视觉方向已获产品签字。

## 1. 已完成状态

- 基线：`HEAD=5baf7bf45b6330d73f2164c825ec6a636db5dd8c`，工作树起始干净；当前仍为 detached HEAD，未建分支、未 commit、未 push。
- 环境：Node `24.18.0`、npm `11.16.0`；修改前 `npm --prefix frontend ci` 与 `npm --prefix frontend run check` 已通过（18 个测试文件、116 个测试、数据校验 0 warning）。修改后的最终门禁尚未重跑。
- 输入：15 个 Copernicus GLO-90 2021 COG，取整 bbox `[108,33,113,36]`，本次临时输入约 84MB；geoBoundaries 当前 CHN ADM1 元数据固定到 commit `9469f09`。
- 生成：展示 bbox `[108.45,33.65,112.80,35.45]`；z5—9 共 78 个 Terrarium PNG；最终单个根路径部署副本 `10,774,295` bytes、88 个文件；高程范围约 101.39—3002.14m。
- 正式叠加闭包：5 Place、3 Geography、3 RouteSegment；2 个现代省界和 2 个试验标签。正式 JSON 未修改。
- 临时目录（可随系统清理，不作为长期输入）：
  - 输入：`/private/tmp/history-map-phase2-01-sources.vl97aS/data`
  - 最终证据构建：`/private/tmp/history-map-phase2-01-final-evidence.C5f5nX/site`
  - 最终 manifest：`/private/tmp/history-map-phase2-01-final-evidence.C5f5nX/site/manifest.json`
  - 之前的 `build.3zIY9R`、`rebuild.Ztpf77`、`final.GU8Yhc`、`evidence.RwV5Px` 目录分别包含修复前或补丁错误版本，不得用于最终截图。

若临时目录消失，必须用仓库脚本重新生成，不能把上述路径写成正式依赖。

## 2. 已确认卡点与恢复规则

### 2.1 长任务输出被缓冲，误判为无进展

- 症状：下载调用长时间没有增量输出；执行器先返回 cell，再返回底层 session。
- 实际情况：目录从 59MB / 11 个瓦片增长到 84MB / 15 个瓦片，下载并未停滞。
- 原因：curl 进度写 stderr，长执行输出在当前工具链被分段缓冲；外层 cell 与底层 session 是两层状态。
- 恢复：最多等待 20 秒；随后只读检查 `du -sh` 与 `find ... -name '*.tif' | wc -l`。如果数量或体积增长，再等待一次；连续两次不增长才终止。
- 禁止：不因无日志反复发起相同下载，不扩展 bbox，不改下 GLO-30，不进行超过 60 秒的盲等。

### 2.2 沙箱拒绝本地端口绑定

- 症状：`python3 -m http.server` 报 `PermissionError: [Errno 1] Operation not permitted`。
- 原因：当前 macOS 沙箱不允许默认权限绑定监听端口，不是页面或 Python 错误。
- 恢复：只对明确的 `127.0.0.1:<port>` 静态服务器申请环境授权；不得绑定 `0.0.0.0`。一次只启动一个服务器，记录 session id，并在该路径验证完成后立即发送 `Ctrl-C`。
- 禁止：不通过更换框架、安装新服务器依赖或启动多个长期后台进程绕过。

### 2.3 应用内浏览器等待 `networkidle` 未返回

- 症状：页面首次导航后，`waitForLoadState({state:'networkidle'})` 没有按期提供结果；外层浏览器调用被人工终止。
- 已知边界：MapLibre worker、raster-dem 与浏览器资源调度不保证快速进入稳定的 `networkidle`；本次没有证据表明页面 JavaScript 已失败。
- 恢复：
  1. 不再调用 `networkidle`。
  2. `goto` 后直接读取 `#runtime-status` 与 `window.__PHASE2_SPIKE__`。
  3. 若 `readyAt` 为空，只允许一次不超过 2 秒的短等待，再读一次。
  4. 单次浏览器工具调用上限 15 秒；同一路径失败一次后停止，不循环重试。
  5. 截图、console、DOM/Canvas、资源计数分别用短调用获取，避免把整套矩阵塞进一个长调用。
- 停止条件：`goto` 或第一次状态读取再次超时，就把“当前应用内浏览器连接阻塞”写入证据，不换 Playwright 服务、不启用外部浏览器、不声称视觉已验证。

### 2.4 试验源码的静态风险已修正

- 原始 `geography-labels` 对 `symbol-placement` 使用数据表达式；MapLibre 不支持这种写法。已拆成固定 `line` 的 river labels 与普通 mountain labels。
- 原始地点符号和方向箭头依赖非 CJK glyph；在没有远程 glyph URL 的纯静态样式中可能失败。已把地点改为 circle，方向文字改为本地中文，移除显式远程字体栈。
- 原始 `fitBounds` 混入 pitch/bearing 选项。已先 `jumpTo({pitch:0,bearing:0})` 再 `fitBounds`。
- runtime 状态原位于右下，可能遮挡 MapLibre attribution；已移到右上控制区下方。
- 首次 1024×768 实际矩形检查发现展开的 attribution（`x=298..1014, y=694..758`）与小屏底部通道提示（`x=402..622, y=698..730`）相交。已把小屏通道提示移到地图顶部；必须从同一输入重建后再截图，原页面不能算视觉证据。
- 首次服务器请求闭包仅出现浏览器默认 `/favicon.ico` 404；页面资源均为 200。已增加空 data favicon，重建后不得再出现该无关 404。
- 重建后普通 `reload()` 仍显示旧的通道提示坐标，确认应用内浏览器复用了旧 CSS。试验入口已给本地 `spike.css`/`spike.js` 增加固定构建查询标识；后续每次改变试验源码都必须更新该标识并从全新临时目录重建，不能用旧页面截图。
- 首张 3D 截图触发 MapLibre 警告：同一 raster-dem source 同时用于 hillshade 与 terrain；并且 54° 倾角暴露过多裁剪边缘。已把相同本地瓦片声明为独立 `dem-hillshade` / `dem-terrain` source（只保留一份署名），并收敛到 45°、z7.15、1.25 倍夸张。正式输入和派生瓦片没有变化。
- 秦岭 Polygon 自动标签在同一视图重复出现。已增加一个 `[110.45,33.86]` 的 display-only 标签锚点，仅用于去重排版；正式 Geography Polygon、计数、certainty 和 JSON 均不改变，该锚点不得进入发布数据。
- 第一次标签去重补丁错误命中了 `qinling-fill` 的 filter，截图表现为秦岭仍重复标注且面填充消失。已按明确 layer id 修正：`qinling-fill` 继续筛选正式 MOUNTAIN Geography，`mountain-labels` 只筛选 display-only anchor。错误截图保留作排错证据，不得列为最终比较图。

### 2.5 浏览器只读页面作用域不暴露 Performance API

- 症状：浏览器只读 `evaluate` 中读取 `performance.getEntriesByType` 报 `performance` 未定义。
- 原因：应用内浏览器的受限页面作用域只保证基本 DOM 读取，不保证 Performance API；这不是页面运行错误。
- 恢复：请求数采用页面 `runtime-status` 已捕获的首次 idle 计数与静态服务器日志交叉核对；完整字节数采用生成 manifest。不得为读取 Performance API 切换到未授权的外部自动化服务。

## 3. 最小恢复命令

如果临时输入仍在：

```bash
/Users/banq/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  scripts/phase2-01/build-terrain-spike.py \
  --source-dir /private/tmp/history-map-phase2-01-sources.vl97aS/data \
  --formal-json frontend/public/data/anshi/mvp-v1.json \
  --spike-dir frontend/spikes/phase2-01 \
  --maplibre-dist frontend/node_modules/maplibre-gl/dist \
  --output-dir <全新临时目录>
```

根路径一次只启动：

```bash
/usr/bin/python3 -m http.server 4173 --bind 127.0.0.1 \
  --directory /private/tmp/history-map-phase2-01-final-evidence.C5f5nX/site/root
```

子路径另一次启动：

```bash
/usr/bin/python3 -m http.server 4174 --bind 127.0.0.1 \
  --directory /private/tmp/history-map-phase2-01-final-evidence.C5f5nX/site
```

浏览器 URL 分别为 `http://127.0.0.1:4173/` 与 `http://127.0.0.1:4174/history-map/`。不得用 `/root/` 冒充根部署。

## 4. 剩余闭环

1. 已完成真实浏览器：根路径 1024×768 与 1440×900 的俯视/倾斜截图；子路径资源闭包。
2. 已记录 console、单一 MapLibre/Canvas、请求数/体积、首次 idle、横向 overflow、署名展开与 overlay 矩形不重叠。署名已完整展开并可见，但本轮未单独记录折叠按钮的点击回切；不得把这一点写成已测试。
3. 修改后最终门禁已通过：Node `24.18.0` / npm `11.16.0`；`npm --prefix frontend run check` 完整通过，数据校验 0 warning、18 个测试文件 / 116 个测试；正式根构建与 worker 闭包通过。`--base=/history-map/` 构建输出到 `/private/tmp/history-map-formal-subpath.xKPu3B/dist`，worker 闭包也通过；index 仅引用 `/history-map/assets/...`。
4. 正式 JSON SHA-256 仍为 `34927c09eb03f37e2b7d884afb34172dc9990bc3549a6c1638813ddc251beee6`，lockfile SHA-256 仍为 `d2aa04cb6893326b206629ad8f8b3e3db573d1632fc847451aa5db888e9c7f22`；高风险秘密模式扫描无命中。`HEAD`、本地 `master`、本地 `origin/master` 仍同为 `5baf7bf45b6330d73f2164c825ec6a636db5dd8c`。
5. 产品负责人选择视觉方向前停止；不 commit、不 push、不进入 PHASE2-02。
