import { describe, expect, it } from 'vitest'

import { deriveMapState } from '../../src/domain/deriveMapState'
import type {
  Event,
  MvpDataset,
  RouteSegmentFeature,
  Side,
} from '../../src/domain/mvpTypes'

function makeEvent(
  id: string,
  sequence: number,
  relatedPlaceIds: string[] = [],
): Event {
  return {
    id,
    sequence,
    title: `测试事件 ${sequence}`,
    eventType: 'OTHER',
    dateLabel: `相对时间 ${sequence}`,
    normalizedDate: null,
    timePrecision: 'APPROXIMATE',
    certainty: 'UNKNOWN',
    summary: {
      claimId: `claim-summary-${id}`,
      text: '仅用于派生状态测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    whyItMatters: {
      claimId: `claim-importance-${id}`,
      text: '仅用于派生状态测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    relatedPlaceIds,
    actorLabels: [],
    citationIds: ['citation-test'],
  }
}

function makeRouteSegment(
  id: string,
  appearAtEventId: string,
  side: Side = 'YAN',
): RouteSegmentFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [110, 34],
        [111, 35],
      ],
    },
    properties: {
      id,
      routeId: `route-${side.toLowerCase()}`,
      routeName: '测试示意方向',
      segmentNo: 1,
      side,
      actionType: 'ADVANCE',
      appearAtEventId,
      fromPlaceId: null,
      toPlaceId: null,
      certainty: 'LOW',
      summary: {
        claimId: `claim-${id}`,
        text: '仅用于派生状态测试。',
        viewpointType: 'INFERENCE',
        certainty: 'LOW',
        citationIds: ['citation-test'],
      },
      citationIds: ['citation-test'],
    },
  }
}

const first = makeEvent('event-first', 1, ['place-pass'])
const second = makeEvent('event-second', 2, [
  'place-east',
  'place-pass',
  'place-pass',
])
const third = makeEvent('event-third', 3, ['place-west'])

const dataset: Pick<MvpDataset, 'events' | 'routeSegments'> = {
  events: [third, first, second],
  routeSegments: {
    type: 'FeatureCollection',
    features: [
      makeRouteSegment('route-yan-01', 'event-second'),
      makeRouteSegment('route-tang-01', 'event-third', 'TANG'),
      makeRouteSegment('route-unknown-01', 'event-unknown'),
    ],
  },
}

describe('deriveMapState', () => {
  it('按 appearAtEventId 的事件序号前进并标记本事件首现路线', () => {
    expect(deriveMapState(dataset, first.id, undefined)).toMatchObject({
      visibleRouteSegmentIds: [],
      activeRouteSegmentIds: [],
      relatedPlaceIds: ['place-pass'],
      currentEventId: first.id,
    })

    expect(deriveMapState(dataset, second.id, undefined)).toMatchObject({
      visibleRouteSegmentIds: ['route-yan-01'],
      activeRouteSegmentIds: ['route-yan-01'],
      relatedPlaceIds: ['place-east', 'place-pass'],
      currentEventId: second.id,
    })

    expect(deriveMapState(dataset, third.id, undefined)).toMatchObject({
      visibleRouteSegmentIds: ['route-yan-01', 'route-tang-01'],
      activeRouteSegmentIds: ['route-tang-01'],
      relatedPlaceIds: ['place-west'],
      currentEventId: third.id,
    })
  })

  it('从后续事件返回时立即移除未来路线段', () => {
    const laterState = deriveMapState(dataset, third.id, undefined)
    const previousState = deriveMapState(dataset, second.id, undefined)

    expect(laterState.visibleRouteSegmentIds).toContain('route-tang-01')
    expect(previousState.visibleRouteSegmentIds).toEqual(['route-yan-01'])
    expect(previousState.activeRouteSegmentIds).toEqual(['route-yan-01'])
  })

  it('未知事件不泄露路线或相关地点，但保留手动地点选择', () => {
    expect(
      deriveMapState(dataset, 'event-unknown', 'place-manual'),
    ).toEqual({
      visibleRouteSegmentIds: [],
      activeRouteSegmentIds: [],
      relatedPlaceIds: [],
      selectedPlaceId: 'place-manual',
      currentEventId: undefined,
    })
  })

  it('首次出现边界只由 sequence 决定，未知 appearAtEventId 始终不可见', () => {
    const state = deriveMapState(dataset, second.id, 'place-pass')

    expect(state.visibleRouteSegmentIds).toEqual(['route-yan-01'])
    expect(state.activeRouteSegmentIds).toEqual(['route-yan-01'])
    expect(state.visibleRouteSegmentIds).not.toContain('route-unknown-01')
    expect(state.selectedPlaceId).toBe('place-pass')
  })

  it('重复派生同一选择得到完全一致的状态且不修改数据集', () => {
    const eventsBefore = [...dataset.events]
    const firstResult = deriveMapState(dataset, second.id, 'place-east')
    const secondResult = deriveMapState(dataset, second.id, 'place-east')

    expect(secondResult).toEqual(firstResult)
    expect(dataset.events).toEqual(eventsBefore)
  })
})
