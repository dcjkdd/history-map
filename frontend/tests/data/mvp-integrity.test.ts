// @vitest-environment node

import { rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { MVP_SCHEMA_VERSION } from '../../src/domain/mvpTypes'
import type {
  Event,
  MvpDataset,
  SourcedClaim,
} from '../../src/domain/mvpTypes'
import {
  validateMvpDataset,
  validateMvpIntegrity,
} from '../../src/domain/mvpValidation'

const SOURCE_ID = 'source-synthetic'
const CITATION_ID = 'citation-synthetic'
const PLACE_ID = 'place-synthetic'
const EVENT_ID = 'event-synthetic'

function createClaim(claimId: string, text: string): SourcedClaim {
  return {
    claimId,
    text,
    viewpointType: 'FACT',
    certainty: 'HIGH',
    citationIds: [CITATION_ID],
  }
}

function createEvent(
  id = EVENT_ID,
  sequence = 1,
  claimSuffix = 'primary',
): Event {
  return {
    id,
    sequence,
    title: '合成事件',
    eventType: 'OTHER',
    dateLabel: '测试时间',
    normalizedDate: null,
    timePrecision: 'APPROXIMATE',
    certainty: 'HIGH',
    summary: createClaim(
      `claim-event-summary-${claimSuffix}`,
      '合成事件说明',
    ),
    whyItMatters: createClaim(
      `claim-event-importance-${claimSuffix}`,
      '合成事件作用说明',
    ),
    relatedPlaceIds: [PLACE_ID],
    actorLabels: ['测试参与者'],
    citationIds: [CITATION_ID],
  }
}

function createValidDataset(): MvpDataset {
  return {
    schemaVersion: MVP_SCHEMA_VERSION,
    topic: {
      id: 'topic-synthetic',
      title: '完整性测试专题',
      subtitle: '不包含历史事实的合成数据',
      summary: '该数据只验证 MVP-02 门禁，不作为历史内容发布。',
      initialView: {
        center: [0, 0],
        zoom: 3,
        bounds: [
          [-2, -2],
          [2, 2],
        ],
        maxBounds: [
          [-3, -3],
          [3, 3],
        ],
      },
      defaultEventId: EVENT_ID,
    },
    places: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0],
          },
          properties: {
            id: PLACE_ID,
            name: '合成地点',
            modernName: null,
            placeType: 'OTHER',
            summary: createClaim(
              'claim-place-summary',
              '合成地点说明',
            ),
            strategicRole: createClaim(
              'claim-place-role',
              '合成地点作用说明',
            ),
            certainty: 'HIGH',
            coordinateNote: null,
            citationIds: [CITATION_ID],
          },
        },
      ],
    },
    geography: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          properties: {
            id: 'geography-synthetic',
            name: '合成地理要素',
            geographyType: 'CORRIDOR',
            summary: createClaim(
              'claim-geography-summary',
              '合成地理要素说明',
            ),
            certainty: 'HIGH',
            citationIds: [CITATION_ID],
          },
        },
      ],
    },
    routeSegments: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          properties: {
            id: 'route-segment-synthetic',
            routeId: 'route-synthetic',
            routeName: '合成路线',
            segmentNo: 1,
            side: 'OTHER',
            actionType: 'TRANSFER',
            appearAtEventId: EVENT_ID,
            fromPlaceId: PLACE_ID,
            toPlaceId: null,
            certainty: 'HIGH',
            summary: createClaim(
              'claim-route-summary',
              '合成路线分段说明',
            ),
            citationIds: [CITATION_ID],
          },
        },
      ],
    },
    events: [createEvent()],
    sources: [
      {
        id: SOURCE_ID,
        title: '完整性测试资料',
        author: null,
        edition: null,
        publisher: null,
        publishYear: null,
        sourceType: 'TEST',
        provenance: null,
      },
    ],
    citations: [
      {
        id: CITATION_ID,
        sourceId: SOURCE_ID,
        chapter: null,
        locator: 'fixture:1',
        pageStart: null,
        pageEnd: null,
        quote: null,
        summary: '该引用只支持合成测试数据。',
        viewpointType: 'FACT',
        certainty: 'HIGH',
      },
    ],
  }
}

function issuePaths(dataset: MvpDataset, code: string): string[] {
  return validateMvpIntegrity(dataset).issues
    .filter((issue) => issue.code === code)
    .map((issue) => issue.path)
}

describe('MVP 数据完整性', () => {
  it('接受引用、顺序和坐标均完整的合成数据集', () => {
    expect(validateMvpIntegrity(createValidDataset())).toEqual({
      ok: true,
      issues: [],
    })
  })

  it('接受引用集合完全为空的技术数据集', () => {
    const input = createValidDataset()
    input.topic.defaultEventId = null
    input.places.features = []
    input.geography.features = []
    input.routeSegments.features = []
    input.events = []
    input.sources = []
    input.citations = []
    const contractResult = validateMvpDataset(input)

    expect(contractResult.ok).toBe(true)
    if (contractResult.ok) {
      expect(validateMvpIntegrity(contractResult.data)).toEqual({
        ok: true,
        issues: [],
      })
    }
  })

  it('拒绝有 Event 但 defaultEventId 为 null 的非空数据集', () => {
    const dataset = createValidDataset()
    dataset.topic.defaultEventId = null

    expect(issuePaths(dataset, 'MISSING_REFERENCE')).toContain(
      '$.topic.defaultEventId',
    )
  })

  it('拒绝没有 Event 但 defaultEventId 非空的空内容数据集', () => {
    const dataset = createValidDataset()
    dataset.places.features = []
    dataset.geography.features = []
    dataset.routeSegments.features = []
    dataset.events = []
    dataset.sources = []
    dataset.citations = []

    expect(issuePaths(dataset, 'MISSING_REFERENCE')).toEqual([
      '$.topic.defaultEventId',
    ])
  })

  it('拒绝已有 Place 但没有 Event 和默认事件的部分数据集', () => {
    const dataset = createValidDataset()
    dataset.topic.defaultEventId = null
    dataset.geography.features = []
    dataset.routeSegments.features = []
    dataset.events = []

    expect(issuePaths(dataset, 'MISSING_REFERENCE')).toContain(
      '$.topic.defaultEventId',
    )
  })

  it('拒绝各命名空间和 Claim 中的重复 ID', () => {
    const dataset = createValidDataset()
    dataset.places.features.push(
      structuredClone(dataset.places.features[0]!),
    )

    const result = validateMvpIntegrity(dataset)

    expect(result.ok).toBe(false)
    expect(issuePaths(dataset, 'DUPLICATE_ID')).toEqual(
      expect.arrayContaining([
        '$.places.features[1].properties.id',
        '$.places.features[1].properties.summary.claimId',
        '$.places.features[1].properties.strategicRole.claimId',
      ]),
    )
  })

  it('拒绝默认事件、地点、出现事件、Citation 和 Source 的悬空引用', () => {
    const dataset = createValidDataset()
    dataset.topic.defaultEventId = 'event-missing'
    dataset.events[0]!.relatedPlaceIds = ['place-missing']
    dataset.events[0]!.summary.citationIds = ['citation-missing']
    dataset.routeSegments.features[0]!.properties.appearAtEventId =
      'event-missing'
    dataset.routeSegments.features[0]!.properties.fromPlaceId =
      'place-missing'
    dataset.citations[0]!.sourceId = 'source-missing'

    expect(issuePaths(dataset, 'MISSING_REFERENCE')).toEqual(
      expect.arrayContaining([
        '$.topic.defaultEventId',
        '$.routeSegments.features[0].properties.fromPlaceId',
        '$.events[0].relatedPlaceIds[0]',
        '$.citations[0].sourceId',
      ]),
    )
    expect(issuePaths(dataset, 'UNKNOWN_APPEAR_EVENT')).toEqual([
      '$.routeSegments.features[0].properties.appearAtEventId',
    ])
    expect(issuePaths(dataset, 'MISSING_CITATION')).toContain(
      '$.events[0].summary.citationIds[0]',
    )
  })

  it('拒绝超出 WGS84 范围的视野、地点、地理和路线坐标', () => {
    const dataset = createValidDataset()
    dataset.topic.initialView.center = [181, 0]
    dataset.topic.initialView.bounds![0] = [-181, 0]
    dataset.places.features[0]!.geometry.coordinates = [0, 91]
    dataset.geography.features[0]!.geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, -91],
          [0, 0],
        ],
      ],
    }
    dataset.routeSegments.features[0]!.geometry.coordinates[1] = [0, -91]

    expect(issuePaths(dataset, 'INVALID_COORDINATE')).toEqual(
      expect.arrayContaining([
        '$.topic.initialView.center[0]',
        '$.topic.initialView.bounds[0][0]',
        '$.places.features[0].geometry.coordinates[1]',
        '$.geography.features[0].geometry.coordinates[0][2][1]',
        '$.routeSegments.features[0].geometry.coordinates[1][1]',
      ]),
    )
  })

  it('拒绝 Event sequence 跳号或未按 sequence 排列', () => {
    const dataset = createValidDataset()
    dataset.events.push(createEvent('event-second', 3, 'second'))

    expect(issuePaths(dataset, 'INVALID_EVENT_SEQUENCE')).toEqual([
      '$.events[1].sequence',
    ])

    dataset.events = [
      createEvent('event-second', 2, 'second'),
      createEvent(EVENT_ID, 1, 'primary'),
    ]

    expect(issuePaths(dataset, 'INVALID_EVENT_SEQUENCE')).toEqual([
      '$.events[0].sequence',
      '$.events[1].sequence',
    ])
  })

  it('拒绝同一路线内重复或跳号的 segmentNo', () => {
    const dataset = createValidDataset()
    const secondSegment = structuredClone(
      dataset.routeSegments.features[0]!,
    )
    secondSegment.properties.id = 'route-segment-second'
    secondSegment.properties.segmentNo = 3
    secondSegment.properties.summary.claimId = 'claim-route-summary-second'
    dataset.routeSegments.features.push(secondSegment)

    expect(issuePaths(dataset, 'INVALID_ROUTE_SEQUENCE')).toEqual([
      '$.routeSegments.features[1].properties.segmentNo',
    ])

    secondSegment.properties.segmentNo = 1

    expect(issuePaths(dataset, 'INVALID_ROUTE_SEQUENCE')).toContain(
      '$.routeSegments.features[1].properties.segmentNo',
    )
  })

  it('要求 LOW、DISPUTED、UNKNOWN 地点提供坐标说明', () => {
    const dataset = createValidDataset()

    for (const certainty of ['LOW', 'DISPUTED', 'UNKNOWN'] as const) {
      dataset.places.features[0]!.properties.certainty = certainty
      dataset.places.features[0]!.properties.coordinateNote = null

      expect(issuePaths(dataset, 'MISSING_COORDINATE_NOTE')).toEqual([
        '$.places.features[0].properties.coordinateNote',
      ])
    }
  })

  it('要求 Event、空间实体和逐条 Claim 都有可解析 Citation', () => {
    const dataset = createValidDataset()
    dataset.places.features[0]!.properties.citationIds = []
    dataset.geography.features[0]!.properties.citationIds = []
    dataset.routeSegments.features[0]!.properties.citationIds = []
    dataset.events[0]!.citationIds = []
    dataset.events[0]!.whyItMatters.citationIds = []

    expect(issuePaths(dataset, 'MISSING_CITATION')).toEqual(
      expect.arrayContaining([
        '$.places.features[0].properties.citationIds',
        '$.geography.features[0].properties.citationIds',
        '$.routeSegments.features[0].properties.citationIds',
        '$.events[0].citationIds',
        '$.events[0].whyItMatters.citationIds',
      ]),
    )
  })

  it('以 UNSUPPORTED_ENUM 拒绝非法稳定枚举', () => {
    const dataset = createValidDataset()
    const input = {
      ...dataset,
      events: [
        {
          ...dataset.events[0],
          eventType: 'UNSUPPORTED',
        },
      ],
    }

    expect(validateMvpDataset(input)).toMatchObject({
      ok: false,
      errors: [
        expect.objectContaining({
          code: 'UNSUPPORTED_ENUM',
          path: '$.events[0].eventType',
        }),
      ],
    })
  })

  it('结构入口以 MISSING_CITATION 拒绝没有 Citation 的 Claim', () => {
    const dataset = createValidDataset()
    dataset.events[0]!.summary.citationIds = []

    expect(validateMvpDataset(dataset)).toMatchObject({
      ok: false,
      errors: [
        expect.objectContaining({
          code: 'MISSING_CITATION',
          path: '$.events[0].summary.citationIds',
        }),
      ],
    })
  })

  it('npm run validate:data 会对故意损坏的数据集返回失败状态', () => {
    const dataset = createValidDataset()
    dataset.events.push(createEvent(EVENT_ID, 2, 'second'))
    const temporaryDirectory = mkdtempSync(
      join(tmpdir(), 'history-map-mvp-integrity-'),
    )
    const invalidDatasetPath = join(temporaryDirectory, 'invalid.json')

    try {
      writeFileSync(invalidDatasetPath, JSON.stringify(dataset), 'utf8')

      const result = spawnSync(
        process.platform === 'win32' ? 'npm.cmd' : 'npm',
        ['run', 'validate:data', '--', invalidDatasetPath],
        {
          cwd: process.cwd(),
          encoding: 'utf8',
        },
      )
      const output = `${result.stdout}${result.stderr}`

      expect(result.status).toBe(1)
      expect(output).toContain('DUPLICATE_ID')
      expect(output).toContain('数据校验失败')
    } finally {
      rmSync(temporaryDirectory, {
        recursive: true,
        force: true,
      })
    }
  })
})
