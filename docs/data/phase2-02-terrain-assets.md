# PHASE2-02 地形资产来源与再生成记录

- 状态：正式资产已生成并通过可复现构建、闭包和双尺寸/双 base 浏览器复验；产品负责人已根据最终视觉证据确认，提交 `ab3ac2d` 已推送
- 生成日期：2026-08-04
- 正式目录：`frontend/public/terrain/phase2-02/`
- 完整机器清单：`frontend/public/terrain/phase2-02/manifest.json`
- 生成器：`scripts/phase2-02/build-terrain-assets.py`

## 1. 产品与空间边界

本资产集只实现 PHASE2-02 的默认俯视地形和现代省级定位，不生成唐代河道、古道、平原/通道、关隘军事作用、历史路线、距离或新事实 Claim。

- DEM 输入范围：`[108.0, 33.0, 113.0, 36.0]`
- 默认展示范围：`[108.45, 33.65, 112.80, 35.45]`
- 高程输入实测范围：`101.39—3002.14m`
- 河南、陕西边界和名称只表示现代方位，不表示唐代边界。
- 秦岭文字使用前端 display-only 锚点；锚点没有写入正式历史 JSON。
- 倾斜/三维未进入 PHASE2-02：PHASE2-01 已证明默认俯视方案更清楚，加入 3D 会增加裁剪、标签遮挡和验证范围。

## 2. 输入与仓库策略

DEM 为 Copernicus DEM GLO-90 2021 AWS COG，使用 `N33—N35`、`E108—E112` 共 15 个输入。原始输入共 `79,648,961 bytes`，不进入仓库；manifest 固定记录每个文件名、字节数和 SHA-256，生成器在处理前逐个校验，不接受同名但内容漂移的输入。

现代省级边界来自 geoBoundaries gbOpen CHN ADM1：

- `boundaryID=CHN-ADM1-43563684`
- 固定几何提交：`9469f09`
- 简化输入 SHA-256：`bc4afc7eacf4351ae5b3ae7a612327987ce1123cb5deb8574fb49107091c6623`
- 正式派生只保留河南、陕西两个现代边界和两个显示标签。

资产不包含 Token、账号、个人配额、运行时外网请求、原始 TIFF/COG 或压缩源包。

## 3. 正式派生产物

| 产物 | 数量 / 体积 | 用途 |
|---|---:|---|
| `color-relief.png` | 1 / `2,030,838 bytes` | 1800×1080 俯视分层设色 |
| `terrain/{z}/{x}/{y}.png` | 78 / `7,529,229 bytes` | z5—9 Terrarium 编码，MapLibre hillshade |
| `provinces.geojson` | 1 / `12,083 bytes` | 现代河南、陕西边界和名称 |
| 合计（不含 manifest） | 80 / `9,572,150 bytes` | 小于固定 `10 MiB` 预算 |

关键 SHA-256：

- `manifest.json`：`54268b52b5e4d2753296682c540aa970a47a4f65945c46265dd9a493e0a34b44`
- `color-relief.png`：`def742a6ba80cb13785f4b5e4aead5caa48dd410c3f5e898318c623dcd2f031f`
- `provinces.geojson`：`d21184e991f798cf48259472c99f3cfaf5df1f24ad25ba6f55700135b0276887`

每张瓦片的 SHA-256 和字节数以 manifest 为准。`verify-terrain-assets.ts` 会逐文件复算、检查 78 张瓦片的 z5—9 分布、拒绝未登记文件/原始 COG/可疑秘密，并核对许可文字与体积预算。

## 4. 许可、署名与再分发结论

### Copernicus WorldDEM-90

官方 GLO-90 Full, Free & Open 条款授予复制、分发、向公众传播、改作、修改及与其他数据组合的权利，且免费、全球、无时间限制。因此可以在仓库中再分发本区域派生的分层设色图和 Terrarium 瓦片，但必须显示派生署名和责任声明：

> produced using Copernicus WorldDEM-90 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved

> The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability for any use of the Copernicus WorldDEM™-90.

两段文字均由 manifest、自动校验和 MapLibre attribution source 固定，不能只留在开发文档。

### geoBoundaries

geoBoundaries 的 gbOpen 分发层为 CC BY 4.0，要求提供署名；本次 CHN ADM1 上游元数据另记 `boundaryLicense=Public Domain`。正式记录同时保留这两层信息，不以单个上游字段覆盖 gbOpen 的整体署名义务。地图显示 `geoBoundaries` 署名和“现代省级方位，非唐代边界”边界。

### Natural Earth 与正式历史数据

既有黄河、渭河和秦岭正式 Geography 继续显示 `Made with Natural Earth`。同一 attribution 明示既有 `DISPUTED` 代表点、`APPROXIMATE` 事件和 `INFERENCE / LOW` 路线不表示精确古代边界、河道或行军轨迹。

## 5. 可复现生成与校验

生成环境使用 Python 3、NumPy 与 Pillow。输入目录结构必须含 `dem/` 的 15 个固定 COG 和 `metadata/geoboundaries-chn-adm1-simplified.geojson`：

```bash
/Users/banq/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  scripts/phase2-02/build-terrain-assets.py \
  --source-dir <AUDITED_SOURCE_DIR> \
  --output-dir <NEW_EMPTY_OUTPUT_DIR>

npm --prefix frontend run verify:terrain-assets
```

生成器拒绝覆盖已存在目录。2026-08-04 首次正式运行因 geoBoundaries 实际使用 `Henan Province` / `Shaanxi Province` 长名而在写 manifest 前失败；脚本随后改为显式允许已审计长名，不完整输出移至 `/private/tmp`，第二次生成成功。该失败没有被写成成功证据。

## 6. 验收边界

- 自动门禁和无错误浏览器只能证明工程闭包，不能替代产品负责人对默认俯视地形的视觉签字。
- 地形失败时页面明确显示“地形未加载 / 已降级”，历史内容继续可读；降级状态不得用于产品签字。
- PHASE2-03 的平原、通道、古道、流向、关隘军事作用和路线/距离解释均未包含在本资产集。
