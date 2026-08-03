import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type {
  Citation,
  MvpDataset,
  Source,
  SourcedClaim,
} from '../src/domain/mvpTypes'

const REVIEW_ENTITY_TYPES = [
  'Place',
  'Event',
  'Geography',
  'RoutePlan',
  'RouteSegment',
  'Claim',
  'Citation',
  'Source',
] as const

const RELEASE_ENTITY_TYPES = [
  'Place',
  'Event',
  'Geography',
  'RouteSegment',
  'Claim',
  'Citation',
  'Source',
] as const

type ReviewEntityType = (typeof REVIEW_ENTITY_TYPES)[number]
type ReleaseEntityType = (typeof RELEASE_ENTITY_TYPES)[number]

interface ContentReviewRecord {
  entityType: ReviewEntityType
  entityId: string
  factReviewed: string
  coordinateReviewed: string
  citationReviewed: string
  sourceVersionReviewed: string
  licenseReviewed: string
  certaintyReviewed: string
  reviewer: string
  reviewDate: string
  status: string
  notes: string
}

interface SourceNoteRecord {
  sourceId: string
  dataVersion: string
  status: string
}

interface CitationNoteRecord {
  citationId: string
  sourceId: string
  chapter: string
  locator: string
  status: string
}

interface ClaimNoteRecord {
  claimId: string
  entityType: 'Place' | 'Event' | 'Geography' | 'RoutePlan' | 'RouteSegment'
  entityId: string
  field: string
  text: string
  citationIds: string[]
  viewpointType: string
  certainty: string
  status: string
}

interface EntityNoteRecord {
  entityId: string
  status: string
}

interface EventNoteRecord extends EntityNoteRecord {
  sequence: number
  title: string
  eventType: string
  dateLabel: string
  normalizedDate: string
  timePrecision: string
  certainty: string
  relatedPlaceIds: string[]
  actorLabels: string[]
  citationIds: string[]
}

interface RouteSegmentNoteRecord extends EntityNoteRecord {
  routeId: string
  segmentNo: number
  fromPlaceId: string
  toPlaceId: string
  appearAtEventId: string
  summaryClaimId: string
  certainty: string
}

interface RoutePlanNoteRecord extends EntityNoteRecord {
  routeId: string
}

interface ParsedSourceNotes {
  sources: SourceNoteRecord[]
  citations: CitationNoteRecord[]
  claims: ClaimNoteRecord[]
  places: EntityNoteRecord[]
  geography: EntityNoteRecord[]
  events: EventNoteRecord[]
  routeSegments: RouteSegmentNoteRecord[]
  routePlans: RoutePlanNoteRecord[]
}

interface RuntimeClaimRecord {
  claim: SourcedClaim
  entityType: 'Place' | 'Event' | 'Geography' | 'RouteSegment'
  entityId: string
  field: string
  sourceNoteField: string
}

interface ReleaseRecord {
  entityType: ReleaseEntityType
  entityId: string
}

export interface ContentReleaseAuditInput {
  dataset: MvpDataset
  sourceNotes: string
  contentReview: string
}

export interface ContentReleaseAuditReport {
  releaseCounts: Record<ReleaseEntityType, number>
  releaseReviewCount: number
  routePlanCount: number
  totalReviewCount: number
  outsideReleaseRows: ContentReviewRecord[]
}

export class ContentReleaseAuditError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(`MVP-11 内容发布映射审计失败（${issues.length} 项）`)
    this.name = 'ContentReleaseAuditError'
    this.issues = issues
  }
}

function splitMarkdownRow(line: string): string[] {
  return line.split('|').map((cell) => cell.trim())
}

function stripMarkdown(value: string): string {
  return value
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replaceAll('`', '')
    .trim()
}

function splitIds(value: string): string[] {
  return stripMarkdown(value)
    .split('、')
    .map((id) => id.trim())
    .filter(Boolean)
}

function recordKey(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`
}

function isReviewEntityType(value: string): value is ReviewEntityType {
  return REVIEW_ENTITY_TYPES.some((candidate) => candidate === value)
}

function validHumanReviewDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isRealHumanReviewer(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return (
    normalized.length > 0 &&
    !['待定', 'todo', 'tbd', 'codex', 'chatgpt', '自动脚本'].includes(normalized)
  )
}

function sameIds(left: string[], right: string[]): boolean {
  return (
    [...left].sort().join('\n') === [...right].sort().join('\n')
  )
}

function indexUnique<T>(
  records: T[],
  keyFor: (record: T) => string,
  label: string,
  issues: string[],
): Map<string, T> {
  const result = new Map<string, T>()
  for (const record of records) {
    const key = keyFor(record)
    if (result.has(key)) {
      issues.push(`${label} 存在重复记录：${key}`)
      continue
    }
    result.set(key, record)
  }
  return result
}

export function parseContentReviews(markdown: string): ContentReviewRecord[] {
  return markdown
    .split('\n')
    .map(splitMarkdownRow)
    .filter((row) => isReviewEntityType(row[1] ?? ''))
    .map((row) => {
      if (row.length !== 15) {
        throw new Error(
          `内容审核表 ${row[1] ?? '未知类型'}:${row[2] ?? '未知 ID'} 有 ${row.length} 列，预期 15 列`,
        )
      }

      return {
        entityType: row[1] as ReviewEntityType,
        entityId: row[2],
        factReviewed: row[4],
        coordinateReviewed: row[5],
        citationReviewed: row[6],
        sourceVersionReviewed: row[7],
        licenseReviewed: row[8],
        certaintyReviewed: row[9],
        reviewer: row[10],
        reviewDate: row[11],
        status: row[12],
        notes: row[13],
      }
    })
}

function parseClaimNote(line: string): ClaimNoteRecord {
  const row = splitMarkdownRow(line)
  const typedEntity = ['Place', 'Geography', 'RoutePlan', 'RouteSegment'].includes(
    row[2],
  )

  if (typedEntity) {
    if (row.length !== 12) {
      throw new Error(`资料笔记 Claim ${row[1]} 有 ${row.length} 列，预期 12 列`)
    }
    return {
      claimId: row[1],
      entityType: row[2] as ClaimNoteRecord['entityType'],
      entityId: row[3],
      field: stripMarkdown(row[4]),
      text: stripMarkdown(row[5]),
      citationIds: splitIds(row[6]),
      viewpointType: row[7],
      certainty: row[8],
      status: row[10],
    }
  }

  if (row.length !== 11) {
    throw new Error(`资料笔记 Claim ${row[1]} 有 ${row.length} 列，预期 11 列`)
  }
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

export function parseSourceNotes(markdown: string): ParsedSourceNotes {
  const rows = markdown.split('\n').map(splitMarkdownRow)

  return {
    sources: rows
      .filter((row) => /^SRC-/.test(row[1] ?? ''))
      .map((row) => ({
        sourceId: row[1],
        dataVersion: stripMarkdown(row[5]),
        status: row.at(-2) ?? '',
      })),
    citations: rows
      .filter((row) => /^CIT-/.test(row[1] ?? ''))
      .map((row) => ({
        citationId: row[1],
        sourceId: row[2],
        chapter: stripMarkdown(row[3]),
        locator: stripMarkdown(row[4]),
        status: row[8],
      })),
    claims: markdown
      .split('\n')
      .filter((line) => /^\| claim-/.test(line))
      .map(parseClaimNote),
    places: rows
      .filter((row) => /^place-/.test(row[1] ?? '') && row.length === 8)
      .map((row) => ({ entityId: row[1], status: row[6] })),
    geography: rows
      .filter((row) => /^geography-/.test(row[1] ?? '') && row.length === 7)
      .map((row) => ({ entityId: row[1], status: row[5] })),
    events: rows
      .filter(
        (row) =>
          /^event-/.test(row[1] ?? '') &&
          row.length === 14 &&
          /^\d+$/.test(row[2] ?? ''),
      )
      .map((row) => ({
        entityId: row[1],
        sequence: Number(row[2]),
        title: row[3],
        eventType: row[4],
        dateLabel: row[5],
        normalizedDate: stripMarkdown(row[6]),
        timePrecision: row[7],
        certainty: row[8],
        relatedPlaceIds: splitIds(row[9]),
        actorLabels: splitIds(row[10]),
        citationIds: splitIds(row[11]),
        status: row[12],
      })),
    routeSegments: rows
      .filter(
        (row) =>
          /^route-/.test(row[1] ?? '') &&
          row.length === 12 &&
          /^\d+$/.test(row[3] ?? ''),
      )
      .map((row) => ({
        entityId: row[1],
        routeId: row[2],
        segmentNo: Number(row[3]),
        fromPlaceId: row[4],
        toPlaceId: row[5],
        appearAtEventId: row[6],
        summaryClaimId: stripMarkdown(row[8]),
        certainty: row[9],
        status: row[10],
      })),
    routePlans: rows
      .filter(
        (row) =>
          /^route-/.test(row[1] ?? '') &&
          row.length === 10 &&
          !/^\d+$/.test(row[2] ?? ''),
      )
      .map((row) => ({
        entityId: row[1],
        routeId: row[1],
        status: row[8],
      })),
  }
}

function runtimeClaims(dataset: MvpDataset): RuntimeClaimRecord[] {
  return [
    ...dataset.places.features.flatMap((feature) => {
      const records: RuntimeClaimRecord[] = [
        {
          claim: feature.properties.summary,
          entityType: 'Place',
          entityId: feature.properties.id,
          field: 'Place.summary',
          sourceNoteField: 'Place.summary',
        },
        {
          claim: feature.properties.strategicRole,
          entityType: 'Place',
          entityId: feature.properties.id,
          field: 'Place.strategicRole',
          sourceNoteField: 'Place.strategicRole',
        },
      ]
      if (feature.properties.coordinateNote) {
        records.push({
          claim: feature.properties.coordinateNote,
          entityType: 'Place',
          entityId: feature.properties.id,
          field: 'Place.coordinateNote',
          sourceNoteField: 'Place.coordinateNote 候选',
        })
      }
      return records
    }),
    ...dataset.geography.features.map((feature) => ({
      claim: feature.properties.summary,
      entityType: 'Geography' as const,
      entityId: feature.properties.id,
      field: 'Geography.summary',
      sourceNoteField: 'Geography.summary',
    })),
    ...dataset.routeSegments.features.map((feature) => ({
      claim: feature.properties.summary,
      entityType: 'RouteSegment' as const,
      entityId: feature.properties.id,
      field: 'RouteSegment.summary',
      sourceNoteField: 'RouteSegment.summary',
    })),
    ...dataset.events.flatMap((event) => [
      {
        claim: event.summary,
        entityType: 'Event' as const,
        entityId: event.id,
        field: 'Event.summary',
        sourceNoteField: 'Event.summary',
      },
      {
        claim: event.whyItMatters,
        entityType: 'Event' as const,
        entityId: event.id,
        field: 'Event.whyItMatters',
        sourceNoteField: 'Event.whyItMatters',
      },
    ]),
  ]
}

function releaseRecords(
  dataset: MvpDataset,
  claims: RuntimeClaimRecord[],
): ReleaseRecord[] {
  return [
    ...dataset.places.features.map((feature) => ({
      entityType: 'Place' as const,
      entityId: feature.properties.id,
    })),
    ...dataset.events.map((event) => ({
      entityType: 'Event' as const,
      entityId: event.id,
    })),
    ...dataset.geography.features.map((feature) => ({
      entityType: 'Geography' as const,
      entityId: feature.properties.id,
    })),
    ...dataset.routeSegments.features.map((feature) => ({
      entityType: 'RouteSegment' as const,
      entityId: feature.properties.id,
    })),
    ...claims.map((record) => ({
      entityType: 'Claim' as const,
      entityId: record.claim.claimId,
    })),
    ...dataset.citations.map((citation) => ({
      entityType: 'Citation' as const,
      entityId: citation.id,
    })),
    ...dataset.sources.map((source) => ({
      entityType: 'Source' as const,
      entityId: source.id,
    })),
  ]
}

function directCitationIdsForSpatialObject(
  dataset: MvpDataset,
): Array<{ key: string; citationIds: string[] }> {
  return [
    ...dataset.places.features.map((feature) => ({
      key: recordKey('Place', feature.properties.id),
      citationIds: feature.properties.citationIds,
    })),
    ...dataset.geography.features.map((feature) => ({
      key: recordKey('Geography', feature.properties.id),
      citationIds: feature.properties.citationIds,
    })),
    ...dataset.routeSegments.features.map((feature) => ({
      key: recordKey('RouteSegment', feature.properties.id),
      citationIds: feature.properties.citationIds,
    })),
  ]
}

function sourceIsSpatial(source: Source): boolean {
  return Boolean(
    source.provenance?.originalCrs ||
      source.provenance?.processingNotes ||
      source.provenance?.outputId,
  )
}

function assertSpatialSource(source: Source, issues: string[]): void {
  const provenance = source.provenance
  const requiredFields: Array<[string, string | null | undefined]> = [
    ['accessDate', provenance?.accessDate],
    ['dataVersion', provenance?.dataVersion],
    ['originalCrs', provenance?.originalCrs],
    ['coverage', provenance?.coverage],
    ['processingNotes', provenance?.processingNotes],
    ['outputId', provenance?.outputId],
    ['licenseName', provenance?.licenseName],
    ['usageRestrictions', provenance?.usageRestrictions],
  ]

  for (const [field, value] of requiredFields) {
    if (!value?.trim()) {
      issues.push(`空间 Source ${source.id} 缺少 provenance.${field}`)
    }
  }

  if (!provenance?.licenseName?.startsWith('不适用')) {
    if (!provenance?.licenseUrl?.trim()) {
      issues.push(`空间 Source ${source.id} 缺少许可证链接`)
    }
    if (!provenance?.attribution?.trim()) {
      issues.push(`空间 Source ${source.id} 缺少署名文字`)
    }
  }
}

function assertCitationLocator(citation: Citation, issues: string[]): void {
  const hasLocator = Boolean(citation.locator?.trim())
  const hasPages = citation.pageStart !== null || citation.pageEnd !== null
  if (!citation.chapter?.trim() || (!hasLocator && !hasPages)) {
    issues.push(`Citation ${citation.id} 缺少章节及页码或稳定定位`)
  }
}

export function auditContentRelease(
  input: ContentReleaseAuditInput,
): ContentReleaseAuditReport {
  const { dataset, sourceNotes, contentReview } = input
  const issues: string[] = []
  const parsedNotes = parseSourceNotes(sourceNotes)
  const reviews = parseContentReviews(contentReview)
  const claims = runtimeClaims(dataset)
  const records = releaseRecords(dataset, claims)

  const reviewsByKey = indexUnique(
    reviews,
    (review) => recordKey(review.entityType, review.entityId),
    '内容审核表',
    issues,
  )
  const releaseKeys = new Set(
    records.map((record) => recordKey(record.entityType, record.entityId)),
  )

  indexUnique(
    records,
    (record) => recordKey(record.entityType, record.entityId),
    '正式发布集合',
    issues,
  )

  for (const record of records) {
    const key = recordKey(record.entityType, record.entityId)
    const review = reviewsByKey.get(key)
    if (!review) {
      issues.push(`正式发布记录缺少审核行：${key}`)
      continue
    }
    if (review.status !== 'APPROVED') {
      issues.push(`正式发布记录未获 APPROVED：${key}（${review.status}）`)
    }
    if (!isRealHumanReviewer(review.reviewer)) {
      issues.push(`正式发布记录缺少真实人工审核人：${key}`)
    }
    if (!validHumanReviewDate(review.reviewDate)) {
      issues.push(`正式发布记录缺少有效审核日期：${key}`)
    }
    for (const [field, value] of [
      ['factReviewed', review.factReviewed],
      ['coordinateReviewed', review.coordinateReviewed],
      ['citationReviewed', review.citationReviewed],
      ['sourceVersionReviewed', review.sourceVersionReviewed],
      ['licenseReviewed', review.licenseReviewed],
      ['certaintyReviewed', review.certaintyReviewed],
    ]) {
      if (!value || value === '否') {
        issues.push(`正式发布记录审核项不完整：${key}.${field}=${value || '空'}`)
      }
    }
  }

  const sourceNotesById = indexUnique(
    parsedNotes.sources,
    (record) => record.sourceId,
    '资料笔记 Source',
    issues,
  )
  const citationNotesById = indexUnique(
    parsedNotes.citations,
    (record) => record.citationId,
    '资料笔记 Citation',
    issues,
  )
  const claimNotesById = indexUnique(
    parsedNotes.claims,
    (record) => record.claimId,
    '资料笔记 Claim',
    issues,
  )
  const placeNotesById = indexUnique(
    parsedNotes.places,
    (record) => record.entityId,
    '资料笔记 Place',
    issues,
  )
  const geographyNotesById = indexUnique(
    parsedNotes.geography,
    (record) => record.entityId,
    '资料笔记 Geography',
    issues,
  )
  const eventNotesById = indexUnique(
    parsedNotes.events,
    (record) => record.entityId,
    '资料笔记 Event',
    issues,
  )
  const routeSegmentNotesById = indexUnique(
    parsedNotes.routeSegments,
    (record) => record.entityId,
    '资料笔记 RouteSegment',
    issues,
  )
  const routePlanNotesById = indexUnique(
    parsedNotes.routePlans,
    (record) => record.entityId,
    '资料笔记 RoutePlan',
    issues,
  )

  for (const place of dataset.places.features) {
    const note = placeNotesById.get(place.properties.id)
    if (!note || note.status !== 'APPROVED') {
      issues.push(`正式 Place 未在资料笔记中获批：${place.properties.id}`)
    }
  }
  for (const feature of dataset.geography.features) {
    const note = geographyNotesById.get(feature.properties.id)
    if (!note || note.status !== 'APPROVED') {
      issues.push(`正式 Geography 未在资料笔记中获批：${feature.properties.id}`)
    }
  }
  for (const event of dataset.events) {
    const note = eventNotesById.get(event.id)
    if (!note || note.status !== 'APPROVED') {
      issues.push(`正式 Event 未在资料笔记中获批：${event.id}`)
      continue
    }
    if (
      note.sequence !== event.sequence ||
      note.title !== event.title ||
      note.eventType !== event.eventType ||
      note.dateLabel !== event.dateLabel ||
      note.normalizedDate !== 'null' ||
      note.timePrecision !== event.timePrecision ||
      note.certainty !== event.certainty ||
      !sameIds(note.relatedPlaceIds, event.relatedPlaceIds) ||
      !sameIds(note.actorLabels, event.actorLabels) ||
      !sameIds(note.citationIds, event.citationIds)
    ) {
      issues.push(`正式 Event 与资料笔记基础字段不一致：${event.id}`)
    }
  }
  for (const feature of dataset.routeSegments.features) {
    const properties = feature.properties
    const note = routeSegmentNotesById.get(properties.id)
    if (!note || note.status !== 'APPROVED') {
      issues.push(`正式 RouteSegment 未在资料笔记中逐段获批：${properties.id}`)
      continue
    }
    if (
      note.routeId !== properties.routeId ||
      note.segmentNo !== properties.segmentNo ||
      note.fromPlaceId !== properties.fromPlaceId ||
      note.toPlaceId !== properties.toPlaceId ||
      note.appearAtEventId !== properties.appearAtEventId ||
      note.summaryClaimId !== properties.summary.claimId ||
      note.certainty !== properties.certainty
    ) {
      issues.push(`正式 RouteSegment 与资料笔记基础字段不一致：${properties.id}`)
    }
  }

  const routeIds = new Set(
    dataset.routeSegments.features.map((feature) => feature.properties.routeId),
  )
  for (const routeId of routeIds) {
    const note = routePlanNotesById.get(routeId)
    const review = reviewsByKey.get(recordKey('RoutePlan', routeId))
    if (!note || note.status !== 'APPROVED') {
      issues.push(`正式逻辑路线缺少已批准 RoutePlan 组织记录：${routeId}`)
    }
    if (!review || review.status !== 'APPROVED') {
      issues.push(`正式逻辑路线缺少已批准 RoutePlan 审核行：${routeId}`)
    }
  }

  const sourceIds = new Set(dataset.sources.map((source) => source.id))
  const citationIds = new Set(dataset.citations.map((citation) => citation.id))
  for (const source of dataset.sources) {
    const note = sourceNotesById.get(source.id)
    if (!note || note.status !== 'APPROVED') {
      issues.push(`正式 Source 未在资料笔记中获批：${source.id}`)
    }
    const releaseVersion = source.provenance?.dataVersion?.trim() || source.edition?.trim()
    if (!releaseVersion) {
      issues.push(`正式 Source 缺少版本标识：${source.id}`)
    } else if (note && releaseVersion !== note.dataVersion) {
      issues.push(`正式 Source 版本与资料笔记不一致：${source.id}`)
    }
  }
  for (const citation of dataset.citations) {
    const note = citationNotesById.get(citation.id)
    if (!note || note.status !== 'APPROVED') {
      issues.push(`正式 Citation 未在资料笔记中获批：${citation.id}`)
    } else if (
      note.sourceId !== citation.sourceId ||
      note.chapter !== citation.chapter ||
      note.locator !== citation.locator
    ) {
      issues.push(`Citation ${citation.id} 的 Source/章节/定位与资料笔记不一致`)
    }
    if (!sourceIds.has(citation.sourceId)) {
      issues.push(`Citation ${citation.id} 悬空引用 Source ${citation.sourceId}`)
    }
    assertCitationLocator(citation, issues)
  }
  for (const event of dataset.events) {
    for (const citationId of event.citationIds) {
      if (!citationIds.has(citationId)) {
        issues.push(`Event:${event.id} 悬空引用 Citation ${citationId}`)
      }
    }
  }
  for (const record of claims) {
    const { claim } = record
    const note = claimNotesById.get(claim.claimId)
    if (!note || note.status !== 'APPROVED') {
      issues.push(`正式 Claim 未在资料笔记中获批：${claim.claimId}`)
      continue
    }
    if (
      note.entityType !== record.entityType ||
      note.entityId !== record.entityId ||
      note.field !== record.sourceNoteField ||
      note.text !== claim.text ||
      !sameIds(note.citationIds, claim.citationIds) ||
      note.viewpointType !== claim.viewpointType ||
      note.certainty !== claim.certainty
    ) {
      issues.push(
        `正式 Claim 映射错误：${claim.claimId}（预期 ${record.entityType}/${record.entityId}/${record.field}）`,
      )
    }
    for (const citationId of claim.citationIds) {
      if (!citationIds.has(citationId)) {
        issues.push(`Claim ${claim.claimId} 悬空引用 Citation ${citationId}`)
      }
    }
  }

  const citationsById = new Map(
    dataset.citations.map((citation) => [citation.id, citation]),
  )
  const sourcesById = new Map(dataset.sources.map((source) => [source.id, source]))
  for (const source of dataset.sources.filter(sourceIsSpatial)) {
    assertSpatialSource(source, issues)
  }
  for (const object of directCitationIdsForSpatialObject(dataset)) {
    for (const citationId of object.citationIds) {
      if (!citationIds.has(citationId)) {
        issues.push(`${object.key} 悬空引用 Citation ${citationId}`)
      }
    }
    const spatialSources = object.citationIds
      .map((citationId) => citationsById.get(citationId))
      .filter((citation): citation is Citation => Boolean(citation))
      .map((citation) => sourcesById.get(citation.sourceId))
      .filter((source): source is Source => source !== undefined)
      .filter(sourceIsSpatial)
    if (spatialSources.length === 0) {
      issues.push(`空间对象缺少可解析空间 Source：${object.key}`)
    }
  }

  const serialized = JSON.stringify(dataset)
  for (const marker of [
    'TODO_REVIEW',
    'PENDING_SOURCE',
    'PENDING_REVIEW',
    'CHANGES_REQUIRED',
    '示例页码',
    '占位坐标',
    'PLACEHOLDER',
  ]) {
    if (serialized.includes(marker)) {
      issues.push(`正式 JSON 包含发布占位或待审核标记：${marker}`)
    }
  }

  if (
    dataset.places.features.some(
      (feature) => feature.properties.certainty !== 'DISPUTED',
    )
  ) {
    issues.push('正式 Place 未全部保持 DISPUTED')
  }
  if (
    dataset.events.some(
      (event) =>
        event.timePrecision !== 'APPROXIMATE' || event.normalizedDate !== null,
    )
  ) {
    issues.push('正式 Event 未全部保持 APPROXIMATE 且 normalizedDate=null')
  }
  if (
    dataset.routeSegments.features.some(
      (feature) =>
        feature.properties.certainty !== 'LOW' ||
        feature.properties.summary.viewpointType !== 'INFERENCE',
    )
  ) {
    issues.push('正式 RouteSegment 未全部保持 INFERENCE / LOW')
  }

  if (issues.length > 0) {
    throw new ContentReleaseAuditError(issues)
  }

  const releaseCounts = Object.fromEntries(
    RELEASE_ENTITY_TYPES.map((entityType) => [
      entityType,
      records.filter((record) => record.entityType === entityType).length,
    ]),
  ) as Record<ReleaseEntityType, number>

  return {
    releaseCounts,
    releaseReviewCount: releaseKeys.size,
    routePlanCount: routeIds.size,
    totalReviewCount: reviews.length,
    outsideReleaseRows: reviews.filter(
      (review) => !releaseKeys.has(recordKey(review.entityType, review.entityId)),
    ),
  }
}

function printReport(report: ContentReleaseAuditReport): void {
  const counts = report.releaseCounts
  console.log('MVP-11 内容发布映射审计通过')
  console.log(
    `正式集合：${counts.Place} Place、${counts.Event} Event、${counts.Geography} Geography、${counts.RouteSegment} RouteSegment、${counts.Claim} Claim、${counts.Citation} Citation、${counts.Source} Source`,
  )
  console.log(
    `审核映射：${report.releaseReviewCount} 个正式键均有唯一 APPROVED 行；${report.routePlanCount} 个 RoutePlan 仅作审核组织，不替代实际 RouteSegment`,
  )

  const outsideByStatus = new Map<string, ContentReviewRecord[]>()
  for (const row of report.outsideReleaseRows) {
    const group = outsideByStatus.get(row.status) ?? []
    group.push(row)
    outsideByStatus.set(row.status, group)
  }
  for (const [status, rows] of [...outsideByStatus].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    console.log(
      `范围外 ${status}：${rows.length} 条（${rows
        .map((row) => recordKey(row.entityType, row.entityId))
        .join('、')}）`,
    )
    if (status !== 'APPROVED') {
      for (const row of rows) {
        console.log(
          `  - ${recordKey(row.entityType, row.entityId)}：${stripMarkdown(row.notes)}`,
        )
      }
    }
  }
  console.log(
    '最终三方签字不由自动化判断；工程通过、行级 APPROVED 与浏览器通过均不能代替产品/内容/开发负责人签字。',
  )
}

function main(): void {
  const frontendDirectory = resolve(
    fileURLToPath(new URL('.', import.meta.url)),
    '..',
  )
  const repositoryRoot = resolve(frontendDirectory, '..')
  const dataset = JSON.parse(
    readFileSync(
      resolve(frontendDirectory, 'public/data/anshi/mvp-v1.json'),
      'utf8',
    ),
  ) as MvpDataset
  const sourceNotes = readFileSync(
    resolve(repositoryRoot, 'data/curated/anshi-mvp-source-notes.md'),
    'utf8',
  )
  const contentReview = readFileSync(
    resolve(repositoryRoot, 'docs/reviews/anshi-mvp-content-review.md'),
    'utf8',
  )

  try {
    printReport(auditContentRelease({ dataset, sourceNotes, contentReview }))
  } catch (error) {
    if (error instanceof ContentReleaseAuditError) {
      console.error(error.message)
      for (const issue of error.issues) {
        console.error(`- ${issue}`)
      }
      process.exitCode = 1
      return
    }
    throw error
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
