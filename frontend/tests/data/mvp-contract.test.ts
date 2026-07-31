import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadMvpDataset } from '../../src/data/mvpRepository'
import {
  getCitationBundle,
  getEventById,
  getPlaceById,
} from '../../src/domain/mvpSelectors'
import {
  MVP_SCHEMA_VERSION,
  MvpDataError,
} from '../../src/domain/mvpTypes'
import type {
  MvpDataset,
  SourcedClaim,
} from '../../src/domain/mvpTypes'
import { validateMvpDataset } from '../../src/domain/mvpValidation'

const SYNTHETIC_SOURCE_ID = 'source-synthetic'
const SYNTHETIC_CITATION_ID = 'citation-synthetic'
const SYNTHETIC_PLACE_ID = 'place-synthetic'
const SYNTHETIC_EVENT_ID = 'event-synthetic'

function createClaim(claimId: string, text: string): SourcedClaim {
  return {
    claimId,
    text,
    viewpointType: 'FACT',
    certainty: 'HIGH',
    citationIds: [SYNTHETIC_CITATION_ID],
  }
}

function createValidDataset(): MvpDataset {
  return {
    schemaVersion: MVP_SCHEMA_VERSION,
    topic: {
      id: 'topic-synthetic',
      title: '合同测试专题',
      subtitle: '不包含历史事实的合成数据',
      summary: '该数据只验证 MVP-01 合同，不作为历史内容发布。',
      initialView: {
        center: [0, 0],
        zoom: 3,
      },
      defaultEventId: SYNTHETIC_EVENT_ID,
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
            id: SYNTHETIC_PLACE_ID,
            name: '合成地点',
            modernName: null,
            placeType: 'OTHER',
            summary: createClaim('claim-place-summary', '合成地点说明'),
            strategicRole: createClaim(
              'claim-place-role',
              '合成地点作用说明',
            ),
            certainty: 'HIGH',
            coordinateNote: createClaim(
              'claim-place-coordinate',
              '测试坐标，不表示真实地点',
            ),
            citationIds: [SYNTHETIC_CITATION_ID],
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
            citationIds: [SYNTHETIC_CITATION_ID],
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
            appearAtEventId: SYNTHETIC_EVENT_ID,
            fromPlaceId: SYNTHETIC_PLACE_ID,
            toPlaceId: null,
            certainty: 'HIGH',
            summary: createClaim(
              'claim-route-summary',
              '合成路线分段说明',
            ),
            citationIds: [SYNTHETIC_CITATION_ID],
          },
        },
      ],
    },
    events: [
      {
        id: SYNTHETIC_EVENT_ID,
        sequence: 1,
        title: '合成事件',
        eventType: 'OTHER',
        dateLabel: '测试时间',
        normalizedDate: null,
        timePrecision: 'APPROXIMATE',
        certainty: 'HIGH',
        summary: createClaim('claim-event-summary', '合成事件说明'),
        whyItMatters: createClaim(
          'claim-event-importance',
          '合成事件作用说明',
        ),
        relatedPlaceIds: [SYNTHETIC_PLACE_ID],
        actorLabels: ['测试参与者'],
        citationIds: [SYNTHETIC_CITATION_ID],
      },
    ],
    sources: [
      {
        id: SYNTHETIC_SOURCE_ID,
        title: '合同测试资料',
        author: null,
        edition: null,
        publisher: null,
        publishYear: null,
        sourceType: 'TEST',
        provenance: {
          url: null,
          accessDate: null,
          licenseName: null,
          licenseUrl: null,
          attribution: null,
          usageRestrictions: '仅用于自动测试',
          dataVersion: '1',
          originalCrs: 'EPSG:4326',
          coverage: '合成坐标',
          processingNotes: '无处理',
          outputId: 'fixture-v1',
        },
      },
    ],
    citations: [
      {
        id: SYNTHETIC_CITATION_ID,
        sourceId: SYNTHETIC_SOURCE_ID,
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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('MVP 数据合同', () => {
  it('接受完整的 1.0 合成数据集', () => {
    const result = validateMvpDataset(createValidDataset())

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.topic.defaultEventId).toBe(SYNTHETIC_EVENT_ID)
    }
  })

  it('接受不包含历史内容的完全空技术数据集', () => {
    const raw = createValidDataset()
    raw.topic.defaultEventId = null
    raw.places.features = []
    raw.geography.features = []
    raw.routeSegments.features = []
    raw.events = []
    raw.sources = []
    raw.citations = []

    const result = validateMvpDataset(raw)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.events).toEqual([])
      expect(result.data.topic.defaultEventId).toBeNull()
    }
  })

  it('拒绝不支持的 schemaVersion 并给出字段路径', () => {
    const input = {
      ...createValidDataset(),
      schemaVersion: '2.0',
    }

    const result = validateMvpDataset(input)

    expect(result).toMatchObject({
      ok: false,
      errors: [
        {
          code: 'UNSUPPORTED_SCHEMA_VERSION',
          path: '$.schemaVersion',
        },
      ],
    })
  })

  it('拒绝缺少顶层字段的数据集', () => {
    const input: Record<string, unknown> = {
      ...createValidDataset(),
    }
    delete input.events

    const result = validateMvpDataset(input)

    expect(result).toMatchObject({
      ok: false,
      errors: [
        expect.objectContaining({
          path: '$.events',
        }),
      ],
    })
  })

  it('拒绝错误的地点几何结构', () => {
    const dataset = createValidDataset()
    const input = {
      ...dataset,
      places: {
        ...dataset.places,
        features: [
          {
            ...dataset.places.features[0],
            geometry: {
              type: 'Point',
              coordinates: [0],
            },
          },
        ],
      },
    }

    const result = validateMvpDataset(input)

    expect(result).toMatchObject({
      ok: false,
      errors: [
        expect.objectContaining({
          path: '$.places.features[0].geometry.coordinates',
        }),
      ],
    })
  })

  it('拒绝没有逐条 Citation 绑定的展示结论', () => {
    const dataset = createValidDataset()
    const input = {
      ...dataset,
      events: [
        {
          ...dataset.events[0],
          summary: {
            ...dataset.events[0]?.summary,
            citationIds: [],
          },
        },
      ],
    }

    const result = validateMvpDataset(input)

    expect(result).toMatchObject({
      ok: false,
      errors: [
        expect.objectContaining({
          path: '$.events[0].summary.citationIds',
        }),
      ],
    })
  })

  it('拒绝可绕过数组元素校验的稀疏输入', () => {
    const sparseEvents = new Array(1)
    const input = {
      ...createValidDataset(),
      events: sparseEvents,
    }

    const result = validateMvpDataset(input)

    expect(result).toMatchObject({
      ok: false,
      errors: [
        expect.objectContaining({
          path: '$.events[0]',
        }),
      ],
    })
  })

  it('接受 Geography Polygon 几何', () => {
    const dataset = createValidDataset()
    const input = {
      ...dataset,
      geography: {
        ...dataset.geography,
        features: [
          {
            ...dataset.geography.features[0],
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
          },
        ],
      },
    }

    expect(validateMvpDataset(input).ok).toBe(true)
  })
})

describe('MVP Repository', () => {
  it('通过唯一静态 URL 加载并返回已校验数据', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(createValidDataset()), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const dataset = await loadMvpDataset()

    expect(dataset.schemaVersion).toBe(MVP_SCHEMA_VERSION)
    expect(fetchMock).toHaveBeenCalledWith('/data/anshi/mvp-v1.json', {
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('把网络失败转换为 MvpDataError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('synthetic network failure')),
    )

    await expect(loadMvpDataset()).rejects.toMatchObject({
      name: 'MvpDataError',
      code: 'NETWORK_ERROR',
      path: '$',
    })
  })

  it('把非成功 HTTP 状态转换为 MvpDataError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 404 })),
    )

    await expect(loadMvpDataset()).rejects.toMatchObject({
      code: 'HTTP_ERROR',
      details: expect.objectContaining({
        status: 404,
      }),
    })
  })

  it('把非法 JSON 转换为 MvpDataError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('{invalid-json', {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ),
    )

    await expect(loadMvpDataset()).rejects.toMatchObject({
      code: 'INVALID_JSON',
    })
  })

  it('把成功响应后的响应体读取失败归类为网络错误', async () => {
    const response = new Response('{}', { status: 200 })
    vi.spyOn(response, 'text').mockRejectedValue(
      new TypeError('synthetic body read failure'),
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))

    await expect(loadMvpDataset()).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: '读取 MVP 数据响应体失败',
    })
  })

  it('保留运行时校验的版本错误', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ...createValidDataset(),
            schemaVersion: '2.0',
          }),
          { status: 200 },
        ),
      ),
    )

    await expect(loadMvpDataset()).rejects.toEqual(
      expect.objectContaining({
        code: 'UNSUPPORTED_SCHEMA_VERSION',
        path: '$.schemaVersion',
      }),
    )
  })

  it('结构错误包含统一类型、首个路径和完整错误列表', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 200 })),
    )

    await expect(loadMvpDataset()).rejects.toMatchObject({
      name: 'MvpDataError',
      code: 'INVALID_DATASET',
      path: '$.schemaVersion',
      details: expect.arrayContaining([
        expect.objectContaining({
          path: '$.schemaVersion',
        }),
        expect.objectContaining({
          path: '$.topic',
        }),
      ]),
    })
  })
})

describe('MVP selectors', () => {
  it('按稳定 ID 查询 Event 和 Place', () => {
    const dataset = createValidDataset()

    expect(getEventById(dataset, SYNTHETIC_EVENT_ID)?.title).toBe('合成事件')
    expect(
      getPlaceById(dataset, SYNTHETIC_PLACE_ID)?.properties.name,
    ).toBe('合成地点')
    expect(getEventById(dataset, 'missing')).toBeUndefined()
    expect(getPlaceById(dataset, 'missing')).toBeUndefined()
  })

  it('按请求顺序组合 Citation 与 Source 并保留重复项', () => {
    const dataset = createValidDataset()

    const bundles = getCitationBundle(dataset, [
      SYNTHETIC_CITATION_ID,
      SYNTHETIC_CITATION_ID,
    ])

    expect(bundles).toHaveLength(2)
    expect(bundles[0]?.citation.id).toBe(SYNTHETIC_CITATION_ID)
    expect(bundles[0]?.source.id).toBe(SYNTHETIC_SOURCE_ID)
    expect(bundles[1]?.citation.id).toBe(SYNTHETIC_CITATION_ID)
  })

  it('Citation ID 缺失时抛出带 ID 和路径的错误', () => {
    const dataset = createValidDataset()

    expect(() => getCitationBundle(dataset, ['missing'])).toThrow(MvpDataError)
    expect(() => getCitationBundle(dataset, ['missing'])).toThrow(
      '无法解析 Citation：missing',
    )

    try {
      getCitationBundle(dataset, ['missing'])
    } catch (error) {
      expect(error).toMatchObject({
        code: 'INVALID_DATASET',
        path: '$.citations',
        details: {
          citationId: 'missing',
        },
      })
    }
  })

  it('Citation 的 Source 缺失时抛出带引用路径的错误', () => {
    const dataset = {
      ...createValidDataset(),
      sources: [],
    }

    expect(() =>
      getCitationBundle(dataset, [SYNTHETIC_CITATION_ID]),
    ).toThrow(MvpDataError)

    try {
      getCitationBundle(dataset, [SYNTHETIC_CITATION_ID])
    } catch (error) {
      expect(error).toMatchObject({
        code: 'INVALID_DATASET',
        path: `$.citations[id="${SYNTHETIC_CITATION_ID}"].sourceId`,
        details: {
          citationId: SYNTHETIC_CITATION_ID,
          sourceId: SYNTHETIC_SOURCE_ID,
        },
      })
    }
  })
})
