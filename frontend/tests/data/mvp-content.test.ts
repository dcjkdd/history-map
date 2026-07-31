// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { MvpDataset, SourcedClaim } from '../../src/domain/mvpTypes'
import {
  validateMvpDataset,
  validateMvpIntegrity,
} from '../../src/domain/mvpValidation'

const CORE_PLACE_IDS = [
  'place-changan',
  'place-lingbao',
  'place-luoyang',
  'place-shanzhou',
  'place-tongguan',
]

const CORE_GEOGRAPHY_IDS = [
  'geography-qinling',
  'geography-wei-river',
  'geography-yellow-river',
]

const CORE_EVENT_IDS = [
  'event-01-defense-context',
  'event-02-yan-westward',
  'event-03-decision-to-advance',
  'event-04-lingbao-engagement',
  'event-05-tongguan-fall',
  'event-06-changan-consequence',
]

const RELEASE_ROUTE_IDS = ['route-tang-advance', 'route-yan-westward']

const APPROVED_ORGANIZATIONAL_CLAIM_IDS = [
  'claim-route-tang-advance-plan-modern-01',
  'claim-route-yan-westward-plan-modern-01',
]

const SPATIAL_SOURCE_IDS = [
  'SRC-SPATIAL-01',
  'SRC-SPATIAL-02',
  'SRC-SPATIAL-03',
  'SRC-SPATIAL-04',
  'SRC-SPATIAL-05',
  'SRC-SPATIAL-06',
  'SRC-SPATIAL-07',
]

const OPEN_LICENSE_SPATIAL_SOURCE_IDS = [
  'SRC-SPATIAL-01',
  'SRC-SPATIAL-02',
  'SRC-SPATIAL-04',
  'SRC-SPATIAL-05',
  'SRC-SPATIAL-06',
  'SRC-SPATIAL-07',
]

function loadReleaseDataset(): MvpDataset {
  const input: unknown = JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'public/data/anshi/mvp-v1.json'),
      'utf8',
    ),
  )
  const contractResult = validateMvpDataset(input)

  expect(contractResult.ok).toBe(true)
  if (!contractResult.ok) {
    throw new Error(
      contractResult.errors
        .map((error) => `${error.path}: ${error.message}`)
        .join('\n'),
    )
  }

  expect(validateMvpIntegrity(contractResult.data)).toEqual({
    ok: true,
    issues: [],
  })

  return contractResult.data
}

function sorted(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right))
}

interface ContentReviewRecord {
  entityType: string
  entityId: string
  reviewer: string
  reviewDate: string
  status: string
}

function loadContentReviews(): ContentReviewRecord[] {
  return readFileSync(
    resolve(process.cwd(), '../docs/reviews/anshi-mvp-content-review.md'),
    'utf8',
  )
    .split('\n')
    .filter((line) => /^\| (Source|Citation|Claim) \|/.test(line))
    .map((line) => {
      const row = line.split('|').map((cell) => cell.trim())
      expect(row, line).toHaveLength(15)

      return {
        entityType: row[1],
        entityId: row[2],
        reviewer: row[10],
        reviewDate: row[11],
        status: row[12],
      }
    })
}

function approvedReviewIds(
  reviews: ContentReviewRecord[],
  entityType: string,
): string[] {
  return sorted(
    reviews
      .filter(
        (review) =>
          review.entityType === entityType && review.status === 'APPROVED',
      )
      .map((review) => review.entityId),
  )
}

function releaseClaims(dataset: MvpDataset): SourcedClaim[] {
  return [
    ...dataset.places.features.flatMap((feature) => [
      feature.properties.summary,
      feature.properties.strategicRole,
      ...(feature.properties.coordinateNote
        ? [feature.properties.coordinateNote]
        : []),
    ]),
    ...dataset.geography.features.map((feature) => feature.properties.summary),
    ...dataset.routeSegments.features.map(
      (feature) => feature.properties.summary,
    ),
    ...dataset.events.flatMap((event) => [event.summary, event.whyItMatters]),
  ]
}

describe('MVP-03 正式内容', () => {
  it('达到缩小版实体、逻辑路线和来源规模', () => {
    const dataset = loadReleaseDataset()

    expect(dataset.places.features).toHaveLength(5)
    expect(dataset.geography.features).toHaveLength(3)
    expect(dataset.events).toHaveLength(6)
    expect(dataset.routeSegments.features).toHaveLength(3)
    expect(
      new Set(
        dataset.routeSegments.features.map(
          (feature) => feature.properties.routeId,
        ),
      ).size,
    ).toBe(2)
    expect(dataset.sources).toHaveLength(19)
    expect(dataset.citations).toHaveLength(36)
  })

  it('包含规定地点、现代背景、连续事件和有效默认事件', () => {
    const dataset = loadReleaseDataset()

    expect(
      sorted(
        dataset.places.features.map((feature) => feature.properties.id),
      ),
    ).toEqual(CORE_PLACE_IDS)
    expect(
      sorted(
        dataset.geography.features.map((feature) => feature.properties.id),
      ),
    ).toEqual(CORE_GEOGRAPHY_IDS)
    expect(dataset.events.map((event) => event.id)).toEqual(CORE_EVENT_IDS)
    expect(dataset.events.map((event) => event.sequence)).toEqual([
      1, 2, 3, 4, 5, 6,
    ])
    expect(dataset.topic.defaultEventId).toBe(CORE_EVENT_IDS[0])
    expect(
      dataset.events.some(
        (event) => event.id === dataset.topic.defaultEventId,
      ),
    ).toBe(true)
  })

  it('只发布有引用的逐条 Claim，并保留近似时间和空间不确定性', () => {
    const dataset = loadReleaseDataset()
    const claims = releaseClaims(dataset)

    expect(claims).toHaveLength(33)
    expect(new Set(claims.map((claim) => claim.claimId)).size).toBe(33)
    expect(claims.every((claim) => claim.citationIds.length > 0)).toBe(true)
    expect(dataset.events.every((event) => event.normalizedDate === null)).toBe(
      true,
    )
    expect(
      dataset.events.every((event) => event.timePrecision === 'APPROXIMATE'),
    ).toBe(true)
    expect(
      dataset.places.features.every(
        (feature) =>
          feature.properties.certainty === 'DISPUTED' &&
          feature.properties.coordinateNote !== null,
      ),
    ).toBe(true)
    expect(
      dataset.routeSegments.features.every(
        (feature) =>
          feature.properties.certainty === 'LOW' &&
          feature.properties.summary.viewpointType === 'INFERENCE',
      ),
    ).toBe(true)
    expect(
      sorted(
        dataset.routeSegments.features.map(
          (feature) => feature.properties.routeId,
        ),
      ).filter((id, index, values) => index === 0 || id !== values[index - 1]),
    ).toEqual(RELEASE_ROUTE_IDS)

    const placesById = new Map(
      dataset.places.features.map((feature) => [
        feature.properties.id,
        feature.geometry.coordinates,
      ]),
    )
    for (const segment of dataset.routeSegments.features) {
      expect(segment.geometry.coordinates).toHaveLength(2)
      expect(segment.geometry.coordinates[0]).toEqual(
        placesById.get(segment.properties.fromPlaceId),
      )
      expect(segment.geometry.coordinates[1]).toEqual(
        placesById.get(segment.properties.toPlaceId),
      )
    }
  })

  it('正式 ID 与人工审核表逐条一致，并排除缩小版之外的记录', () => {
    const dataset = loadReleaseDataset()
    const reviews = loadContentReviews()
    const claims = releaseClaims(dataset)
    const serialized = JSON.stringify(dataset)

    expect(sorted(dataset.sources.map((source) => source.id))).toEqual(
      approvedReviewIds(reviews, 'Source'),
    )
    expect(sorted(dataset.citations.map((citation) => citation.id))).toEqual(
      approvedReviewIds(reviews, 'Citation'),
    )
    expect(sorted(claims.map((claim) => claim.claimId))).toEqual(
      approvedReviewIds(reviews, 'Claim').filter(
        (claimId) => !APPROVED_ORGANIZATIONAL_CLAIM_IDS.includes(claimId),
      ),
    )

    const releasedReviewKeys = new Set([
      ...dataset.sources.map((source) => `Source:${source.id}`),
      ...dataset.citations.map((citation) => `Citation:${citation.id}`),
      ...claims.map((claim) => `Claim:${claim.claimId}`),
    ])
    for (const review of reviews) {
      if (releasedReviewKeys.has(`${review.entityType}:${review.entityId}`)) {
        expect(review).toMatchObject({
          reviewer: 'banq',
          reviewDate: '2026-07-31',
          status: 'APPROVED',
        })
      }
    }

    for (const marker of [
      'SRC-PRIMARY-02',
      'SRC-HISTGEO-02',
      'SRC-MODERN-02',
      'SRC-MODERN-03',
      'SRC-MODERN-04',
      'SRC-MODERN-05',
      'geography-guanzhong-corridor',
      'claim-geography-yellow-river-role-modern-01',
      'claim-geography-qinling-role-modern-01',
      'claim-route-yan-westward-plan-modern-01',
      'claim-route-tang-advance-plan-modern-01',
    ]) {
      expect(serialized).not.toContain(marker)
    }
  })

  it('为空间来源保留版本、坐标系、许可和处理记录', () => {
    const dataset = loadReleaseDataset()
    const sourcesById = new Map(dataset.sources.map((source) => [source.id, source]))

    for (const sourceId of SPATIAL_SOURCE_IDS) {
      const source = sourcesById.get(sourceId)
      expect(source, sourceId).toBeDefined()
      expect(source?.provenance?.accessDate, sourceId).toBeTruthy()
      expect(source?.provenance?.dataVersion, sourceId).toBeTruthy()
      expect(source?.provenance?.originalCrs, sourceId).toBeTruthy()
      expect(source?.provenance?.coverage, sourceId).toBeTruthy()
      expect(source?.provenance?.processingNotes, sourceId).toBeTruthy()
      expect(source?.provenance?.outputId, sourceId).toBeTruthy()
      expect(source?.provenance?.licenseName, sourceId).toBeTruthy()
      expect(source?.provenance?.usageRestrictions, sourceId).toBeTruthy()
    }

    for (const sourceId of OPEN_LICENSE_SPATIAL_SOURCE_IDS) {
      const provenance = sourcesById.get(sourceId)?.provenance
      expect(provenance?.licenseUrl, sourceId).toBeTruthy()
      expect(provenance?.attribution, sourceId).toBeTruthy()
    }

    expect(sourcesById.get('SRC-SPATIAL-03')?.provenance).toMatchObject({
      licenseUrl: null,
      attribution: null,
    })

    expect(
      dataset.geography.features.every(
        (feature) => feature.properties.certainty === 'UNKNOWN',
      ),
    ).toBe(true)

    for (const feature of dataset.geography.features) {
      if (feature.geometry.type !== 'Polygon') {
        continue
      }
      for (const ring of feature.geometry.coordinates) {
        expect(ring.length).toBeGreaterThanOrEqual(4)
        expect(ring.at(-1)).toEqual(ring[0])
      }
    }
  })
})
