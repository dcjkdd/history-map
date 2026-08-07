import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildRouteDisplayFeatures,
  getRoutePresentation,
  ROUTE_DISTANCE_METHOD_NOTE,
} from '../src/domain/routePresentation.ts'
import type { MvpDataset } from '../src/domain/mvpTypes'
import { parseContentReviews } from './audit-content-release.ts'

const EXPECTED_FORMAL_DATA_SHA256 =
  '34927c09eb03f37e2b7d884afb34172dc9990bc3549a6c1638813ddc251beee6'
const EXPECTED_LOCKFILE_SHA256 =
  'd2aa04cb6893326b206629ad8f8b3e3db573d1632fc847451aa5db888e9c7f22'

const FIRST_APPROVAL_IDS = [
  'PHASE2-04-DIRECTION-YAN-01',
  'PHASE2-04-DIRECTION-TANG-01',
  'PHASE2-04-PRESENTATION-DIRECTION-SEMANTICS-01',
  'PHASE2-04-METHOD-DISTANCE-01',
  'PHASE2-04-DISTANCE-YAN-01',
  'PHASE2-04-DISTANCE-YAN-02',
  'PHASE2-04-DISTANCE-TANG-01',
  'PHASE2-04-PRESENTATION-YAN-01',
  'PHASE2-04-PRESENTATION-TANG-01',
] as const

const SECOND_APPROVAL_IDS = [
  'PHASE2-04-GAP-YAN-CONSTRAINT-01',
  'PHASE2-04-SRC-XIAOHAN-SCOPE-01',
  'PHASE2-04-CIT-XIAOHAN-SCOPE-01',
  'PHASE2-04-SRC-XIAOHAN-WEST-TERRAIN-01',
  'PHASE2-04-CIT-XIAOHAN-WEST-TERRAIN-01',
  'PHASE2-04-SRC-XIAOHAN-TANG-CONTEXT-01',
  'PHASE2-04-CIT-XIAOHAN-TANG-CONTEXT-01',
  'PHASE2-04-PRESENTATION-YAN-CONSTRAINT-01',
] as const

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function sha256(contents: string): string {
  return createHash('sha256').update(contents).digest('hex')
}

function phase2ReviewRow(markdown: string, candidateId: string): string[] {
  const matches = markdown
    .split('\n')
    .filter((line) => line.startsWith('| Phase2'))
    .map((line) => line.split('|').map((cell) => cell.trim()))
    .filter((row) => row[2] === candidateId)

  invariant(matches.length === 1, `PHASE2-04 review row must be unique: ${candidateId}`)
  return matches[0]
}

function verifyApprovalRows(
  sourceNotes: string,
  contentReview: string,
): void {
  for (const [candidateIds, date] of [
    [FIRST_APPROVAL_IDS, '2026-08-04'],
    [SECOND_APPROVAL_IDS, '2026-08-06'],
  ] as const) {
    for (const candidateId of candidateIds) {
      const row = phase2ReviewRow(contentReview, candidateId)
      invariant(row.length === 13, `PHASE2-04 review columns drifted: ${candidateId}`)
      invariant(row[4] === '是', `PHASE2-04 fact review missing: ${candidateId}`)
      invariant(row[8] === 'banq', `PHASE2-04 reviewer drifted: ${candidateId}`)
      invariant(row[9] === date, `PHASE2-04 review date drifted: ${candidateId}`)
      invariant(row[10] === 'APPROVED', `PHASE2-04 candidate is not APPROVED: ${candidateId}`)
    }
  }

  for (const candidateId of [
    ...FIRST_APPROVAL_IDS.filter(
      (id) => id !== 'PHASE2-04-METHOD-DISTANCE-01',
    ),
    ...SECOND_APPROVAL_IDS,
  ]) {
    const rows = sourceNotes
      .split('\n')
      .filter((line) => line.startsWith(`| ${candidateId} |`))
    invariant(rows.length === 1, `PHASE2-04 source-note row must be unique: ${candidateId}`)
    invariant(
      rows[0]?.endsWith('| APPROVED |'),
      `PHASE2-04 source-note candidate is not APPROVED: ${candidateId}`,
    )
  }

  invariant(
    sourceNotes.includes(
      '`PHASE2-04-METHOD-DISTANCE-01` 已由内容负责人随三项结果一并批准，状态为 `APPROVED`',
    ),
    'PHASE2-04 distance method approval record is missing',
  )
  invariant(
    sourceNotes.includes(
      '批准第 10.7 节全部来源、候选第四句及禁止扩展边界',
    ),
    'PHASE2-04 second human approval record is missing',
  )
}

function verifyPreservedReviewBoundaries(contentReview: string): void {
  const reviews = parseContentReviews(contentReview)
  const statusFor = (entityType: string, entityId: string): string | undefined =>
    reviews.find(
      (row) => row.entityType === entityType && row.entityId === entityId,
    )?.status

  invariant(
    statusFor('Geography', 'geography-guanzhong-corridor') === 'PENDING_SOURCE',
    'geography-guanzhong-corridor must remain PENDING_SOURCE',
  )
  invariant(
    statusFor('Claim', 'claim-geography-guanzhong-corridor-modern-01') ===
      'PENDING_REVIEW',
    'guanzhong corridor Claim must remain PENDING_REVIEW',
  )
  invariant(
    statusFor('Claim', 'claim-geography-yellow-river-role-modern-01') ===
      'REJECTED',
    'Yellow River historical-role Claim must remain REJECTED',
  )
  invariant(
    statusFor('Claim', 'claim-geography-qinling-role-modern-01') === 'REJECTED',
    'Qinling historical-role Claim must remain REJECTED',
  )
}

function verifyRoutePresentation(dataset: MvpDataset): void {
  invariant(dataset.places.features.length === 5, 'formal Place count drifted')
  invariant(dataset.geography.features.length === 3, 'formal Geography count drifted')
  invariant(dataset.routeSegments.features.length === 3, 'formal RouteSegment count drifted')
  invariant(dataset.events.length === 6, 'formal Event count drifted')
  invariant(
    dataset.places.features.every(
      (feature) => feature.properties.certainty === 'DISPUTED',
    ),
    'formal representative points must remain DISPUTED',
  )
  invariant(
    dataset.routeSegments.features.every(
      (feature) =>
        feature.geometry.coordinates.length === 2 &&
        feature.properties.certainty === 'LOW' &&
        feature.properties.summary.viewpointType === 'INFERENCE',
    ),
    'formal route segments must remain two-point INFERENCE / LOW lines',
  )
  invariant(
    dataset.events.every((event) => event.timePrecision === 'APPROXIMATE'),
    'formal event time precision drifted',
  )

  const display = buildRouteDisplayFeatures(
    dataset.routeSegments,
    dataset.places,
  )
  invariant(display.features.length === 3, 'PHASE2-04 display segment count drifted')
  invariant(
    JSON.stringify(display.features.map((feature) => feature.geometry)) ===
      JSON.stringify(dataset.routeSegments.features.map((feature) => feature.geometry)),
    'PHASE2-04 display geometry must exactly copy formal route geometry',
  )
  invariant(
    display.features.every((feature) => feature.properties.arrowText === '▶'),
    'PHASE2-04 routes must use a single route-specific ▶ glyph',
  )
  invariant(
    display.features.map((feature) => feature.properties.distanceLabel).join('|') ===
      [
        '现代代表点间直线距离约 120 公里',
        '现代代表点间直线距离约 80 公里',
        '现代代表点间直线距离约 55 公里',
      ].join('|'),
    'PHASE2-04 rounded distance outputs drifted',
  )

  const raw = [
    getRoutePresentation(dataset, 'route-yan-westward')?.segments[0]?.distanceKm,
    getRoutePresentation(dataset, 'route-yan-westward')?.segments[1]?.distanceKm,
    getRoutePresentation(dataset, 'route-tang-advance')?.segments[0]?.distanceKm,
  ]
  const expected = [119.995101, 81.167887, 53.246055]
  raw.forEach((distance, index) => {
    invariant(
      distance !== undefined && Math.abs(distance - expected[index]!) < 0.000001,
      `PHASE2-04 raw Haversine result drifted at segment ${index + 1}`,
    )
  })

  const yan = getRoutePresentation(dataset, 'route-yan-westward')
  const tang = getRoutePresentation(dataset, 'route-tang-advance')
  invariant(yan?.notes.length === 4, 'Yan route must retain four approved notes')
  invariant(tang?.notes.length === 4, 'Tang route must retain four approved notes')
  invariant(
    yan.notes[3] ===
      '地形约束：洛阳—潼关的崤函区域受山地与黄河影响，沿线因地理形成多处隘口；其中陕州—潼关西段南依崤山、北临黄河。',
    'Yan terrain constraint copy drifted',
  )
  invariant(
    yan.supplementalSources.length === 3,
    'Yan terrain source entry count drifted',
  )
  invariant(
    ROUTE_DISTANCE_METHOD_NOTE ===
      '按两个现代争议代表点的大圆距离计算，取整到最近 5 公里；不等于唐代道路或历史行军里程。',
    'PHASE2-04 distance method boundary drifted',
  )

  const formalIds = [
    ...dataset.places.features.map((feature) => feature.properties.id),
    ...dataset.geography.features.map((feature) => feature.properties.id),
    ...dataset.routeSegments.features.map((feature) => feature.properties.id),
    ...dataset.events.map((event) => event.id),
  ]
  invariant(
    !formalIds.some(
      (id) => id.startsWith('PHASE2-') || id === 'geography-guanzhong-corridor',
    ),
    'PHASE2-04 display-only candidates must not enter formal JSON',
  )
}

function main(): void {
  const frontendDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
  const repositoryRoot = resolve(frontendDirectory, '..')
  const formalDataText = readFileSync(
    resolve(frontendDirectory, 'public/data/anshi/mvp-v1.json'),
    'utf8',
  )
  const lockfileText = readFileSync(
    resolve(frontendDirectory, 'package-lock.json'),
    'utf8',
  )
  const sourceNotes = readFileSync(
    resolve(repositoryRoot, 'data/curated/anshi-mvp-source-notes.md'),
    'utf8',
  )
  const contentReview = readFileSync(
    resolve(repositoryRoot, 'docs/reviews/anshi-mvp-content-review.md'),
    'utf8',
  )

  invariant(
    sha256(formalDataText) === EXPECTED_FORMAL_DATA_SHA256,
    'formal mvp-v1.json SHA-256 drifted during PHASE2-04',
  )
  invariant(
    sha256(lockfileText) === EXPECTED_LOCKFILE_SHA256,
    'package-lock.json SHA-256 drifted during PHASE2-04',
  )
  verifyApprovalRows(sourceNotes, contentReview)
  verifyPreservedReviewBoundaries(contentReview)
  verifyRoutePresentation(JSON.parse(formalDataText) as MvpDataset)

  console.log(
    'PHASE2-04 content gate verified: 17 approved candidates, 3 Haversine outputs, 2 four-note route presentations, formal JSON/lockfile and PENDING/REJECTED boundaries preserved.',
  )
}

main()
