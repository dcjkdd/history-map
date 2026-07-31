import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const PI = Math.PI
const EARTH_RADIUS_METERS = 6_371_008.8
const KRASOVSKY_SEMI_MAJOR_AXIS = 6_378_245
const GCJ_ECCENTRICITY_SQUARED = 0.006693421622965943

const reportPoints = [
  {
    id: 'pozhai-village',
    name: '坡寨村',
    rawCoordinate: [110.891736, 34.61947],
    reportLocation: 'PDF 第 30 页 / 印刷第 25 页，表 2.6-1',
    imageryAssessment:
      '原值和转换值都接近坡寨村聚落，单独看这一点不能区分两种假设。',
    hypothesisResult: 'AMBIGUOUS',
  },
  {
    id: 'pozhai-houchengzi-group',
    name: '坡寨村后城子组',
    rawCoordinate: [110.888657, 34.62094],
    reportLocation: 'PDF 第 30 页 / 印刷第 25 页，表 2.6-1',
    imageryAssessment:
      '原值落在坡寨村北部聚落，GCJ-02 转换值落在其西侧农田，支持原值直接叠加。',
    hypothesisResult: 'SUPPORTS_RAW',
  },
  {
    id: 'yuanmenshang',
    name: '原门上',
    rawCoordinate: [110.883443, 34.618408],
    reportLocation: 'PDF 第 30 页 / 印刷第 25 页，表 2.6-1',
    imageryAssessment:
      '原值落在聚落西缘，GCJ-02 转换值落在更西侧农田，支持原值直接叠加。',
    hypothesisResult: 'SUPPORTS_RAW',
  },
  {
    id: 'chousangyuan',
    name: '稠桑原',
    rawCoordinate: [110.872607, 34.615468],
    reportLocation: 'PDF 第 30 页 / 印刷第 25 页，表 2.6-1',
    imageryAssessment:
      '原值落在西部聚落东缘，GCJ-02 转换值落在该聚落以西的台地/农田，支持原值直接叠加。',
    hypothesisResult: 'SUPPORTS_RAW',
  },
  {
    id: 'leijiagou-village',
    name: '雷家沟村',
    rawCoordinate: [110.876791, 34.613537],
    reportLocation: 'PDF 第 30 页 / 印刷第 25 页，表 2.6-1',
    imageryAssessment:
      '原值和转换值附近都可见小型聚落，缺少独立同名标签，单独看这一点不能区分两种假设。',
    hypothesisResult: 'AMBIGUOUS',
  },
]

const reportSiteAnchors = [
  {
    id: 'site-southwest-corner',
    name: '厂区西南角',
    rawCoordinate: [110.893599, 34.618411],
    reportLocation: 'PDF 第 101 页 / 印刷第 96 页注释',
  },
  {
    id: 'site-monitoring-point',
    name: '项目厂区监测点',
    rawCoordinate: [110.894194, 34.618871],
    reportLocation: 'PDF 第 124 页 / 印刷第 119 页，表 4.2-4',
  },
  {
    id: 'site-risk-table-point',
    name: '建设项目地理坐标',
    rawCoordinate: [110.894122, 34.618886],
    reportLocation: 'PDF 第 253 页 / 印刷第 248 页，表 5.2-51',
  },
]

function transformLatitude(longitudeOffset, latitudeOffset) {
  let value =
    -100 +
    2 * longitudeOffset +
    3 * latitudeOffset +
    0.2 * latitudeOffset * latitudeOffset +
    0.1 * longitudeOffset * latitudeOffset +
    0.2 * Math.sqrt(Math.abs(longitudeOffset))

  value +=
    ((20 * Math.sin(6 * longitudeOffset * PI) +
      20 * Math.sin(2 * longitudeOffset * PI)) *
      2) /
    3
  value +=
    ((20 * Math.sin(latitudeOffset * PI) +
      40 * Math.sin((latitudeOffset / 3) * PI)) *
      2) /
    3
  value +=
    ((160 * Math.sin((latitudeOffset / 12) * PI) +
      320 * Math.sin((latitudeOffset * PI) / 30)) *
      2) /
    3

  return value
}

function transformLongitude(longitudeOffset, latitudeOffset) {
  let value =
    300 +
    longitudeOffset +
    2 * latitudeOffset +
    0.1 * longitudeOffset * longitudeOffset +
    0.1 * longitudeOffset * latitudeOffset +
    0.1 * Math.sqrt(Math.abs(longitudeOffset))

  value +=
    ((20 * Math.sin(6 * longitudeOffset * PI) +
      20 * Math.sin(2 * longitudeOffset * PI)) *
      2) /
    3
  value +=
    ((20 * Math.sin(longitudeOffset * PI) +
      40 * Math.sin((longitudeOffset / 3) * PI)) *
      2) /
    3
  value +=
    ((150 * Math.sin((longitudeOffset / 12) * PI) +
      300 * Math.sin((longitudeOffset / 30) * PI)) *
      2) /
    3

  return value
}

function wgs84ToGcj02([longitude, latitude]) {
  const latitudeRadians = (latitude / 180) * PI
  const sineLatitude = Math.sin(latitudeRadians)
  const magic = 1 - GCJ_ECCENTRICITY_SQUARED * sineLatitude * sineLatitude
  const squareRootMagic = Math.sqrt(magic)
  const latitudeDelta =
    (transformLatitude(longitude - 105, latitude - 35) * 180) /
    (((KRASOVSKY_SEMI_MAJOR_AXIS * (1 - GCJ_ECCENTRICITY_SQUARED)) /
      (magic * squareRootMagic)) *
      PI)
  const longitudeDelta =
    (transformLongitude(longitude - 105, latitude - 35) * 180) /
    ((KRASOVSKY_SEMI_MAJOR_AXIS / squareRootMagic) *
      Math.cos(latitudeRadians) *
      PI)

  return [longitude + longitudeDelta, latitude + latitudeDelta]
}

function gcj02ToWgs84(coordinate) {
  let candidate = [...coordinate]

  for (let iteration = 0; iteration < 12; iteration += 1) {
    const projected = wgs84ToGcj02(candidate)
    candidate = [
      candidate[0] - (projected[0] - coordinate[0]),
      candidate[1] - (projected[1] - coordinate[1]),
    ]
  }

  return candidate
}

function haversineDistanceMeters([longitudeA, latitudeA], [longitudeB, latitudeB]) {
  const latitudeARadians = (latitudeA / 180) * PI
  const latitudeBRadians = (latitudeB / 180) * PI
  const latitudeDelta = ((latitudeB - latitudeA) / 180) * PI
  const longitudeDelta = ((longitudeB - longitudeA) / 180) * PI
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeARadians) *
      Math.cos(latitudeBRadians) *
      Math.sin(longitudeDelta / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine))
}

function round(value, decimalPlaces) {
  return Number(value.toFixed(decimalPlaces))
}

function calculateCandidate(point) {
  const convertedCoordinate = gcj02ToWgs84(point.rawCoordinate)
  const roundTripCoordinate = wgs84ToGcj02(convertedCoordinate)

  return {
    ...point,
    rawCoordinate: point.rawCoordinate.map((value) => round(value, 6)),
    gcj02ToWgs84Coordinate: convertedCoordinate.map((value) => round(value, 7)),
    hypothesisSeparationMeters: round(
      haversineDistanceMeters(point.rawCoordinate, convertedCoordinate),
      1,
    ),
    conversionRoundTripErrorMeters: round(
      haversineDistanceMeters(point.rawCoordinate, roundTripCoordinate),
      4,
    ),
  }
}

const evaluatedReportPoints = reportPoints.map(calculateCandidate)
const evaluatedSiteAnchors = reportSiteAnchors.map(calculateCandidate)
const allSeparations = [...evaluatedReportPoints, ...evaluatedSiteAnchors].map(
  ({ hypothesisSeparationMeters }) => hypothesisSeparationMeters,
)
const rawSupportCount = evaluatedReportPoints.filter(
  ({ hypothesisResult }) => hypothesisResult === 'SUPPORTS_RAW',
).length
const ambiguousCount = evaluatedReportPoints.filter(
  ({ hypothesisResult }) => hypothesisResult === 'AMBIGUOUS',
).length

assert.equal(evaluatedReportPoints.length, 5)
assert.equal(evaluatedSiteAnchors.length, 3)
assert.equal(rawSupportCount, 3)
assert.equal(ambiguousCount, 2)
assert.ok(
  [...evaluatedReportPoints, ...evaluatedSiteAnchors].every(
    ({ conversionRoundTripErrorMeters }) => conversionRoundTripErrorMeters <= 0.001,
  ),
)

const output = {
  schemaVersion: 1,
  id: 'lingbao-chousangyuan-crs-technical-review-2026-07-31',
  status: 'APPROVED',
  certainty: 'DISPUTED',
  reviewer: 'banq',
  reviewDate: '2026-07-31',
  purpose:
    '仅核验现代“稠桑原”居民点坐标候选的技术参考系；不核验唐代灵宝西原、756 年战场中心、区域边界或路线。',
  reportEvidence: {
    sourceId: 'SRC-SPATIAL-03',
    pdfSha256: '17a8686f127887f180943f004c6db251161ca8585183a1fd7811a7660de7f582',
    coordinateReferenceSystemDeclaration: null,
    points: evaluatedReportPoints,
    siteAnchors: evaluatedSiteAnchors,
    statedSiteContext:
      '报告称项目西侧 123 米为坡寨村、南侧为灵宝市生活垃圾填埋场，北侧及东侧为乡道和荒地。',
  },
  testedHypotheses: [
    {
      id: 'RAW_AS_CRS84',
      description:
        '不移动报告数值，直接作为与 WGS84 / CGCS2000 兼容的经纬度叠加到 EPSG:4326 影像。',
    },
    {
      id: 'GCJ02_TO_CRS84',
      description:
        '把报告数值视为 GCJ-02，再用标准迭代反算为 WGS84 后叠加。',
      conversion:
        '标准 GCJ-02 偏移公式；12 次反向迭代。这里只用于假设检验，不修改来源数据。',
      separationMeters: {
        minimum: Math.min(...allSeparations),
        maximum: Math.max(...allSeparations),
        mean: round(
          allSeparations.reduce((sum, value) => sum + value, 0) /
            allSeparations.length,
          1,
        ),
      },
    },
  ],
  independentImageryCrossCheck: {
    sourceId: 'SRC-SPATIAL-07',
    provider: 'Esri World Imagery',
    serviceItemId: '10df2279f9684e4a9f6a7f08febac2a9',
    serviceCurrentVersion: 11.3,
    serviceItemModified: '2026-07-01T02:13:31.000Z',
    accessDate: '2026-07-31',
    export: {
      boundingBox: [110.855, 34.6, 110.925, 34.642],
      bboxSpatialReference: 4326,
      imageSpatialReference: 4326,
      pixelSize: [1800, 1080],
      sha256: 'c710bc4c093c555994ca5d36773a81f318e8e754855f59a5303ceecf97589020',
      retainedInRepository: false,
    },
    locationCitation: {
      provider: 'Vantor',
      product: 'Vivid',
      sourceDescription: 'LG02',
      captureDate: '2025-08-19',
      resolutionMeters: 0.34,
      accuracyMeters: 5,
      blockName: 'Vivid_Standard_30_CN20_25Q3',
      releaseName: 'Raster Basemaps 2026.R05',
      coverageQuerySha256:
        'ff247db44e1b5467573f789465a7e0c736ceeedd81e1c218c2ad8c4471d0f2e6',
    },
    manualAssessment: {
      namedPointResults: {
        supportsRaw: rawSupportCount,
        supportsGcj02Conversion: 0,
        ambiguous: ambiguousCount,
      },
      siteAnchorResult:
        '三个相互接近的厂址坐标在原值叠加时位于坡寨村东侧、可见填埋设施北侧，符合报告文字；按 GCJ-02 转换后整体西南移约 518 米并落入坡寨村聚落，和报告现场关系冲突。',
      overall:
        '三个可区分的村庄样本和厂址锚点一致支持原值直接叠加；两个村庄样本因两种位置附近均有聚落而记为歧义，没有样本支持 GCJ-02 转换。',
    },
  },
  osmCrossCheck: {
    accessDate: '2026-07-31',
    exactNameMatchesForFiveSamples: 0,
    nearbyReference:
      '仅找到 OpenStreetMap node/3157352047 v4“函谷关镇”，未把镇级点当作村庄或稠桑原匹配依据。',
    roleInDecision:
      'OSM 结果只用于说明缺少同名开放点；不参与选择原值或 GCJ-02 转换值。',
  },
  technicalDecision: {
    preferredHypothesis: 'RAW_AS_CRS84',
    rejectedHypothesis: 'GCJ02_TO_CRS84',
    candidateCoordinate: [110.872607, 34.615468],
    coordinateTreatment:
      '原数值作为 OGC:CRS84 候选使用，不执行 GCJ-02 转换。',
    residualUncertainty:
      '技术核验不能区分 WGS84 与 CGCS2000；两者在本项目地图尺度上的差异远小于来源与影像可验证精度。报告的小数位只表示抄录精度，不表示已证明亚米级定位准确度。',
    contentBoundary:
      '该点仍只代表现代同名居民点，并保持 DISPUTED / PENDING_REVIEW；不证明唐代灵宝西原、秦函谷关旧址或 756 年战场中心，不生成边界、缓冲区或路线。',
    approvalRecord:
      '`banq` 于 2026-07-31 批准该技术处理和候选使用边界；必须继续保持 DISPUTED，不得扩展为历史战场点、范围或路线。',
  },
  methodLimits: [
    '报告编制方未声明源 CRS，本结论是多点与独立影像的技术交叉核验，不是编制方书面确认。',
    '影像目视核验只比较聚落和填埋设施的空间关系，不描绘或复用影像中的建筑、道路、村界或设施边界。',
    'World Imagery 是可更新服务；本记录用访问日期、服务版本、影像块元数据、导出范围和 SHA-256 固定本次核验条件，影像文件不进入仓库。',
    '未找到五个样本的同名 OSM 固定点，因此没有把单一镇级标签或搜索结果当作独立坐标真值。',
  ],
}

const outputPath = resolve(
  process.argv.slice(2).find((argument) => !argument.startsWith('--')) ??
    'data/curated/spatial/lingbao-crs-technical-review.json',
)
const serialized = `${JSON.stringify(output, null, 2)}\n`

if (process.argv.includes('--check')) {
  const existing = readFileSync(outputPath, 'utf8')
  if (existing !== serialized) {
    throw new Error(`Generated review differs from ${outputPath}`)
  }
  console.log(`Verified ${outputPath}`)
} else {
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, serialized)
  console.log(`Wrote ${outputPath}`)
}
