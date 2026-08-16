import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  buildRouteDisplayFeatures,
  getRoutePresentation,
} from '../src/domain/routePresentation.ts'
import type { MvpDataset } from '../src/domain/mvpTypes'
import { buildMilitaryGeographyGuides } from '../src/map/layers/militaryGeographyLayer.ts'
import {
  auditContentRelease,
  ContentReleaseAuditError,
  parseContentReviews,
} from './audit-content-release.ts'

export type ReleaseKind =
  | 'TERRAIN'
  | 'BOUNDARY'
  | 'HYDROGRAPHY'
  | 'LANDFORM'
  | 'CORRIDOR'
  | 'DISTANCE_METHOD'
  | 'PRESENTATION'

export type ReleaseCertainty =
  | 'MODERN_REFERENCE'
  | 'FORMAL_UNCERTAIN'
  | 'DISPLAY_ONLY_INFERENCE'

export interface Phase2Review {
  status: string
  reviewer: string
  reviewDate: string
}

export interface Phase2SourceRecord {
  id: string
  institution: string
  title: string
  version: string
  url: string
  accessDate: string
  coverage: unknown
  originalCrs: string
  outputCrs: string
  processing: string[]
  license: {
    name: string
    url: string
    redistribution: string
    attribution: string
    restrictions: string
  }
  runtimeDependencies: RuntimeDependencies
  review: Phase2Review
}

export interface RuntimeDependencies {
  networkRequired: boolean
  tokenRequired: boolean
  externalServices: string[]
  localPaths?: string[]
  localOutputs?: string[]
}

export interface ReleaseMapping {
  type: string
  id: string
}

export interface Phase2ReleaseRecord {
  id: string
  kind: ReleaseKind
  sourceRefs: string[]
  reviewRefs: string[]
  coverage: string
  crs: string
  processing: string[]
  license: {
    sourceRefs: string[]
    redistribution: string
    attribution: string
    restrictions: string
  }
  runtimeDependencies: RuntimeDependencies
  semantics: {
    scope: string
    certainty: ReleaseCertainty
    displayOnly: boolean
    prohibitedInterpretations: string[]
  }
  method?: {
    name: string
    earthRadiusKm: number
    roundingKm: number
    unit: string
    approximateLabelRequired: boolean
    disclaimer: string
  }
  outputs?: Array<{ formalEntityId: string; label: string }>
  review: Phase2Review
  releaseMappings: ReleaseMapping[]
}

export interface Phase2ReleaseRegistry {
  schemaVersion: string
  releaseSetId: string
  review: Phase2Review & { approvalRecord: string }
  frozenArtifacts: Array<{ path: string; sha256: string }>
  sources: Phase2SourceRecord[]
  records: Phase2ReleaseRecord[]
}

interface TerrainManifest {
  schemaVersion: string
  assetSetId: string
  runtimeNetworkRequired: boolean
  sourceBounds: number[]
  displayBounds: number[]
  dem: { sourceInputsCommitted: boolean; inputs: unknown[] }
  provinces: { boundaryFeatures: number; labelFeatures: number }
  licenses: {
    copernicus: {
      access: string
      licenseUrl: string
      requiredAttribution: string
      requiredDisclaimer: string
    }
    geoBoundaries: {
      distributionLicense: string
      upstreamBoundaryMetadataLicense: string
      licenseUrl: string
      requiredAttribution: string
    }
  }
  processing: string[]
  terrainTiles: Array<{ zoom: number; tiles: number }>
  assetBudgetBytes: number
  totalBytes: number
  assets: Array<{ path: string; bytes: number; sha256: string }>
}

export interface TextFile {
  path: string
  contents: string
}

export interface Phase2ReleaseAuditInput {
  registry: Phase2ReleaseRegistry
  dataset: MvpDataset
  sourceNotes: string
  contentReview: string
  manifest: TerrainManifest
  artifactHashes: Record<string, string>
  runtimeSourceText: string
  runtimeDerivedIds: string[]
  runtimeDerivedTexts: string[]
  trackedTextFiles: TextFile[]
}

export interface Phase2ReleaseAuditReport {
  sourceCount: number
  recordCount: number
  mappingCount: number
  trackedTextFileCount: number
}

export class Phase2ReleaseAuditError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(`PHASE2-06 二期发布门禁失败（${issues.length} 项）`)
    this.name = 'Phase2ReleaseAuditError'
    this.issues = issues
  }
}

const EXPECTED_SOURCE_IDS = [
  'P2SRC-COPERNICUS-GLO90-2021-01',
  'P2SRC-GEOBOUNDARIES-CHN-ADM1-9469F09-01',
] as const

const EXPECTED_RECORD_KINDS: Record<string, ReleaseKind> = {
  'P2R-TERRAIN-GLO90-TOPDOWN-01': 'TERRAIN',
  'P2R-BOUNDARY-CHN-ADM1-MODERN-01': 'BOUNDARY',
  'P2R-HYDROGRAPHY-YELLOW-RIVER-01': 'HYDROGRAPHY',
  'P2R-HYDROGRAPHY-WEI-RIVER-01': 'HYDROGRAPHY',
  'P2R-LANDFORM-QINLING-01': 'LANDFORM',
  'P2R-LANDFORM-GUANZHONG-LOWLAND-01': 'LANDFORM',
  'P2R-CORRIDOR-EAST-GUANZHONG-DISPLAY-01': 'CORRIDOR',
  'P2R-DISTANCE-HAVERSINE-MODERN-01': 'DISTANCE_METHOD',
  'P2R-PRESENTATION-ROUTE-YAN-01': 'PRESENTATION',
  'P2R-PRESENTATION-ROUTE-TANG-01': 'PRESENTATION',
}

const EXPECTED_SEMANTICS: Record<
  string,
  { certainty: ReleaseCertainty; displayOnly: boolean; prohibited: string }
> = {
  'P2R-TERRAIN-GLO90-TOPDOWN-01': {
    certainty: 'MODERN_REFERENCE',
    displayOnly: true,
    prohibited: 'Tang-dynasty terrain reconstruction',
  },
  'P2R-BOUNDARY-CHN-ADM1-MODERN-01': {
    certainty: 'MODERN_REFERENCE',
    displayOnly: true,
    prohibited: 'Tang-dynasty administrative boundary',
  },
  'P2R-HYDROGRAPHY-YELLOW-RIVER-01': {
    certainty: 'DISPLAY_ONLY_INFERENCE',
    displayOnly: true,
    prohibited: 'Tang-dynasty river channel',
  },
  'P2R-HYDROGRAPHY-WEI-RIVER-01': {
    certainty: 'DISPLAY_ONLY_INFERENCE',
    displayOnly: true,
    prohibited: 'Tang-dynasty river channel',
  },
  'P2R-LANDFORM-QINLING-01': {
    certainty: 'FORMAL_UNCERTAIN',
    displayOnly: false,
    prohibited: 'precise mountain boundary',
  },
  'P2R-LANDFORM-GUANZHONG-LOWLAND-01': {
    certainty: 'MODERN_REFERENCE',
    displayOnly: true,
    prohibited: 'historical plain polygon',
  },
  'P2R-CORRIDOR-EAST-GUANZHONG-DISPLAY-01': {
    certainty: 'DISPLAY_ONLY_INFERENCE',
    displayOnly: true,
    prohibited: 'historical road',
  },
  'P2R-DISTANCE-HAVERSINE-MODERN-01': {
    certainty: 'DISPLAY_ONLY_INFERENCE',
    displayOnly: true,
    prohibited: 'historical march distance',
  },
  'P2R-PRESENTATION-ROUTE-YAN-01': {
    certainty: 'DISPLAY_ONLY_INFERENCE',
    displayOnly: true,
    prohibited: 'historical road centreline',
  },
  'P2R-PRESENTATION-ROUTE-TANG-01': {
    certainty: 'DISPLAY_ONLY_INFERENCE',
    displayOnly: true,
    prohibited: 'historical road centreline',
  },
}

const REQUIRED_MAPPINGS: Record<string, string[]> = {
  'P2R-TERRAIN-GLO90-TOPDOWN-01': [
    'MANIFEST:phase2-02-glo90-topdown',
    'ASSET:color-relief.png',
    'ASSET_TEMPLATE:terrain/{z}/{x}/{y}.png',
    'MAP_SOURCE:phase2-terrain-color-relief',
    'MAP_SOURCE:phase2-terrain-dem',
    'MAP_LAYER:phase2-terrain-color-relief',
    'MAP_LAYER:phase2-terrain-hillshade',
  ],
  'P2R-BOUNDARY-CHN-ADM1-MODERN-01': [
    'ASSET:provinces.geojson',
    'MAP_SOURCE:phase2-modern-provinces',
    'MAP_LAYER:phase2-modern-provinces-fill',
    'MAP_LAYER:phase2-modern-provinces-outline',
    'MAP_LAYER:phase2-modern-provinces-label',
    'UI_COPY:（今）',
  ],
  'P2R-HYDROGRAPHY-YELLOW-RIVER-01': [
    'FORMAL_ENTITY:geography-yellow-river',
    'FEATURE:flow-geography-yellow-river',
    'MAP_LAYER:phase2-river-flow-arrows',
  ],
  'P2R-HYDROGRAPHY-WEI-RIVER-01': [
    'FORMAL_ENTITY:geography-wei-river',
    'FEATURE:flow-geography-wei-river',
    'MAP_LAYER:phase2-river-flow-arrows',
  ],
  'P2R-LANDFORM-QINLING-01': [
    'FORMAL_ENTITY:geography-qinling',
    'MAP_SOURCE:mvp-geography-display-labels',
    'MAP_LAYER:mvp-geography-mountain-label',
  ],
  'P2R-LANDFORM-GUANZHONG-LOWLAND-01': [
    'CONSTANT:GUANZHONG_LOWLAND_LABEL_ANCHOR',
    'FEATURE:display-guanzhong-east-lowland-label',
    'MAP_LAYER:phase2-guanzhong-lowland-label',
  ],
  'P2R-CORRIDOR-EAST-GUANZHONG-DISPLAY-01': [
    'FORMAL_ENTITY:route-tang-advance-01',
    'CONSTANT:EAST_GUANZHONG_CORRIDOR_SCREEN_WIDTH_PX',
    'FEATURE:display-east-guanzhong-corridor',
    'MAP_LAYER:phase2-east-guanzhong-corridor-band',
    'MAP_LAYER:phase2-east-guanzhong-corridor-edge',
    'MAP_LAYER:phase2-east-guanzhong-corridor-label',
  ],
  'P2R-DISTANCE-HAVERSINE-MODERN-01': [
    'METHOD:haversineDistanceKm',
    'CONSTANT:EARTH_MEAN_RADIUS_KM',
    'CONSTANT:ROUTE_DISTANCE_ROUNDING_KM',
    'CONSTANT:ROUTE_DISTANCE_METHOD_NOTE',
    'UI_COPY:现代代表点间直线距离约 120 公里',
    'UI_COPY:现代代表点间直线距离约 80 公里',
    'UI_COPY:现代代表点间直线距离约 55 公里',
  ],
  'P2R-PRESENTATION-ROUTE-YAN-01': [
    'FORMAL_ENTITY:route-yan-westward-01',
    'FORMAL_ENTITY:route-yan-westward-02',
    'MAP_SOURCE:mvp-route-segments',
    'MAP_LAYER:mvp-routes-yan',
    'MAP_LAYER:mvp-routes-yan-active',
    'MAP_LAYER:mvp-route-direction-arrows',
    'MAP_LAYER:mvp-route-direction-labels',
    'UI_COPY:燕军 · 向西',
  ],
  'P2R-PRESENTATION-ROUTE-TANG-01': [
    'FORMAL_ENTITY:route-tang-advance-01',
    'MAP_SOURCE:mvp-route-segments',
    'MAP_LAYER:mvp-routes-tang',
    'MAP_LAYER:mvp-routes-tang-active',
    'MAP_LAYER:mvp-route-direction-arrows',
    'MAP_LAYER:mvp-route-direction-labels',
    'UI_COPY:唐军 · 向东',
  ],
}

const REQUIRED_PHASE2_APPROVALS = [
  'PHASE2-SRC-YELLOW-FLOW-01',
  'PHASE2-SRC-WEI-FLOW-01',
  'PHASE2-SRC-GUANZHONG-LOWLAND-01',
  'PHASE2-CLAIM-YELLOW-FLOW-01',
  'PHASE2-CLAIM-WEI-FLOW-01',
  'PHASE2-CLAIM-GUANZHONG-LOWLAND-01',
  'PHASE2-GEOMETRY-EAST-GUANZHONG-01',
  'PHASE2-CLAIM-EAST-GUANZHONG-01',
  'PHASE2-PRESENTATION-TONGGUAN-01',
  'PHASE2-04-DIRECTION-YAN-01',
  'PHASE2-04-DIRECTION-TANG-01',
  'PHASE2-04-PRESENTATION-DIRECTION-SEMANTICS-01',
  'PHASE2-04-METHOD-DISTANCE-01',
  'PHASE2-04-DISTANCE-YAN-01',
  'PHASE2-04-DISTANCE-YAN-02',
  'PHASE2-04-DISTANCE-TANG-01',
  'PHASE2-04-PRESENTATION-YAN-01',
  'PHASE2-04-PRESENTATION-TANG-01',
  'PHASE2-04-GAP-YAN-CONSTRAINT-01',
  'PHASE2-04-SRC-XIAOHAN-SCOPE-01',
  'PHASE2-04-CIT-XIAOHAN-SCOPE-01',
  'PHASE2-04-SRC-XIAOHAN-WEST-TERRAIN-01',
  'PHASE2-04-CIT-XIAOHAN-WEST-TERRAIN-01',
  'PHASE2-04-SRC-XIAOHAN-TANG-CONTEXT-01',
  'PHASE2-04-CIT-XIAOHAN-TANG-CONTEXT-01',
  'PHASE2-04-PRESENTATION-YAN-CONSTRAINT-01',
] as const

const SECRET_PATTERNS: Array<[string, RegExp]> = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u],
  ['aws-access-key', /AKIA[0-9A-Z]{16}/u],
  ['openai-api-key', /\bsk-[A-Za-z0-9_-]{20,}\b/u],
  ['github-token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/u],
  ['google-api-key', /\bAIza[0-9A-Za-z_-]{35}\b/u],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/u],
  [
    'internal-license-data',
    new RegExp(String.raw`\b(?:INTERNAL|CONFIDENTIAL)_LICENSE_` + 'DATA\\b', 'u'),
  ],
]

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function validHumanReview(review: Phase2Review): boolean {
  return (
    review.status === 'APPROVED' &&
    nonEmpty(review.reviewer) &&
    !['codex', 'chatgpt', '自动脚本'].includes(review.reviewer.toLowerCase()) &&
    validDate(review.reviewDate)
  )
}

function sha256(contents: string | Buffer): string {
  return createHash('sha256').update(contents).digest('hex')
}

function addUnique(
  values: readonly string[],
  label: string,
  issues: string[],
): void {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) {
      issues.push(`${label}: 重复 ID ${value}`)
    }
    seen.add(value)
  }
}

function phase2Statuses(
  sourceNotes: string,
  contentReview: string,
  issues: string[],
): Map<string, string> {
  const statuses = new Map<string, string>()
  const record = (id: string, status: string): void => {
    if (!id.startsWith('PHASE2-') || !status) {
      return
    }
    const existing = statuses.get(id)
    if (existing && existing !== status) {
      issues.push(`[${id}] review.status: 资料笔记与内容审核表状态冲突（${existing}/${status}）`)
    }
    statuses.set(id, status)
  }

  for (const line of sourceNotes.split('\n')) {
    if (!line.startsWith('| PHASE2-')) continue
    const row = line.split('|').map((cell) => cell.trim())
    record(row[1] ?? '', row.at(-2) ?? '')
  }
  for (const line of contentReview.split('\n')) {
    if (!line.startsWith('| Phase2')) continue
    const row = line.split('|').map((cell) => cell.trim())
    record(row[2] ?? '', row.at(-3) ?? '')
  }
  return statuses
}

function formalIds(dataset: MvpDataset): Set<string> {
  const ids = new Set<string>()
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value)) {
      if ((key === 'id' || key === 'claimId') && typeof child === 'string') {
        ids.add(child)
      }
      visit(child)
    }
  }
  visit(dataset)
  return ids
}

function mappingKey(mapping: ReleaseMapping): string {
  return `${mapping.type}:${mapping.id}`
}

function runtimeContains(input: Phase2ReleaseAuditInput, value: string): boolean {
  const escapedNewline = value.replaceAll('\n', '\\n')
  return (
    input.runtimeSourceText.includes(value) ||
    input.runtimeSourceText.includes(escapedNewline) ||
    input.runtimeDerivedIds.includes(value) ||
    input.runtimeDerivedTexts.includes(value)
  )
}

export function findSecretIssues(
  files: readonly TextFile[],
  scope = 'TRACKED',
): string[] {
  const issues: string[] = []
  for (const file of files) {
    for (const [kind, pattern] of SECRET_PATTERNS) {
      pattern.lastIndex = 0
      if (pattern.test(file.contents)) {
        issues.push(`[${scope}:${file.path}] secretScan.${kind}: 检出高置信秘密或内部许可数据标记`)
      }
    }
  }
  return issues
}

function verifySourceRecord(source: Phase2SourceRecord, issues: string[]): void {
  for (const field of ['institution', 'title', 'version', 'url', 'originalCrs', 'outputCrs'] as const) {
    if (!nonEmpty(source[field])) {
      issues.push(`[${source.id}] ${field}: 必填字段为空`)
    }
  }
  if (!validDate(source.accessDate)) {
    issues.push(`[${source.id}] accessDate: 必须是有效 ISO 日期`)
  }
  if (!source.coverage || typeof source.coverage !== 'object') {
    issues.push(`[${source.id}] coverage: 缺少结构化覆盖范围`)
  }
  if (!Array.isArray(source.processing) || !source.processing.every(nonEmpty) || source.processing.length === 0) {
    issues.push(`[${source.id}] processing: 缺少逐步处理过程`)
  }
  for (const field of ['name', 'url', 'redistribution', 'attribution', 'restrictions'] as const) {
    if (!nonEmpty(source.license?.[field])) {
      issues.push(`[${source.id}] license.${field}: 必填字段为空`)
    }
  }
  if (
    source.runtimeDependencies?.networkRequired !== false ||
    source.runtimeDependencies?.tokenRequired !== false ||
    source.runtimeDependencies?.externalServices?.length !== 0
  ) {
    issues.push(`[${source.id}] runtimeDependencies: 必须保持离线、无 Token、无外部服务`)
  }
  if (!validHumanReview(source.review)) {
    issues.push(`[${source.id}] review: 必须有真实人工 APPROVED、审核人和有效日期`)
  }
}

function verifySpecialLicenses(sources: Map<string, Phase2SourceRecord>, issues: string[]): void {
  const terrain = sources.get('P2SRC-COPERNICUS-GLO90-2021-01')
  if (terrain) {
    if (!terrain.license.name.includes('Full, Free and Open') || !terrain.license.url.includes('cop_dem_licenses')) {
      issues.push(`[${terrain.id}] license.name/license.url: Copernicus 许可名称或链接不完整`)
    }
    if (
      !terrain.license.attribution.includes('produced using Copernicus WorldDEM-90') ||
      !terrain.license.attribution.includes('do not incur any liability')
    ) {
      issues.push(`[${terrain.id}] license.attribution: 缺少 Copernicus 完整署名或责任免责声明`)
    }
  }

  const boundary = sources.get('P2SRC-GEOBOUNDARIES-CHN-ADM1-9469F09-01')
  if (boundary) {
    if (
      !boundary.license.name.includes('CC BY 4.0') ||
      !boundary.license.name.includes('Public Domain') ||
      !boundary.license.redistribution.includes('CC BY 4.0') ||
      !boundary.license.attribution.includes('geoBoundaries')
    ) {
      issues.push(`[${boundary.id}] license: 缺少 CC BY 4.0、上游 Public Domain、再分发或署名判定`)
    }
  }
}

function verifyManifest(manifest: TerrainManifest, issues: string[]): void {
  if (manifest.schemaVersion !== '1.0' || manifest.assetSetId !== 'phase2-02-glo90-topdown') {
    issues.push(`[phase2-02-glo90-topdown] manifest: schemaVersion 或 assetSetId 漂移`)
  }
  if (manifest.runtimeNetworkRequired !== false || manifest.dem.sourceInputsCommitted !== false) {
    issues.push(`[phase2-02-glo90-topdown] manifest.runtime: 必须离线且源 COG 不得提交`)
  }
  if (manifest.dem.inputs.length !== 15 || manifest.assets.length !== 80) {
    issues.push(`[phase2-02-glo90-topdown] manifest.assets: 必须保持 15 个源输入和 80 个输出`)
  }
  const tileCount = manifest.terrainTiles.reduce((total, entry) => total + entry.tiles, 0)
  if (tileCount !== 78 || manifest.provinces.boundaryFeatures !== 2 || manifest.provinces.labelFeatures !== 2) {
    issues.push(`[phase2-02-glo90-topdown] manifest.inventory: 78 tiles 或 2+2 省界要素清单漂移`)
  }
  if (manifest.totalBytes !== 9_572_150 || manifest.assetBudgetBytes !== 10_485_760) {
    issues.push(`[phase2-02-glo90-topdown] manifest.totalBytes: 体积或预算漂移`)
  }
  if (
    !manifest.licenses.copernicus.licenseUrl ||
    !manifest.licenses.copernicus.requiredAttribution ||
    !manifest.licenses.copernicus.requiredDisclaimer ||
    manifest.licenses.geoBoundaries.distributionLicense !== 'CC BY 4.0' ||
    manifest.licenses.geoBoundaries.upstreamBoundaryMetadataLicense !== 'Public Domain' ||
    !manifest.licenses.geoBoundaries.requiredAttribution
  ) {
    issues.push(`[phase2-02-glo90-topdown] manifest.licenses: 许可或署名清单不完整`)
  }
}

function verifyDistanceRecord(record: Phase2ReleaseRecord | undefined, issues: string[]): void {
  if (!record) return
  const method = record.method
  if (
    method?.name !== 'HAVERSINE' ||
    method.earthRadiusKm !== 6371.0088 ||
    method.roundingKm !== 5 ||
    method.unit !== 'km' ||
    method.approximateLabelRequired !== true ||
    !method.disclaimer.includes('不等于唐代道路或历史行军里程')
  ) {
    issues.push(`[${record.id}] method: 缺少 Haversine、6371.0088 km、最近 5 km、约略或历史里程免责声明`)
  }
  const expected = new Map([
    ['route-yan-westward-01', 120],
    ['route-yan-westward-02', 80],
    ['route-tang-advance-01', 55],
  ])
  if (record.outputs?.length !== 3) {
    issues.push(`[${record.id}] outputs: 必须保留三项距离输出`)
    return
  }
  for (const output of record.outputs) {
    const distance = expected.get(output.formalEntityId)
    if (distance === undefined || output.label !== `现代代表点间直线距离约 ${distance} 公里`) {
      issues.push(`[${record.id}] outputs.${output.formalEntityId}: 必须包含“现代代表点”“直线距离”“约”和批准公里数`)
    }
  }
}

export function auditPhase2Release(
  input: Phase2ReleaseAuditInput,
): Phase2ReleaseAuditReport {
  const issues: string[] = []
  const { registry, dataset, manifest } = input

  if (registry.schemaVersion !== '1.0' || registry.releaseSetId !== 'phase2-06-anshi-spatial-v1') {
    issues.push(`[${registry.releaseSetId || 'unknown'}] schemaVersion: 发布登记簿版本或 ID 漂移`)
  }
  if (!validHumanReview(registry.review) || !nonEmpty(registry.review.approvalRecord)) {
    issues.push(`[${registry.releaseSetId}] review: 方案 A 缺少明确人工批准记录`)
  }

  addUnique(registry.frozenArtifacts.map((entry) => entry.path), 'frozenArtifacts', issues)
  for (const artifact of registry.frozenArtifacts) {
    const actual = input.artifactHashes[artifact.path]
    if (!actual || actual !== artifact.sha256) {
      issues.push(`[${artifact.path}] sha256: 预期 ${artifact.sha256}，实际 ${actual ?? '缺失'}`)
    }
  }

  addUnique(registry.sources.map((source) => source.id), 'sources', issues)
  addUnique(registry.records.map((record) => record.id), 'records', issues)
  const sources = new Map(registry.sources.map((source) => [source.id, source]))
  const records = new Map(registry.records.map((record) => [record.id, record]))
  for (const id of EXPECTED_SOURCE_IDS) {
    if (!sources.has(id)) issues.push(`[${id}] source: 缺少批准的空间来源记录`)
  }
  if (registry.sources.length !== EXPECTED_SOURCE_IDS.length) {
    issues.push(`[${registry.releaseSetId}] sources: 预期 2 条，实际 ${registry.sources.length} 条`)
  }
  for (const [id, kind] of Object.entries(EXPECTED_RECORD_KINDS)) {
    if (records.get(id)?.kind !== kind) {
      issues.push(`[${id}] kind: 预期 ${kind}，实际 ${records.get(id)?.kind ?? '缺失'}`)
    }
  }
  if (registry.records.length !== Object.keys(EXPECTED_RECORD_KINDS).length) {
    issues.push(`[${registry.releaseSetId}] records: 预期 10 条，实际 ${registry.records.length} 条`)
  }

  registry.sources.forEach((source) => verifySourceRecord(source, issues))
  verifySpecialLicenses(sources, issues)
  verifyManifest(manifest, issues)

  const reviewRows = parseContentReviews(input.contentReview)
  const formalReviewStatuses = new Map(reviewRows.map((row) => [row.entityId, row.status]))
  const phaseStatuses = phase2Statuses(input.sourceNotes, input.contentReview, issues)
  for (const id of REQUIRED_PHASE2_APPROVALS) {
    if (phaseStatuses.get(id) !== 'APPROVED') {
      issues.push(`[${id}] review.status: PHASE2-03/04 批准行缺失或未获 APPROVED`)
    }
  }
  const formal = formalIds(dataset)
  const approvedReference = (id: string): boolean =>
    sources.has(id) ||
    formalReviewStatuses.get(id) === 'APPROVED' ||
    phaseStatuses.get(id) === 'APPROVED'

  for (const record of registry.records) {
    for (const field of ['coverage', 'crs'] as const) {
      if (!nonEmpty(record[field])) issues.push(`[${record.id}] ${field}: 必填字段为空`)
    }
    if (!record.processing?.length || !record.processing.every(nonEmpty)) {
      issues.push(`[${record.id}] processing: 缺少处理过程`)
    }
    for (const field of ['redistribution', 'attribution', 'restrictions'] as const) {
      if (!nonEmpty(record.license?.[field])) {
        issues.push(`[${record.id}] license.${field}: 必填字段为空`)
      }
    }
    if (!record.sourceRefs?.length || !record.reviewRefs?.length || !record.license.sourceRefs?.length) {
      issues.push(`[${record.id}] sourceRefs/reviewRefs/license.sourceRefs: 不得为空`)
    }
    for (const sourceRef of record.sourceRefs ?? []) {
      if (!approvedReference(sourceRef)) {
        issues.push(`[${record.id}] sourceRefs.${sourceRef}: 来源不存在、待审或已拒绝`)
      }
    }
    for (const reviewRef of record.reviewRefs ?? []) {
      if (!approvedReference(reviewRef)) {
        issues.push(`[${record.id}] reviewRefs.${reviewRef}: 审核映射不存在、待审或已拒绝`)
      }
    }
    if (
      record.runtimeDependencies?.networkRequired !== false ||
      record.runtimeDependencies?.tokenRequired !== false ||
      record.runtimeDependencies?.externalServices?.length !== 0
    ) {
      issues.push(`[${record.id}] runtimeDependencies: 必须保持离线、无 Token、无外部服务`)
    }
    if (!validHumanReview(record.review)) {
      issues.push(`[${record.id}] review: 必须有真实人工 APPROVED、审核人和有效日期`)
    }

    const expectedSemantics = EXPECTED_SEMANTICS[record.id]
    if (
      !expectedSemantics ||
      record.semantics?.certainty !== expectedSemantics.certainty ||
      record.semantics?.displayOnly !== expectedSemantics.displayOnly ||
      !record.semantics?.prohibitedInterpretations?.includes(expectedSemantics.prohibited)
    ) {
      issues.push(`[${record.id}] semantics: 确定性、displayOnly 或禁止解释边界错误`)
    }

    const keys = record.releaseMappings?.map(mappingKey) ?? []
    addUnique(keys, `[${record.id}] releaseMappings`, issues)
    for (const required of REQUIRED_MAPPINGS[record.id] ?? []) {
      if (!keys.includes(required)) {
        issues.push(`[${record.id}] releaseMappings.${required}: 缺少已发布对象审核映射`)
      }
    }
    for (const mapping of record.releaseMappings ?? []) {
      if (mapping.type === 'MANIFEST' && mapping.id !== manifest.assetSetId) {
        issues.push(`[${record.id}] releaseMappings.${mappingKey(mapping)}: manifest ID 不存在`)
      } else if (
        mapping.type === 'ASSET' &&
        !manifest.assets.some((asset) => asset.path === mapping.id)
      ) {
        issues.push(`[${record.id}] releaseMappings.${mappingKey(mapping)}: manifest 资产不存在`)
      } else if (mapping.type === 'FORMAL_ENTITY' && !formal.has(mapping.id)) {
        issues.push(`[${record.id}] releaseMappings.${mappingKey(mapping)}: 正式实体不存在`)
      } else if (
        !['MANIFEST', 'ASSET', 'FORMAL_ENTITY'].includes(mapping.type) &&
        !runtimeContains(input, mapping.id)
      ) {
        issues.push(`[${record.id}] releaseMappings.${mappingKey(mapping)}: 运行时对象或文案不存在`)
      }
    }
  }

  verifyDistanceRecord(records.get('P2R-DISTANCE-HAVERSINE-MODERN-01'), issues)

  try {
    const formalReport = auditContentRelease({
      dataset,
      sourceNotes: input.sourceNotes,
      contentReview: input.contentReview,
    })
    const expectedCounts = {
      Place: 5,
      Event: 6,
      Geography: 3,
      RouteSegment: 3,
      Claim: 33,
      Citation: 36,
      Source: 19,
    }
    for (const [kind, count] of Object.entries(expectedCounts)) {
      const actual = formalReport.releaseCounts[kind as keyof typeof formalReport.releaseCounts]
      if (actual !== count) {
        issues.push(`[formal:${kind}] count: 预期 ${count}，实际 ${actual}`)
      }
    }
    for (const [status, expected] of [
      ['PENDING_REVIEW', 9],
      ['PENDING_SOURCE', 5],
      ['REJECTED', 2],
    ] as const) {
      const actual = formalReport.outsideReleaseRows.filter((row) => row.status === status).length
      if (actual !== expected) {
        issues.push(`[formal:${status}] count: 预期 ${expected}，实际 ${actual}`)
      }
    }
  } catch (error) {
    if (error instanceof ContentReleaseAuditError) {
      issues.push(...error.issues.map((issue) => `[formal] ${issue}`))
    } else {
      throw error
    }
  }

  if (
    dataset.places.features.length !== 5 ||
    !dataset.places.features.every((feature) => feature.properties.certainty === 'DISPUTED')
  ) {
    issues.push('[formal:Place] certainty/count: 必须保持 5 个 DISPUTED 代表点')
  }
  if (
    dataset.geography.features.length !== 3 ||
    !dataset.geography.features.every((feature) => feature.properties.certainty === 'UNKNOWN')
  ) {
    issues.push('[formal:Geography] certainty/count: 必须保持 3 个 UNKNOWN Geography')
  }
  if (
    dataset.routeSegments.features.length !== 3 ||
    !dataset.routeSegments.features.every(
      (feature) =>
        feature.geometry.coordinates.length === 2 &&
        feature.properties.certainty === 'LOW' &&
        feature.properties.summary.viewpointType === 'INFERENCE',
    )
  ) {
    issues.push('[formal:RouteSegment] certainty/count: 必须保持 3 个两点 INFERENCE / LOW 路段')
  }
  if (
    dataset.events.length !== 6 ||
    !dataset.events.every(
      (event) => event.timePrecision === 'APPROXIMATE' && event.normalizedDate === null,
    )
  ) {
    issues.push('[formal:Event] precision/count: 必须保持 6 个 APPROXIMATE 且 normalizedDate=null 事件')
  }

  issues.push(...findSecretIssues(input.trackedTextFiles))

  if (issues.length > 0) {
    throw new Phase2ReleaseAuditError(issues)
  }

  return {
    sourceCount: registry.sources.length,
    recordCount: registry.records.length,
    mappingCount: registry.records.reduce(
      (total, record) => total + record.releaseMappings.length,
      0,
    ),
    trackedTextFileCount: input.trackedTextFiles.length,
  }
}

function readableText(path: string): string | undefined {
  const contents = readFileSync(path)
  if (contents.includes(0)) return undefined
  return contents.toString('utf8')
}

export function loadPhase2ReleaseAuditInput(
  repositoryRoot: string,
): Phase2ReleaseAuditInput {
  const frontendRoot = resolve(repositoryRoot, 'frontend')
  const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8')
  const registry = JSON.parse(
    read('data/curated/phase2-spatial-release-v1.json'),
  ) as Phase2ReleaseRegistry
  const dataset = JSON.parse(
    read('frontend/public/data/anshi/mvp-v1.json'),
  ) as MvpDataset
  const sourceNotes = read('data/curated/anshi-mvp-source-notes.md')
  const contentReview = read('docs/reviews/anshi-mvp-content-review.md')
  const manifest = JSON.parse(
    read('frontend/public/terrain/phase2-02/manifest.json'),
  ) as TerrainManifest
  const artifactHashes = Object.fromEntries(
    registry.frozenArtifacts.map((artifact) => [
      artifact.path,
      sha256(readFileSync(resolve(repositoryRoot, artifact.path))),
    ]),
  )
  const runtimeFiles = [
    'frontend/src/domain/routePresentation.ts',
    'frontend/src/map/layers/terrainLayer.ts',
    'frontend/src/map/layers/geographyLayer.ts',
    'frontend/src/map/layers/militaryGeographyLayer.ts',
    'frontend/src/map/layers/routeLayer.ts',
    'frontend/src/components/detail/RouteDetail.vue',
  ]
  const guides = buildMilitaryGeographyGuides(
    dataset.geography,
    dataset.routeSegments,
  )
  const routeDisplay = buildRouteDisplayFeatures(
    dataset.routeSegments,
    dataset.places,
  )
  const presentations = [
    getRoutePresentation(dataset, 'route-yan-westward'),
    getRoutePresentation(dataset, 'route-tang-advance'),
  ].filter((value) => value !== undefined)
  const trackedPaths = execFileSync(
    'git',
    ['ls-files', '-co', '--exclude-standard', '-z'],
    { cwd: repositoryRoot, encoding: 'utf8' },
  )
    .split('\0')
    .filter(Boolean)
  const trackedTextFiles = trackedPaths.flatMap((path) => {
    const contents = readableText(resolve(repositoryRoot, path))
    return contents === undefined ? [] : [{ path, contents }]
  })

  return {
    registry,
    dataset,
    sourceNotes,
    contentReview,
    manifest,
    artifactHashes,
    runtimeSourceText: runtimeFiles.map(read).join('\n'),
    runtimeDerivedIds: [
      ...guides.features.map((feature) => feature.properties.id),
      ...routeDisplay.features.map((feature) => feature.properties.id),
    ],
    runtimeDerivedTexts: [
      ...guides.features.flatMap((feature) => [
        feature.properties.name,
        feature.properties.displayBoundary,
      ]),
      ...routeDisplay.features.flatMap((feature) => [
        feature.properties.directionLabel,
        feature.properties.distanceLabel,
      ]),
      ...presentations.flatMap((presentation) => [
        presentation.directionLabel,
        ...presentation.notes,
        ...presentation.segments.map((segment) => segment.distanceLabel),
      ]),
    ],
    trackedTextFiles,
  }
}
