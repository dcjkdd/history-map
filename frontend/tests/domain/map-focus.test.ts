import { describe, expect, it } from 'vitest'

import {
  getCurrentEventFocusTarget,
  getPlaceFocusTarget,
} from '../../src/domain/mapFocus'
import type {
  Event,
  MvpDataset,
  PlaceFeature,
  RouteSegmentFeature,
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
      text: '仅用于定位纯函数测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    whyItMatters: {
      claimId: `claim-importance-${id}`,
      text: '仅用于定位纯函数测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    relatedPlaceIds,
    actorLabels: [],
    citationIds: ['citation-test'],
  }
}

function makePlace(id: string, coordinates: [number, number]): PlaceFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
    properties: {
      id,
      name: id,
      modernName: null,
      placeType: 'OTHER',
      summary: {
        claimId: `claim-summary-${id}`,
        text: '仅用于定位纯函数测试。',
        viewpointType: 'INFERENCE',
        certainty: 'UNKNOWN',
        citationIds: ['citation-test'],
      },
      strategicRole: {
        claimId: `claim-role-${id}`,
        text: '仅用于定位纯函数测试。',
        viewpointType: 'INFERENCE',
        certainty: 'UNKNOWN',
        citationIds: ['citation-test'],
      },
      certainty: 'UNKNOWN',
      coordinateNote: {
        claimId: `claim-coordinate-${id}`,
        text: '仅用于定位纯函数测试。',
        viewpointType: 'INFERENCE',
        certainty: 'UNKNOWN',
        citationIds: ['citation-test'],
      },
      citationIds: ['citation-test'],
    },
  }
}

function makeRoute(
  id: string,
  appearAtEventId: string,
  coordinates: [number, number][],
): RouteSegmentFeature {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates },
    properties: {
      id,
      routeId: 'route-test',
      routeName: '测试示意方向',
      segmentNo: 1,
      side: 'OTHER',
      actionType: 'ADVANCE',
      appearAtEventId,
      fromPlaceId: null,
      toPlaceId: null,
      certainty: 'LOW',
      summary: {
        claimId: `claim-${id}`,
        text: '仅用于定位纯函数测试。',
        viewpointType: 'INFERENCE',
        certainty: 'LOW',
        citationIds: ['citation-test'],
      },
      citationIds: ['citation-test'],
    },
  }
}

const firstEvent = makeEvent('event-first', 1, ['place-east'])
const secondEvent = makeEvent('event-second', 2, ['place-west'])
const noGeometryEvent = makeEvent('event-empty', 3, ['place-missing'])
const places: MvpDataset['places'] = {
  type: 'FeatureCollection',
  features: [
    makePlace('place-east', [111, 35]),
    makePlace('place-west', [109, 33]),
  ],
}
const dataset: Pick<MvpDataset, 'events' | 'places' | 'routeSegments'> = {
  events: [firstEvent, secondEvent, noGeometryEvent],
  places,
  routeSegments: {
    type: 'FeatureCollection',
    features: [
      makeRoute('route-visible', secondEvent.id, [
        [108, 34],
        [112, 36],
      ]),
      makeRoute('route-future', 'event-unknown', [
        [0, 0],
        [180, 80],
      ]),
    ],
  },
}

describe('MVP-09 map focus targets', () => {
  it('只有相关地点时返回单点定位目标', () => {
    expect(getCurrentEventFocusTarget(dataset, firstEvent.id)).toEqual({
      kind: 'point',
      center: [111, 35],
    })
  })

  it('合并相关地点与截至当前事件已可见路线，并排除未来路线', () => {
    expect(getCurrentEventFocusTarget(dataset, secondEvent.id)).toEqual({
      kind: 'bounds',
      bounds: [
        [108, 33],
        [112, 36],
      ],
    })
  })

  it('没有可解析几何或事件未知时不制造定位范围', () => {
    expect(
      getCurrentEventFocusTarget(
        {
          ...dataset,
          routeSegments: { type: 'FeatureCollection', features: [] },
        },
        noGeometryEvent.id,
      ),
    ).toBeNull()
    expect(getCurrentEventFocusTarget(dataset, 'event-unknown')).toBeNull()
    expect(getCurrentEventFocusTarget(dataset, undefined)).toBeNull()
  })

  it('按稳定地点 ID 返回单点，未知地点不移动地图', () => {
    expect(getPlaceFocusTarget(places, 'place-west')).toEqual({
      kind: 'point',
      center: [109, 33],
    })
    expect(getPlaceFocusTarget(places, 'place-unknown')).toBeNull()
  })
})
