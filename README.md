# 中国古代战争地形地图（history-map）

一个以真实地形为基础，结合历史城市、关隘、河流、古道、战役、人物、行军路线、时间轴和史料引用的交互式中国历史地图。

首个专题：**安史之乱（755—763）**。

## 当前执行基线

MVP-01—MVP-11 已形成可运行、可审计的二维静态技术原型，但它没有证明产品核心价值。PHASE2-01 已完成真实数据源审计和视觉试验，产品负责人选择 Copernicus GLO-90 区域静态派生，并确认默认采用俯视分层设色 + hillshade。当前严格执行 **PHASE2-02 地形基底与基本定位**；实现和工程门禁不能替代最终视觉签字。

- [第二期地形优先范围](docs/plans/phase-2-terrain-scope.md)
- [第二期开发任务](docs/plans/phase-2-terrain-tasks.md)
- [第二期验收标准](docs/plans/phase-2-terrain-acceptance.md)
- [ADR-0002：地形优先二期产品纠偏](docs/decisions/0002-地形优先二期产品纠偏.md)
- [PHASE2-02 地形资产来源与再生成记录](docs/data/phase2-02-terrain-assets.md)

下列文档保留为已完成技术原型的实施记录，不再定义当前产品是否成立：

- [MVP 范围](docs/plans/mvp-scope.md)
- [MVP 开发任务](docs/plans/mvp-tasks.md)
- [MVP 验收标准](docs/plans/mvp-acceptance.md)
- [ADR-0001：静态前端 MVP 优先](docs/decisions/0001-静态前端MVP优先.md)

第二期继续复用 Vue、MapLibre 和版本化静态数据，不因产品纠偏自动引入后端、数据库、RAG 或多专题平台。发生实施冲突时，以 ADR-0002 的权威顺序为准。下方技术栈仍是长期演进目标。

## 当前静态前端本地入口

当前可运行的专题前端位于 `frontend/`；默认加载本地 GLO-90 派生地形，不依赖运行时外网。仓库根目录没有 `package.json`。在仓库根目录执行：

```bash
source /Users/banq/.nvm/nvm.sh
nvm use
npm --prefix frontend ci
npm --prefix frontend run dev
```

完整的环境版本、数据路径、地图样式、测试/构建门禁以及根路径和 `/history-map/` 静态部署方法见 [前端本地运行说明](frontend/README.md)。

## 项目目标

本项目不只是展示“某场战争发生在哪里”，而是尝试回答：

- 为什么战争发生在这里？
- 山脉、河流、关隘和粮道如何影响战争？
- 古代地名与现代位置如何对应？
- 军队从哪里出发，经过哪里，何时到达？
- 正史、现代研究和后世叙事之间有哪些差异？
- 每个结论来自哪本书、哪个章节或哪一页？

## 技术栈概览

- 前端：Vue 3、TypeScript、Vite、MapLibre GL JS、Pinia、ECharts
- 后端：Go、Gin、pgx、sqlc、goose
- 数据库：PostgreSQL、PostGIS，后期加入 pgvector
- 地图服务：静态 MVP 直接加载版本化 GeoJSON；后端化后由 Go 输出 GeoJSON，数据增长后加入 Martin 输出 MVT
- 地图数据维护：QGIS、GDAL
- 文件存储：第一期本地目录，后期 MinIO
- 文档处理：第一期人工整理，后期增加 Python 文档处理任务

## 目录规划

```text
history-map/
├── README.md
├── docs/
│   ├── 00-文档导航.md
│   ├── architecture/
│   │   ├── 01-总体架构.md
│   │   ├── 02-RAG知识库架构.md
│   │   └── 03-项目目录规划.md
│   ├── product/
│   │   ├── 01-产品定位与核心功能.md
│   │   ├── 02-安史之乱专题规划.md
│   │   └── 03-竞品与差异化.md
│   ├── development/
│   │   ├── 01-前端技术栈.md
│   │   ├── 02-后端技术栈-Go.md
│   │   ├── 03-开发阶段规划.md
│   │   └── 04-本地环境检查.md
│   ├── decisions/
│   │   ├── 0001-静态前端MVP优先.md
│   │   └── 0002-地形优先二期产品纠偏.md
│   ├── plans/
│   │   ├── mvp-scope.md
│   │   ├── mvp-tasks.md
│   │   ├── mvp-acceptance.md
│   │   ├── phase-2-terrain-scope.md
│   │   ├── phase-2-terrain-tasks.md
│   │   └── phase-2-terrain-acceptance.md
│   ├── reviews/
│   │   └── anshi-mvp-content-review.md
│   └── data/
│       ├── 01-核心数据模型.md
│       ├── 02-地图数据与图层.md
│       └── 03-史料引用与数据可信度.md
├── frontend/       # 后续 Vue 项目
├── backend/        # 后续 Go 项目
├── data/
│   └── curated/     # 人工整理、待审核的结构化资料笔记
├── scripts/        # 数据导入、转换、校验脚本
└── deploy/         # Docker Compose、部署配置
```

## 第一阶段原则

1. 单体优先，不做微服务。
2. 数据质量优先，不先追求大而全。
3. 先让地形、关隘、河流、平原、通道和路线方向在地图上共同讲清军事地理，再扩张后台、知识库、多专题或更复杂的三维表现。
4. 先人工录入核心史料，再做自动 RAG。
5. 每个地点、路线和观点都保留资料来源和可信度。
