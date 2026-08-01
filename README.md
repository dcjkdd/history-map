# 中国古代战争地形地图（history-map）

一个以真实地形为基础，结合历史城市、关隘、河流、古道、战役、人物、行军路线、时间轴和史料引用的交互式中国历史地图。

首个专题：**安史之乱（755—763）**。

## 当前执行基线

当前第一可发布版本采用只读静态前端 MVP，聚焦“潼关防线、灵宝出战与长安失守”。本期暂不建设 Go、PostgreSQL/PostGIS、数据后台、RAG 和三维地形。

- [MVP 范围](docs/plans/mvp-scope.md)
- [MVP 开发任务](docs/plans/mvp-tasks.md)
- [MVP 验收标准](docs/plans/mvp-acceptance.md)
- [ADR-0001：静态前端 MVP 优先](docs/decisions/0001-静态前端MVP优先.md)

发生实施冲突时，以 ADR 中记录的文档权威顺序为准。下方技术栈仍是长期演进目标。

## 第一期 MVP 本地入口

当前可运行的第一期 MVP 位于 `frontend/`；仓库根目录没有 `package.json`。在仓库根目录执行：

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
│   │   └── 0001-静态前端MVP优先.md
│   ├── plans/
│   │   ├── mvp-scope.md
│   │   ├── mvp-tasks.md
│   │   └── mvp-acceptance.md
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
3. 先完成二维可用版，再做三维地形。
4. 先人工录入核心史料，再做自动 RAG。
5. 每个地点、路线和观点都保留资料来源和可信度。
