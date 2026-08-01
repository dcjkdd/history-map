# history-map 第一期 MVP 前端

本目录是“潼关防线、灵宝出战与长安失守”第一期 MVP 的可运行前端。它是 Vue 3、TypeScript、Vite 与 MapLibre GL JS 构成的只读单页应用；生产构建只包含静态 HTML、CSS、JavaScript、MapLibre worker、地图样式和版本化 JSON，不需要 Go、PostgreSQL/PostGIS、Redis、Docker 或 MinIO。

## 环境与安装

- Node.js：`24.18.0`，由仓库根目录 `.nvmrc` 固定。
- npm：`11.16.0`，同时记录在 `frontend/package.json` 的 `packageManager` 和 `engines` 中。
- 当前 macOS 开发机使用 `/Users/banq/.nvm/nvm.sh` 提供的 NVM。其他系统可以使用自己的 NVM 安装位置，但仍须切换到 `.nvmrc` 指定版本。

从仓库根目录执行：

```bash
source /Users/banq/.nvm/nvm.sh
nvm use
node -v
npm -v
npm --prefix frontend ci
```

预期版本分别为 `v24.18.0` 和 `11.16.0`。仓库根目录没有 `package.json`，因此下文所有根目录命令都使用 `npm --prefix frontend`；也可以先 `cd frontend`，再移除命令中的 `--prefix frontend`。

## 开发、测试与构建

启动开发服务器：

```bash
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173
```

打开 `http://127.0.0.1:5173/`。其他工程命令为：

```bash
npm --prefix frontend run typecheck
npm --prefix frontend run validate:data
npm --prefix frontend run test
npm --prefix frontend run build
npm --prefix frontend run check
```

`check` 依次执行 `typecheck`、`validate:data`、`test`、`build`，最后执行固定的 MapLibre worker 闭包校验。`build` 自身会在 Vite 构建前再次执行类型检查和正式数据校验，因此数据不合法时不会生成可发布版本。

也可以在已有根路径构建产物上单独复核 worker：

```bash
npm --prefix frontend run verify:worker-bundle
```

worker 校验不能省略：Vite 构建成功只证明入口完成打包，不自动证明 worker 引用的全部相对模块都已随静态产物发布。

## 正式数据与静态 API

- 仓库中的正式数据：`frontend/public/data/anshi/mvp-v1.json`。
- 浏览器运行时固定请求：`GET /data/anshi/mvp-v1.json`。
- 所有业务加载都经过 `src/data/mvpRepository.ts`；组件不直接读取 JSON 路径。

这里的 `/data/anshi/mvp-v1.json` 是由静态服务器提供的版本化数据 API，不是 Go API。它刻意保持根路径契约：即使应用部署在 `/history-map/`，业务数据仍从站点根 `/data/` 加载。

## 地图样式配置与降级

`VITE_MAP_STYLE_URL` 是可选的 MapLibre Style JSON URL。可以在不提交的 `frontend/.env.local` 中配置：

```dotenv
VITE_MAP_STYLE_URL=https://example.invalid/path/to/style.json
```

该地址必须返回 MapLibre 能读取的有效 Style JSON，且它引用的 sprite、glyph、source、tile 等资源也必须能被浏览器访问。项目没有预设或批准任何生产底图供应商。

所有 `VITE_` 变量都会进入浏览器构建产物，禁止写入私密 Token、服务端凭据或其他秘密。Style URL、Token 使用方式、配额、许可证和署名要求都由部署者在公开使用前自行核对；不要把未核对的许可或密钥写入仓库。

不配置该变量时，应用按当前 Vite base 使用本地 `map/empty-style.json` 中性背景。外部样式的根 Style 加载失败时也会自动切换到该本地样式；历史地点、地理要素、路线、时间轴和详情不依赖外部底图。

需要显式验证“有效本地样式”分支时，可临时执行：

```bash
VITE_MAP_STYLE_URL=/map/empty-style.json npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173
```

## 根路径静态部署

生成干净的根路径构建并用一个普通静态文件服务器验证：

```bash
npm --prefix frontend run build
npm --prefix frontend run verify:worker-bundle
python3 -m http.server 4173 --bind 127.0.0.1 --directory frontend/dist
```

打开 `http://127.0.0.1:4173/`。这里的 Python 只作为裸静态服务器示例，不是应用的构建或运行时依赖；任意能原样提供目录文件的静态服务器都可以替换它。

## `/history-map/` 非根静态部署

下面的命令在系统临时目录中建立完整站点根，不会在工作树留下 `dist-history-map`：

```bash
DEPLOY_ROOT="$(mktemp -d)"
npm --prefix frontend run build -- --base=/history-map/ --outDir "$DEPLOY_ROOT/history-map"
npm --prefix frontend run verify:worker-bundle -- "$DEPLOY_ROOT/history-map/assets"
mkdir -p "$DEPLOY_ROOT/data/anshi"
cp frontend/public/data/anshi/mvp-v1.json "$DEPLOY_ROOT/data/anshi/mvp-v1.json"
python3 -m http.server 4174 --bind 127.0.0.1 --directory "$DEPLOY_ROOT"
```

打开 `http://127.0.0.1:4174/history-map/`。该形态中：

- HTML、CSS、JavaScript、MapLibre worker 和本地空白样式位于 `/history-map/`。
- 业务数据按既有静态 API 契约位于站点根 `/data/anshi/mvp-v1.json`。
- `verify:worker-bundle` 的参数是实际构建出的 `assets` 目录。

不要只用 `vite preview` 判断非根部署成功。它可以预览带 base 的应用资产，但不会自动在同一站点根额外挂载契约要求的 `/data/`；若根数据未单独部署，页面会收到数据 404。

## 常见错误

- `EBADENGINE`、类型工具无法启动或语法错误：先确认已 `source /Users/banq/.nvm/nvm.sh`、执行 `nvm use`，并核对 Node `24.18.0` 与 npm `11.16.0`。
- 页面出现 `MvpDataError`：先看错误中的稳定 `code` 和 `path`。`NETWORK_ERROR` / `HTTP_ERROR` 通常表示静态数据请求或部署路径失败，`INVALID_JSON` 表示响应不是合法 JSON，其他 code/path 指向数据契约或完整性字段。
- `/data/anshi/mvp-v1.json` 返回 404：确认数据位于站点根 `/data/`，不要误放成仅有 `/history-map/data/`。
- 样式 URL 或其资源返回 404：检查 `VITE_MAP_STYLE_URL` 以及 Style 中的 sprite、glyph、source、tile 地址；外部根样式失败后应看到本地中性背景提示。
- 构建成功但 worker 404 或缺少相对模块：重新运行 `verify:worker-bundle`，并确认发布了构建目录中的完整 `assets/`，而不是只复制入口 JavaScript。
- `vite preview --base=/history-map/` 下应用资产成功但数据失败：这是根 `/data/` 未挂载，不是 Repository 改用相对路径的理由；使用上面的裸静态站点根布局。
- Vite 报主入口超过 500 kB：当前 MapLibre 主包会触发体积提示，但提示本身不是构建失败；仍须以命令退出状态、页面回归和 worker 闭包校验为准。

## 浏览器范围与已知限制

- 产品以现代桌面浏览器为目标；当前真实回归尺寸为 `1024×768` 和 `1440×900`。
- 没有建立 Safari、Firefox、Chrome、Edge 的完整版本矩阵，也没有视觉回归平台；不要把上述两种窗口尺寸解释为完整浏览器兼容承诺。
- 仅提供较窄窗口下的最小堆叠，不是完整手机布局。
- 没有用户状态持久化、深链接或 URL 状态同步；刷新后回到数据集默认事件。
- 没有后端、数据库、登录、在线编辑或内容审核工作流。
- 外部地图样式及其资源可能因网络、配额或许可配置失败；应用会尝试降级到本地中性背景。

工程门禁通过只说明代码、数据结构和静态构建可运行，不等于 MVP-11 的历史内容发布签字已经完成。
