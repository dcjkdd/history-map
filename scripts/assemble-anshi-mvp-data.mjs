import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = fileURLToPath(new URL('.', import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '..')

const sourceNotesPath = resolve(
  repositoryRoot,
  'data/curated/anshi-mvp-source-notes.md',
)
const contentReviewPath = resolve(
  repositoryRoot,
  'docs/reviews/anshi-mvp-content-review.md',
)
const placeCandidatesPath = resolve(
  repositoryRoot,
  'data/curated/spatial/anshi-place-candidates.geojson',
)
const geographyCandidatesPath = resolve(
  repositoryRoot,
  'data/curated/spatial/anshi-natural-earth-v5.0.0.geojson',
)
const routeCandidatesPath = resolve(
  repositoryRoot,
  'data/curated/spatial/anshi-route-candidates.geojson',
)
const outputPath = resolve(
  repositoryRoot,
  'frontend/public/data/anshi/mvp-v1.json',
)

const sourceNotes = readFileSync(sourceNotesPath, 'utf8')
const contentReview = readFileSync(contentReviewPath, 'utf8')
const placeCandidates = readJson(placeCandidatesPath)
const geographyCandidates = readJson(geographyCandidatesPath)
const routeCandidates = readJson(routeCandidatesPath)

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function splitMarkdownRow(line) {
  return line.split('|').map((cell) => cell.trim())
}

function assertMarkdownRowLength(row, expectedLengths, label) {
  assert(
    expectedLengths.includes(row.length),
    `${label} has ${row.length} cells; expected ${expectedLengths.join(' or ')}`,
  )
  return row
}

function stripMarkdown(value) {
  return value
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replaceAll('`', '')
    .trim()
}

function firstUrl(value) {
  const markdownUrl = value.match(/\[[^\]]+]\((https?:\/\/[^)]+)\)/)?.[1]
  if (markdownUrl) {
    return markdownUrl
  }

  return value.match(/https?:\/\/[^\s`；)]+/)?.[0] ?? null
}

function accessDate(value) {
  return value.match(/访问日期\s*(\d{4}-\d{2}-\d{2})/)?.[1] ?? null
}

function splitIds(value) {
  return stripMarkdown(value)
    .split('、')
    .map((id) => id.trim())
    .filter(Boolean)
}

const sourceOverrides = {
  'SRC-PRIMARY-01': {
    publisher: '维基文库',
    attribution: '维基文库贡献者',
  },
  'SRC-PRIMARY-03': {
    publisher: '维基文库',
    attribution: '维基文库贡献者',
  },
  'SRC-MODERN-01': {
    publisher: '上海人民出版社',
    publishYear: 2025,
  },
  'SRC-HERITAGE-01': {
    publisher: '中国政府网',
    publishYear: 2013,
  },
  'SRC-HERITAGE-02': {
    publisher: '渭南日报',
    publishYear: 2024,
  },
  'SRC-HISTGEO-01': {
    publisher: '新华网',
    publishYear: 2024,
  },
  'SRC-LOCALHIST-01': {
    publisher: '陕西人民出版社',
    publishYear: 1992,
  },
  'SRC-SPATIAL-01': {
    publisher: 'Natural Earth',
    licenseName: 'Public domain',
    attribution: 'Made with Natural Earth',
    originalCrs: 'OGC:CRS84 (WGS84 longitude, latitude)',
    processingNotes:
      '按资料笔记记录的固定 v5.0.0 源要素选择黄河、渭河线段和秦岭广义区域；未重投影，输出仅作现代概览。',
    outputId:
      'geography-yellow-river, geography-wei-river, geography-qinling',
  },
  'SRC-SPATIAL-02': osmOverride(
    'place-tongguan',
    'OpenStreetMap way/1195138308 v3 及其固定节点引用',
    '读取固定 way v3 的闭合环并以经纬度平面多边形质心公式计算代表点；未裁剪、简化或重投影。',
  ),
  'SRC-SPATIAL-03': {
    publisher: '灵宝市城市管理局',
    licenseName: '不适用：仅引用必要的单项事实数据',
    originalCrs:
      '报告未声明；原值经成组技术核验后仅作为 OGC:CRS84 候选',
    processingNotes:
      '保留报告原值；以五个居民点和三个厂址锚点排除 GCJ-02 转换假设，不复制表格、附图或派生历史范围。',
    outputId: 'place-lingbao',
  },
  'SRC-HERITAGE-03': {
    publisher: '河南档案信息网',
    publishYear: 2021,
  },
  'SRC-HERITAGE-04': {
    publisher: '三门峡日报',
    publishYear: 2026,
  },
  'SRC-SPATIAL-04': osmOverride(
    'place-shanzhou',
    'OpenStreetMap node/12768197183 v1',
    '直接读取固定 node v1 的 WGS84 / OGC:CRS84 坐标；未裁剪、简化、计算质心或重投影。',
  ),
  'SRC-HERITAGE-05': {
    publisher: '国家发展和改革委员会',
    publishYear: 2020,
  },
  'SRC-SPATIAL-05': osmOverride(
    'place-luoyang',
    'OpenStreetMap way/865951589 v4 及其固定节点引用',
    '读取固定 way v4 的闭合环并以经纬度平面多边形质心公式计算代表点；未裁剪、简化或重投影。',
  ),
  'SRC-HERITAGE-06': {
    publisher: '西安市地方志办公室',
    publishYear: 2025,
  },
  'SRC-HERITAGE-07': {
    publisher: '陕西省文物局',
    publishYear: 2012,
  },
  'SRC-SPATIAL-06': osmOverride(
    'place-changan',
    'OpenStreetMap way/280412702 v4 及其固定节点引用',
    '读取固定 way v4 的闭合环并以经纬度平面多边形质心公式计算代表点；未裁剪、简化或重投影。',
  ),
  'SRC-SPATIAL-07': {
    publisher: 'Esri',
    attribution:
      'Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community',
    originalCrs: 'EPSG:4326',
    processingNotes:
      '只用于原值与 GCJ-02 转换值的成组技术比较；影像、截图、描绘几何和派生图层均不进入发布数据。',
    outputId: 'claim-place-lingbao-coordinate-candidate-01',
  },
}

function osmOverride(outputId, coverage, processingNotes) {
  return {
    publisher: 'OpenStreetMap',
    licenseName: 'Open Database License 1.0',
    attribution: '© OpenStreetMap contributors',
    originalCrs: 'WGS84 / OGC:CRS84',
    coverage,
    processingNotes,
    outputId,
  }
}

const sourceRows = sourceNotes
  .split('\n')
  .filter((line) => /^\| SRC-/.test(line))
  .map((line) =>
    assertMarkdownRowLength(splitMarkdownRow(line), [12, 13], 'Source row'),
  )

const approvedSourceRows = sourceRows.filter((row) => row.at(-2) === 'APPROVED')
assert(
  approvedSourceRows.length === 19,
  `Expected 19 approved Sources, found ${approvedSourceRows.length}`,
)

const sources = approvedSourceRows.map((row) => {
  const id = row[1]
  const override = sourceOverrides[id] ?? {}
  const locatorCell = row.at(-6)
  const urlCell = row.at(-5)
  const licenseCell = row.at(-4)
  const restrictionCell = row.at(-3)

  return {
    id,
    title: stripMarkdown(row[3]),
    author: stripMarkdown(row[4]) || null,
    edition: stripMarkdown(row[5]) || null,
    publisher: override.publisher ?? null,
    publishYear: override.publishYear ?? null,
    sourceType: stripMarkdown(row[2]),
    provenance: {
      url: firstUrl(urlCell),
      accessDate: accessDate(urlCell) ?? accessDate(row.join('|')),
      licenseName:
        override.licenseName ?? (stripMarkdown(licenseCell) || null),
      licenseUrl: firstUrl(licenseCell),
      attribution: override.attribution ?? null,
      usageRestrictions: stripMarkdown(restrictionCell) || null,
      dataVersion: stripMarkdown(row[5]) || null,
      originalCrs: override.originalCrs ?? null,
      coverage: override.coverage ?? (stripMarkdown(locatorCell) || null),
      processingNotes: override.processingNotes ?? null,
      outputId: override.outputId ?? null,
    },
  }
})

const sourceIds = new Set(sources.map((source) => source.id))
assert(sourceIds.size === sources.length, 'Approved Source IDs must be unique')

const citationRows = sourceNotes
  .split('\n')
  .filter((line) => /^\| CIT-/.test(line))
  .map((line) =>
    assertMarkdownRowLength(splitMarkdownRow(line), [10], 'Citation row'),
  )

const approvedCitationRows = citationRows.filter(
  (row) => row[8] === 'APPROVED',
)
assert(
  approvedCitationRows.length === 36,
  `Expected 36 approved Citations, found ${approvedCitationRows.length}`,
)

const citations = approvedCitationRows.map((row) => ({
  id: row[1],
  sourceId: row[2],
  chapter: stripMarkdown(row[3]) || null,
  locator: stripMarkdown(row[4]) || null,
  pageStart: null,
  pageEnd: null,
  quote: null,
  summary: stripMarkdown(row[5]),
  viewpointType: row[6],
  certainty: row[7],
}))

const citationIds = new Set(citations.map((citation) => citation.id))
assert(
  citationIds.size === citations.length,
  'Approved Citation IDs must be unique',
)
for (const citation of citations) {
  assert(
    sourceIds.has(citation.sourceId),
    `Approved Citation ${citation.id} references unavailable Source ${citation.sourceId}`,
  )
}

const claimRows = sourceNotes
  .split('\n')
  .filter((line) => /^\| claim-/.test(line))
  .map(parseClaimRow)

assert(claimRows.length === 38, `Expected 38 Claims, found ${claimRows.length}`)
assert(
  claimRows.filter((claim) => claim.status === 'APPROVED').length === 35,
  'Expected 35 approved Claims',
)

const claimsById = new Map(claimRows.map((claim) => [claim.claimId, claim]))
assert(claimsById.size === claimRows.length, 'Claim IDs must be unique')

const reviewRows = contentReview
  .split('\n')
  .filter((line) =>
    /^\| (Place|Event|Geography|RoutePlan|RouteSegment|Source|Citation|Claim) \|/.test(
      line,
    ),
  )
  .map((line) =>
    assertMarkdownRowLength(splitMarkdownRow(line), [15], 'Review row'),
  )

assert(
  reviewRows.filter((row) => ['Source', 'Citation', 'Claim'].includes(row[1]))
    .length === 105,
  `Expected 105 Source/Citation/Claim review rows, found ${reviewRows.filter((row) => ['Source', 'Citation', 'Claim'].includes(row[1])).length}`,
)

const reviewsByKey = new Map(
  reviewRows.map((row) => [`${row[1]}:${row[2]}`, row]),
)
assert(
  reviewsByKey.size === reviewRows.length,
  'Source/Citation/Claim review keys must be unique',
)

function assertHumanApproval(entityType, entityId) {
  const review = reviewsByKey.get(`${entityType}:${entityId}`)
  assert(review, `Missing content review for ${entityType} ${entityId}`)
  assert(
    review[12] === 'APPROVED',
    `${entityType} ${entityId} is not APPROVED in the content review`,
  )
  assert(
    review[10] === 'banq',
    `${entityType} ${entityId} has no approved human reviewer`,
  )
  assert(
    review[11] === '2026-07-31',
    `${entityType} ${entityId} has no approved human review date`,
  )
}

for (const source of sources) {
  assertHumanApproval('Source', source.id)
}
for (const citation of citations) {
  assertHumanApproval('Citation', citation.id)
}
for (const claim of claimRows.filter((candidate) => candidate.status === 'APPROVED')) {
  assertHumanApproval('Claim', claim.claimId)
}

function parseClaimRow(line) {
  const row = splitMarkdownRow(line)
  const typedEntity = ['Place', 'Geography', 'RoutePlan', 'RouteSegment'].includes(
    row[2],
  )

  if (typedEntity) {
    assertMarkdownRowLength(row, [12], `Claim ${row[1]}`)
    return {
      claimId: row[1],
      entityType: row[2],
      entityId: row[3],
      field: stripMarkdown(row[4]),
      text: stripMarkdown(row[5]),
      citationIds: splitIds(row[6]),
      viewpointType: row[7],
      certainty: row[8],
      status: row[10],
    }
  }

  assertMarkdownRowLength(row, [11], `Claim ${row[1]}`)
  return {
    claimId: row[1],
    entityType: 'Event',
    entityId: row[2],
    field: stripMarkdown(row[3]),
    text: stripMarkdown(row[4]),
    citationIds: splitIds(row[5]),
    viewpointType: row[6],
    certainty: row[7],
    status: row[9],
  }
}

function releaseClaim(claimId, expectedEntityType, expectedEntityId, expectedField) {
  const claim = claimsById.get(claimId)
  assert(claim, `Missing Claim ${claimId}`)
  assert(claim.status === 'APPROVED', `Claim ${claimId} is not approved`)
  assertHumanApproval('Claim', claimId)
  assert(
    claim.entityType === expectedEntityType,
    `Claim ${claimId} belongs to ${claim.entityType}, expected ${expectedEntityType}`,
  )
  assert(
    claim.entityId === expectedEntityId,
    `Claim ${claimId} belongs to ${claim.entityId}, expected ${expectedEntityId}`,
  )
  assert(
    claim.field === expectedField,
    `Claim ${claimId} targets ${claim.field}, expected ${expectedField}`,
  )
  for (const citationId of claim.citationIds) {
    assert(
      citationIds.has(citationId),
      `Claim ${claimId} references unavailable Citation ${citationId}`,
    )
  }

  return {
    claimId: claim.claimId,
    text: claim.text,
    viewpointType: claim.viewpointType,
    certainty: claim.certainty,
    citationIds: claim.citationIds,
  }
}

const placeConfigurations = [
  {
    id: 'place-changan',
    name: '长安',
    placeType: 'CITY',
    summaryClaimId: 'claim-place-changan-scope-modern-01',
    strategicRoleClaimId: 'claim-place-changan-strategic-role-modern-01',
    coordinateClaimId: 'claim-place-changan-coordinate-candidate-01',
  },
  {
    id: 'place-luoyang',
    name: '洛阳',
    placeType: 'CITY',
    summaryClaimId: 'claim-place-luoyang-scope-modern-01',
    strategicRoleClaimId: 'claim-place-luoyang-strategic-role-modern-01',
    coordinateClaimId: 'claim-place-luoyang-coordinate-candidate-01',
  },
  {
    id: 'place-shanzhou',
    name: '陕州',
    placeType: 'CITY',
    summaryClaimId: 'claim-place-shanzhou-scope-modern-01',
    strategicRoleClaimId: 'claim-place-shanzhou-strategic-role-modern-01',
    coordinateClaimId: 'claim-place-shanzhou-coordinate-candidate-01',
  },
  {
    id: 'place-lingbao',
    name: '灵宝',
    placeType: 'BATTLEFIELD',
    summaryClaimId: 'claim-place-lingbao-scope-modern-01',
    strategicRoleClaimId: 'claim-place-lingbao-strategic-role-modern-01',
    coordinateClaimId: 'claim-place-lingbao-coordinate-candidate-01',
  },
  {
    id: 'place-tongguan',
    name: '潼关',
    placeType: 'PASS',
    summaryClaimId: 'claim-place-tongguan-site-dispute-modern-01',
    strategicRoleClaimId: 'claim-place-tongguan-strategic-role-modern-01',
    coordinateClaimId: 'claim-place-tongguan-coordinate-candidate-01',
  },
]

const placesById = new Map(
  placeCandidates.features.map((feature) => [
    feature.properties.candidateFor,
    feature,
  ]),
)

const places = {
  type: 'FeatureCollection',
  features: placeConfigurations.map((configuration) => {
    assertHumanApproval('Place', configuration.id)
    const candidate = placesById.get(configuration.id)
    assertApprovedSpatialCandidate(candidate, configuration.id)

    return {
      type: 'Feature',
      geometry: candidate.geometry,
      properties: {
        id: configuration.id,
        name: configuration.name,
        modernName: null,
        placeType: configuration.placeType,
        summary: releaseClaim(
          configuration.summaryClaimId,
          'Place',
          configuration.id,
          'Place.summary',
        ),
        strategicRole: releaseClaim(
          configuration.strategicRoleClaimId,
          'Place',
          configuration.id,
          'Place.strategicRole',
        ),
        certainty: candidate.properties.certainty,
        coordinateNote: releaseClaim(
          configuration.coordinateClaimId,
          'Place',
          configuration.id,
          'Place.coordinateNote 候选',
        ),
        citationIds: candidate.properties.citationCandidateIds,
      },
    }
  }),
}

function assertApprovedSpatialCandidate(candidate, id) {
  assert(candidate, `Missing spatial candidate for ${id}`)
  assert(candidate.properties.candidateStatus === 'APPROVED', `${id} is not approved`)
  assert(candidate.properties.reviewer === 'banq', `${id} has no approved reviewer`)
  assert(
    candidate.properties.reviewDate === '2026-07-31',
    `${id} has no approved review date`,
  )
  for (const citationId of candidate.properties.citationCandidateIds) {
    assert(
      citationIds.has(citationId),
      `${id} references unavailable spatial Citation ${citationId}`,
    )
  }
}

const geographyConfigurations = [
  {
    candidateId: 'spatial-candidate-yellow-river-ne-v5',
    id: 'geography-yellow-river',
    claimId: 'claim-geography-yellow-river-background-01',
  },
  {
    candidateId: 'spatial-candidate-wei-river-ne-v5',
    id: 'geography-wei-river',
    claimId: 'claim-geography-wei-river-background-01',
  },
  {
    candidateId: 'spatial-candidate-qinling-ne-v5',
    id: 'geography-qinling',
    claimId: 'claim-geography-qinling-background-01',
  },
]

const geographyByCandidateId = new Map(
  geographyCandidates.features.map((feature) => [feature.properties.id, feature]),
)

const geography = {
  type: 'FeatureCollection',
  features: geographyConfigurations.map((configuration) => {
    assertHumanApproval('Geography', configuration.id)
    const candidate = geographyByCandidateId.get(configuration.candidateId)
    assertApprovedSpatialCandidate(candidate, configuration.id)

    return {
      type: 'Feature',
      geometry: candidate.geometry,
      properties: {
        id: configuration.id,
        name: candidate.properties.name,
        geographyType: candidate.properties.geographyType,
        summary: releaseClaim(
          configuration.claimId,
          'Geography',
          configuration.id,
          'Geography.summary',
        ),
        certainty: candidate.properties.certainty,
        citationIds: candidate.properties.citationCandidateIds,
      },
    }
  }),
}

const routeSegments = {
  type: 'FeatureCollection',
  features: routeCandidates.features.map((candidate) => {
    const properties = candidate.properties
    assertHumanApproval('RouteSegment', properties.id)
    assertApprovedSpatialCandidate(
      {
        properties: {
          ...properties,
          citationCandidateIds: properties.citationIds,
        },
      },
      properties.id,
    )
    const summary = releaseClaim(
      properties.summary.claimId,
      'RouteSegment',
      properties.id,
      'RouteSegment.summary',
    )
    assert(
      summary.text === properties.summary.text,
      `${properties.id} summary differs from the approved Claim`,
    )

    const fromPlace = places.features.find(
      (feature) => feature.properties.id === properties.fromPlaceId,
    )
    const toPlace = places.features.find(
      (feature) => feature.properties.id === properties.toPlaceId,
    )
    assert(fromPlace, `${properties.id} has unknown fromPlaceId`)
    assert(toPlace, `${properties.id} has unknown toPlaceId`)
    assert(
      candidate.geometry.type === 'LineString' &&
        candidate.geometry.coordinates.length === 2,
      `${properties.id} must be a direct two-point LineString`,
    )
    assert(
      JSON.stringify(candidate.geometry.coordinates[0]) ===
        JSON.stringify(fromPlace.geometry.coordinates),
      `${properties.id} start does not match ${properties.fromPlaceId}`,
    )
    assert(
      JSON.stringify(candidate.geometry.coordinates[1]) ===
        JSON.stringify(toPlace.geometry.coordinates),
      `${properties.id} end does not match ${properties.toPlaceId}`,
    )

    return {
      type: 'Feature',
      geometry: candidate.geometry,
      properties: {
        id: properties.id,
        routeId: properties.routeId,
        routeName: properties.routeName,
        segmentNo: properties.segmentNo,
        side: properties.side,
        actionType: properties.actionType,
        appearAtEventId: properties.appearAtEventId,
        fromPlaceId: properties.fromPlaceId,
        toPlaceId: properties.toPlaceId,
        certainty: properties.certainty,
        summary,
        citationIds: properties.citationIds,
      },
    }
  }),
}

for (const routeId of new Set(
  routeSegments.features.map((feature) => feature.properties.routeId),
)) {
  assertHumanApproval('RoutePlan', routeId)
}

const eventRows = sourceNotes
  .split('\n')
  .filter((line) => /^\| event-/.test(line))
  .map(splitMarkdownRow)
  .filter((row) => /^\d+$/.test(row[2]) && row[12] === 'APPROVED')

assert(eventRows.length === 6, `Expected 6 approved Events, found ${eventRows.length}`)

const events = eventRows.map((row) => {
  const id = row[1]
  const sequence = Number(row[2])
  assertHumanApproval('Event', id)

  return {
    id,
    sequence,
    title: row[3],
    eventType: row[4],
    dateLabel: row[5],
    normalizedDate: null,
    timePrecision: row[7],
    certainty: row[8],
    summary: releaseClaim(
      `claim-event-0${sequence}-summary-modern-01`,
      'Event',
      id,
      'Event.summary',
    ),
    whyItMatters: releaseClaim(
      `claim-event-0${sequence}-why-modern-01`,
      'Event',
      id,
      'Event.whyItMatters',
    ),
    relatedPlaceIds: splitIds(row[9]),
    actorLabels: splitIds(row[10]),
    citationIds: splitIds(row[11]),
  }
})

const dataset = {
  schemaVersion: '1.0',
  topic: {
    id: 'anshi-tongguan-mvp',
    title: '安史之乱：潼关防线至长安失守',
    subtitle: '有出处、标注不确定性的古代战争地形叙事地图',
    summary:
      '以五个经审核地点、三项现代地理背景、六个事件和两条低可信度示意行动方向，呈现潼关防线、灵宝交战与长安局势变化。现代河流、山地和代表点只用于帮助理解空间关系，不声称复原唐代原貌。',
    initialView: {
      center: [110.7, 34.6],
      zoom: 6.5,
    },
    defaultEventId: 'event-01-defense-context',
  },
  places,
  geography,
  routeSegments,
  events,
  sources,
  citations,
}

const referencedCitationIds = new Set()
for (const place of dataset.places.features) {
  collectClaimCitations(place.properties.summary, referencedCitationIds)
  collectClaimCitations(place.properties.strategicRole, referencedCitationIds)
  collectClaimCitations(place.properties.coordinateNote, referencedCitationIds)
  place.properties.citationIds.forEach((id) => referencedCitationIds.add(id))
}
for (const feature of dataset.geography.features) {
  collectClaimCitations(feature.properties.summary, referencedCitationIds)
  feature.properties.citationIds.forEach((id) => referencedCitationIds.add(id))
}
for (const feature of dataset.routeSegments.features) {
  collectClaimCitations(feature.properties.summary, referencedCitationIds)
  feature.properties.citationIds.forEach((id) => referencedCitationIds.add(id))
}
for (const event of dataset.events) {
  collectClaimCitations(event.summary, referencedCitationIds)
  collectClaimCitations(event.whyItMatters, referencedCitationIds)
  event.citationIds.forEach((id) => referencedCitationIds.add(id))
}

function collectClaimCitations(claim, output) {
  claim.citationIds.forEach((id) => output.add(id))
}

const unreferencedCitations = citations
  .map((citation) => citation.id)
  .filter((id) => !referencedCitationIds.has(id))
assert(
  unreferencedCitations.length === 0,
  `Approved Citations are not used by release data: ${unreferencedCitations.join(', ')}`,
)

const referencedSourceIds = new Set(citations.map((citation) => citation.sourceId))
const unreferencedSources = sources
  .map((source) => source.id)
  .filter((id) => !referencedSourceIds.has(id))
assert(
  unreferencedSources.length === 0,
  `Approved Sources are not used by release data: ${unreferencedSources.join(', ')}`,
)

writeFileSync(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')

console.log(
  `Wrote ${outputPath}: ${places.features.length} Places, ${geography.features.length} Geography features, ${routeSegments.features.length} RouteSegments, ${events.length} Events, ${sources.length} Sources, ${citations.length} Citations.`,
)
