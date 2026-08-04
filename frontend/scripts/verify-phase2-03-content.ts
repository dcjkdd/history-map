import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { MvpDataset } from '../src/domain/mvpTypes'
import { parseContentReviews } from './audit-content-release.ts'

const EXPECTED_FORMAL_DATA_SHA256 =
  '34927c09eb03f37e2b7d884afb34172dc9990bc3549a6c1638813ddc251beee6'
const EXPECTED_LOCKFILE_SHA256 =
  'd2aa04cb6893326b206629ad8f8b3e3db573d1632fc847451aa5db888e9c7f22'

const APPROVED_PHASE2_CANDIDATE_IDS = [
  'PHASE2-SRC-YELLOW-FLOW-01',
  'PHASE2-SRC-WEI-FLOW-01',
  'PHASE2-SRC-GUANZHONG-LOWLAND-01',
  'PHASE2-CLAIM-YELLOW-FLOW-01',
  'PHASE2-CLAIM-WEI-FLOW-01',
  'PHASE2-CLAIM-GUANZHONG-LOWLAND-01',
  'PHASE2-GEOMETRY-EAST-GUANZHONG-01',
  'PHASE2-CLAIM-EAST-GUANZHONG-01',
  'PHASE2-PRESENTATION-TONGGUAN-01',
] as const

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function sha256(contents: string): string {
  return createHash('sha256').update(contents).digest('hex')
}

function reviewRowForCandidate(markdown: string, candidateId: string): string[] {
  const rows = markdown
    .split('\n')
    .filter((line) => line.startsWith('| Phase2'))
    .map((line) => line.split('|').map((cell) => cell.trim()))
  const matches = rows.filter((row) => row[2] === candidateId)

  invariant(matches.length === 1, `PHASE2-03 candidate review row must be unique: ${candidateId}`)
  return matches[0]
}

function verifyPhase2Approvals(sourceNotes: string, contentReview: string): void {
  for (const candidateId of APPROVED_PHASE2_CANDIDATE_IDS) {
    const row = reviewRowForCandidate(contentReview, candidateId)
    invariant(row.length === 15, `PHASE2-03 review row has unexpected columns: ${candidateId}`)
    invariant(row[4] === '是', `PHASE2-03 fact review missing: ${candidateId}`)
    invariant(row[10] === 'banq', `PHASE2-03 reviewer drifted: ${candidateId}`)
    invariant(row[11] === '2026-08-04', `PHASE2-03 review date drifted: ${candidateId}`)
    invariant(row[12] === 'APPROVED', `PHASE2-03 candidate is not APPROVED: ${candidateId}`)

    const sourceNoteRows = sourceNotes
      .split('\n')
      .filter((line) => line.startsWith(`| ${candidateId} |`))
    invariant(sourceNoteRows.length === 1, `PHASE2-03 source-note row must be unique: ${candidateId}`)
    invariant(
      sourceNoteRows[0].endsWith('| APPROVED |'),
      `PHASE2-03 source-note candidate is not APPROVED: ${candidateId}`,
    )
  }

  invariant(
    sourceNotes.includes('标签锚点 `[109.68, 34.40]` 只为排版'),
    'PHASE2-03 lowland display-only anchor is not recorded',
  )
  invariant(
    sourceNotes.includes('固定 `22px` 半透明赭金带和虚线边缘表达'),
    'PHASE2-03 corridor screen-width method is not recorded',
  )
  invariant(
    sourceNotes.includes('保持原 PENDING/REJECTED 状态不变'),
    'PHASE2-03 explicit human approval record is missing',
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

function verifyFormalDataset(dataset: MvpDataset): void {
  invariant(dataset.places.features.length === 5, 'formal Place count drifted')
  invariant(dataset.geography.features.length === 3, 'formal Geography count drifted')
  invariant(dataset.routeSegments.features.length === 3, 'formal RouteSegment count drifted')
  invariant(dataset.events.length === 6, 'formal Event count drifted')
  invariant(
    dataset.places.features.every((feature) => feature.properties.certainty === 'DISPUTED'),
    'all five formal representative points must remain DISPUTED',
  )
  invariant(
    dataset.events.every((event) => event.timePrecision === 'APPROXIMATE'),
    'all formal events must retain APPROXIMATE time precision',
  )
  invariant(
    dataset.routeSegments.features.every(
      (feature) =>
        feature.properties.certainty === 'LOW' &&
        feature.properties.summary.viewpointType === 'INFERENCE',
    ),
    'all formal route segments must remain INFERENCE / LOW',
  )

  const tongguan = dataset.places.features.find(
    (feature) => feature.properties.id === 'place-tongguan',
  )
  invariant(tongguan?.properties.placeType === 'PASS', 'Tongguan must remain PASS')
  invariant(
    tongguan.properties.certainty === 'DISPUTED',
    'Tongguan representative point must remain DISPUTED',
  )

  const guideInput = dataset.routeSegments.features.find(
    (feature) => feature.properties.id === 'route-tang-advance-01',
  )
  invariant(guideInput?.geometry.coordinates.length === 2, 'corridor guide input must retain two points')
  invariant(
    guideInput.properties.fromPlaceId === 'place-tongguan' &&
      guideInput.properties.toPlaceId === 'place-lingbao',
    'corridor guide input endpoints drifted',
  )

  const formalIds = [
    ...dataset.places.features.map((feature) => feature.properties.id),
    ...dataset.geography.features.map((feature) => feature.properties.id),
    ...dataset.routeSegments.features.map((feature) => feature.properties.id),
    ...dataset.events.map((event) => event.id),
  ]
  invariant(
    !formalIds.some((id) => id.startsWith('PHASE2-') || id === 'geography-guanzhong-corridor'),
    'display-only PHASE2-03 candidates must not enter formal JSON',
  )
}

function main(): void {
  const frontendDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
  const repositoryRoot = resolve(frontendDirectory, '..')
  const formalDataText = readFileSync(
    resolve(frontendDirectory, 'public/data/anshi/mvp-v1.json'),
    'utf8',
  )
  const lockfileText = readFileSync(resolve(frontendDirectory, 'package-lock.json'), 'utf8')
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
    'formal mvp-v1.json SHA-256 drifted during PHASE2-03',
  )
  invariant(
    sha256(lockfileText) === EXPECTED_LOCKFILE_SHA256,
    'package-lock.json SHA-256 drifted during PHASE2-03',
  )
  verifyPhase2Approvals(sourceNotes, contentReview)
  verifyPreservedReviewBoundaries(contentReview)
  verifyFormalDataset(JSON.parse(formalDataText) as MvpDataset)

  console.log(
    'PHASE2-03 content gate verified: 9 display-only candidates approved; formal JSON, lockfile, PENDING/REJECTED boundaries, PASS and INFERENCE / LOW semantics preserved.',
  )
}

main()
