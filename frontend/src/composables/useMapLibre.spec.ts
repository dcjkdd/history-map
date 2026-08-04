import { createPinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import HistoryMap from '../components/map/HistoryMap.vue'
import type { Event, InitialView, MvpDataset } from '../domain/mvpTypes'
import { GEOGRAPHY_LAYER_IDS } from '../map/layers/geographyLayer'
import {
  MILITARY_GEOGRAPHY_LAYER_IDS,
} from '../map/layers/militaryGeographyLayer'
import { PLACE_LAYER_IDS } from '../map/layers/placeLayer'
import { ROUTE_LAYER_IDS } from '../map/layers/routeLayer'
import {
  TERRAIN_LAYER_IDS,
  TERRAIN_SOURCE_IDS,
} from '../map/layers/terrainLayer'
import { useMvpStore } from '../stores/mvpStore'
import {
  EMPTY_MAP_STYLE_URL,
  resolveEmptyMapStyleUrl,
  useMapLibre,
} from './useMapLibre'

const maplibreMock = vi.hoisted(() => {
  const instances: any[] = []

  class MockMap {
    readonly options: Record<string, unknown>
    readonly listeners: Record<string, Array<(event: any) => void>> = {}
    readonly sources = new Map<string, unknown>()
    readonly layers = new Map<string, unknown>()
    readonly fitBounds = vi.fn()
    readonly easeTo = vi.fn()
    readonly getZoom = vi.fn(() => 6.5)
    readonly jumpTo = vi.fn()
    readonly remove = vi.fn()
    readonly setFilter = vi.fn()
    readonly setLayoutProperty = vi.fn()
    readonly queryRenderedFeatures = vi.fn(
      (): Array<{ properties: Record<string, unknown> }> => [],
    )
    readonly addSource = vi.fn((id: string, source: unknown) => {
      this.sources.set(id, source)
    })
    readonly addLayer = vi.fn((layer: { id: string }) => {
      this.layers.set(layer.id, layer)
    })
    readonly addControl = vi.fn()
    private styleLoaded = false

    constructor(options: Record<string, unknown>) {
      this.options = options
      instances.push(this)
    }

    on(type: string, listener: (event: any) => void): this {
      this.listeners[type] ??= []
      this.listeners[type].push(listener)
      return this
    }

    off(type: string, listener: (event: any) => void): this {
      this.listeners[type] = (this.listeners[type] ?? []).filter(
        (candidate) => candidate !== listener,
      )
      return this
    }

    emit(type: string, event: Record<string, unknown> = {}): void {
      if (type === 'style.load') {
        this.styleLoaded = true
      }

      for (const listener of this.listeners[type] ?? []) {
        listener(event)
      }
    }

    getSource(id: string): unknown {
      return this.sources.get(id)
    }

    getLayer(id: string): unknown {
      return this.layers.get(id)
    }

    isStyleLoaded(): boolean {
      return this.styleLoaded
    }

    setStyle = vi.fn(() => {
      this.styleLoaded = false
      this.sources.clear()
      this.layers.clear()
    })
  }

  class MockNavigationControl {
    constructor(readonly options: Record<string, unknown>) {}
  }

  class MockScaleControl {
    constructor(readonly options: Record<string, unknown>) {}
  }

  return { instances, MockMap, MockNavigationControl, MockScaleControl }
})

vi.mock('maplibre-gl', () => ({
  Map: maplibreMock.MockMap,
  NavigationControl: maplibreMock.MockNavigationControl,
  ScaleControl: maplibreMock.MockScaleControl,
  setWorkerUrl: vi.fn(),
}))

const centerView: InitialView = {
  center: [110.7, 34.6],
  zoom: 6.5,
}

const emptyGeography = { type: 'FeatureCollection' as const, features: [] }
const emptyPlaces = { type: 'FeatureCollection' as const, features: [] }
const emptyRouteSegments = { type: 'FeatureCollection' as const, features: [] }
const emptyEvents: Event[] = []
const emptyHistoryMapProps = {
  events: emptyEvents,
  geography: emptyGeography,
  initialView: centerView,
  places: emptyPlaces,
  routeSegments: emptyRouteSegments,
}
const historySourceCount = 5 + TERRAIN_SOURCE_IDS.length
const historyLayerCount =
  GEOGRAPHY_LAYER_IDS.length +
  MILITARY_GEOGRAPHY_LAYER_IDS.length +
  PLACE_LAYER_IDS.length +
  ROUTE_LAYER_IDS.length +
  TERRAIN_LAYER_IDS.length

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
      text: '仅用于地图组件测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    whyItMatters: {
      claimId: `claim-importance-${id}`,
      text: '仅用于地图组件测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    relatedPlaceIds,
    actorLabels: [],
    citationIds: ['citation-test'],
  }
}

const firstEvent = makeEvent('event-first', 1, ['place-tongguan'])
const secondEvent = makeEvent('event-second', 2, ['place-lingbao'])
const routeEvents = [firstEvent, secondEvent]
const focusPlaces: MvpDataset['places'] = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [110.25, 34.5] },
      properties: {
        id: 'place-tongguan',
        name: '测试潼关',
        modernName: null,
        placeType: 'PASS',
        summary: {
          claimId: 'claim-place-tongguan-summary',
          text: '仅用于地图定位测试。',
          viewpointType: 'INFERENCE',
          certainty: 'UNKNOWN',
          citationIds: ['citation-test'],
        },
        strategicRole: {
          claimId: 'claim-place-tongguan-role',
          text: '仅用于地图定位测试。',
          viewpointType: 'INFERENCE',
          certainty: 'UNKNOWN',
          citationIds: ['citation-test'],
        },
        certainty: 'UNKNOWN',
        coordinateNote: {
          claimId: 'claim-place-tongguan-coordinate',
          text: '仅用于地图定位测试。',
          viewpointType: 'INFERENCE',
          certainty: 'UNKNOWN',
          citationIds: ['citation-test'],
        },
        citationIds: ['citation-test'],
      },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [111.25, 35.5] },
      properties: {
        id: 'place-lingbao',
        name: '测试灵宝',
        modernName: null,
        placeType: 'OTHER',
        summary: {
          claimId: 'claim-place-lingbao-summary',
          text: '仅用于地图定位测试。',
          viewpointType: 'INFERENCE',
          certainty: 'UNKNOWN',
          citationIds: ['citation-test'],
        },
        strategicRole: {
          claimId: 'claim-place-lingbao-role',
          text: '仅用于地图定位测试。',
          viewpointType: 'INFERENCE',
          certainty: 'UNKNOWN',
          citationIds: ['citation-test'],
        },
        certainty: 'UNKNOWN',
        coordinateNote: {
          claimId: 'claim-place-lingbao-coordinate',
          text: '仅用于地图定位测试。',
          viewpointType: 'INFERENCE',
          certainty: 'UNKNOWN',
          citationIds: ['citation-test'],
        },
        citationIds: ['citation-test'],
      },
    },
  ],
}
const routeSegments: MvpDataset['routeSegments'] = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [110, 34],
          [111, 35],
        ],
      },
      properties: {
        id: 'route-tang-01',
        routeId: 'route-tang',
        routeName: '测试唐军示意方向',
        segmentNo: 1,
        side: 'TANG',
        actionType: 'ADVANCE',
        appearAtEventId: secondEvent.id,
        fromPlaceId: 'place-tongguan',
        toPlaceId: 'place-lingbao',
        certainty: 'LOW',
        summary: {
          claimId: 'claim-route-tang-01',
          text: '仅用于地图组件测试。',
          viewpointType: 'INFERENCE',
          certainty: 'LOW',
          citationIds: ['citation-test'],
        },
        citationIds: ['citation-test'],
      },
    },
  ],
}

describe('useMapLibre', () => {
  beforeEach(() => {
    maplibreMock.instances.length = 0
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('使用数据集视野创建单一地图实例并可复位专题视野', () => {
    const { createMap, fitToTopic } = useMapLibre({
      styleUrl: 'https://maps.example.test/style.json',
    })
    const container = document.createElement('div')

    const firstHandle = createMap(container, centerView)
    const secondHandle = createMap(container, centerView)
    const instance = maplibreMock.instances[0]

    expect(maplibreMock.instances).toHaveLength(1)
    expect(secondHandle).toBe(firstHandle)
    expect(instance.options).toMatchObject({
      attributionControl: { compact: true },
      bearing: 0,
      center: centerView.center,
      container,
      localIdeographFontFamily: 'PingFang SC, system-ui, sans-serif',
      pitch: 0,
      style: 'https://maps.example.test/style.json',
      zoom: centerView.zoom,
    })
    expect(instance.addControl).toHaveBeenCalledTimes(2)
    expect(instance.addControl.mock.calls.map((call: unknown[]) => call[1])).toEqual([
      'top-left',
      'bottom-left',
    ])

    fitToTopic()

    expect(instance.jumpTo).toHaveBeenCalledWith({
      center: centerView.center,
      zoom: centerView.zoom,
    })
  })

  it('应用数据集 bounds 和 maxBounds，并按 bounds 复位视野', () => {
    const boundedView: InitialView = {
      center: [110.7, 34.6],
      zoom: 6.5,
      bounds: [
        [108.5, 33.8],
        [112.8, 35.2],
      ],
      maxBounds: [
        [106, 31],
        [115, 38],
      ],
    }
    const { createMap, fitToTopic } = useMapLibre({ styleUrl: null })

    createMap(document.createElement('div'), boundedView)
    const instance = maplibreMock.instances[0]

    expect(instance.options).toMatchObject({
      bounds: boundedView.bounds,
      maxBounds: boundedView.maxBounds,
      fitBoundsOptions: {
        duration: 0,
        padding: 32,
      },
    })

    fitToTopic()

    expect(instance.fitBounds).toHaveBeenCalledWith(boundedView.bounds, {
      duration: 0,
      padding: 32,
    })
    expect(instance.jumpTo).not.toHaveBeenCalled()
  })

  it('未配置外部样式时直接使用本地空白样式', () => {
    const { createMap, isUsingFallbackStyle, mapStyleWarning } = useMapLibre({
      styleUrl: '   ',
    })

    createMap(document.createElement('div'), centerView)

    expect(maplibreMock.instances[0].options.style).toBe(EMPTY_MAP_STYLE_URL)
    expect(isUsingFallbackStyle.value).toBe(true)
    expect(mapStyleWarning.value).toBeNull()
  })

  it('按 Vite base 解析本地空白样式路径', () => {
    expect(resolveEmptyMapStyleUrl('/history-map/')).toBe(
      '/history-map/map/empty-style.json',
    )
    expect(resolveEmptyMapStyleUrl('/history-map')).toBe(
      '/history-map/map/empty-style.json',
    )
  })

  it('外部样式加载失败时只切换一次本地样式且不中断地图', () => {
    const {
      createMap,
      isUsingFallbackStyle,
      mapStyleState,
      mapStyleWarning,
    } = useMapLibre({ styleUrl: 'https://maps.example.test/broken.json' })

    createMap(document.createElement('div'), centerView)
    const instance = maplibreMock.instances[0]

    instance.emit('error', {
      error: {
        message: 'HTTP 503',
        url: 'https://maps.example.test/broken.json',
      },
    })

    expect(instance.setStyle).toHaveBeenCalledTimes(1)
    expect(instance.setStyle).toHaveBeenCalledWith(EMPTY_MAP_STYLE_URL, {
      diff: false,
    })
    expect(isUsingFallbackStyle.value).toBe(true)
    expect(mapStyleState.value).toBe('loading')
    expect(mapStyleWarning.value).toContain('已切换为本地中性背景')

    instance.emit('style.load')

    expect(mapStyleState.value).toBe('ready')
  })

  it('外部样式加载期间的局部资源错误只提示而不替换根样式', () => {
    const { createMap, mapStyleState, mapStyleWarning } = useMapLibre({
      styleUrl: 'https://maps.example.test/style.json',
    })

    createMap(document.createElement('div'), centerView)
    const instance = maplibreMock.instances[0]

    instance.emit('error', {
      error: {
        message: 'sprite unavailable',
        url: 'https://cdn.example.test/sprite.json',
      },
      sourceId: 'background-source',
    })

    expect(instance.setStyle).not.toHaveBeenCalled()
    expect(mapStyleState.value).toBe('loading')
    expect(mapStyleWarning.value).toContain('部分资源不可用')

    instance.emit('style.load')

    expect(mapStyleState.value).toBe('ready')
  })

  it('本地降级样式无法加载时进入可交互的 degraded 终态', () => {
    const { createMap, mapStyleState, mapStyleWarning } = useMapLibre({
      styleUrl: null,
    })

    createMap(document.createElement('div'), centerView)
    const instance = maplibreMock.instances[0]

    instance.emit('error', {
      error: {
        message: 'HTTP 404',
        url: EMPTY_MAP_STYLE_URL,
      },
    })

    expect(mapStyleState.value).toBe('degraded')
    expect(instance.setStyle).not.toHaveBeenCalled()
    expect(mapStyleWarning.value).toContain('本地降级底图未能加载')
  })

  it('外部样式已加载后的局部资源错误只提示而不替换样式', () => {
    const { createMap, mapStyleState, mapStyleWarning } = useMapLibre({
      styleUrl: 'https://maps.example.test/style.json',
    })

    createMap(document.createElement('div'), centerView)
    const instance = maplibreMock.instances[0]

    instance.emit('style.load')
    instance.emit('error', { error: new Error('tile unavailable') })

    expect(mapStyleState.value).toBe('ready')
    expect(instance.setStyle).not.toHaveBeenCalled()
    expect(mapStyleWarning.value).toContain('部分资源不可用')
  })

  it('销毁时解绑监听器、移除实例并允许安全重复调用', () => {
    const { createMap, destroyMap, map } = useMapLibre({ styleUrl: null })

    createMap(document.createElement('div'), centerView)
    const instance = maplibreMock.instances[0]

    destroyMap()
    destroyMap()

    expect(instance.listeners['style.load']).toHaveLength(0)
    expect(instance.listeners.error).toHaveLength(0)
    expect(instance.remove).toHaveBeenCalledTimes(1)
    expect(map.value).toBeNull()
  })

  it('HistoryMap 挂载时创建地图，样式就绪后移除加载提示，卸载时清理', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(HistoryMap, emptyHistoryMapProps)

    app.use(createPinia()).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]

    expect(maplibreMock.instances).toHaveLength(1)
    expect(host.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(host.textContent).toContain('地形加载中')

    instance.emit('style.load')
    instance.emit('idle')
    await nextTick()

    expect(host.querySelector('[aria-busy="false"]')).not.toBeNull()
    expect(host.textContent).toContain('地形已加载')
    expect(instance.addSource).toHaveBeenCalledTimes(historySourceCount)
    expect(instance.addLayer).toHaveBeenCalledTimes(historyLayerCount)

    instance.emit('style.load')

    expect(instance.addSource).toHaveBeenCalledTimes(historySourceCount)
    expect(instance.addLayer).toHaveBeenCalledTimes(historyLayerCount)

    instance.sources.clear()
    instance.layers.clear()
    instance.emit('style.load')

    expect(instance.addSource).toHaveBeenCalledTimes(historySourceCount * 2)
    expect(instance.addLayer).toHaveBeenCalledTimes(historyLayerCount * 2)

    app.unmount()

    expect(instance.remove).toHaveBeenCalledTimes(1)
    expect(instance.listeners['style.load']).toHaveLength(0)
    expect(instance.listeners.click).toHaveLength(0)
    host.remove()
  })

  it('HistoryMap 将图层开关和地点点击同步到地图与 store', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const pinia = createPinia()
    const app = createApp(HistoryMap, emptyHistoryMapProps)

    app.use(pinia).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]
    const store = useMvpStore(pinia)

    instance.emit('style.load')
    await nextTick()

    const hydrographyToggle = host.querySelector<HTMLInputElement>(
      '.layer-control input[data-layer-group="hydrography"]',
    )
    const geographyToggle = host.querySelector<HTMLInputElement>(
      '.layer-control input[data-layer-group="geography"]',
    )
    hydrographyToggle?.dispatchEvent(new Event('change'))
    geographyToggle?.dispatchEvent(new Event('change'))
    await nextTick()

    expect(store.layerVisibility.hydrography).toBe(false)
    expect(store.layerVisibility.geography).toBe(false)
    expect(instance.setLayoutProperty).toHaveBeenCalledWith(
      'mvp-geography-river',
      'visibility',
      'none',
    )
    expect(instance.setLayoutProperty).toHaveBeenCalledWith(
      'phase2-east-guanzhong-corridor-band',
      'visibility',
      'none',
    )

    instance.queryRenderedFeatures.mockReturnValue([
      { properties: { id: 'place-tongguan' } },
    ])
    instance.emit('click', { point: { x: 10, y: 10 } })
    await nextTick()

    expect(store.selectedPlaceId).toBe('place-tongguan')
    expect(instance.setFilter).toHaveBeenCalledWith('mvp-places-selected', [
      '==',
      ['get', 'id'],
      'place-tongguan',
    ])
    expect(host.querySelector('[data-map-note="tongguan"]')?.textContent).toContain(
      '进入关中的关键防御节点',
    )
    expect(host.querySelector('[data-map-note="tongguan"]')?.textContent).toContain(
      '唐代关城位置仍有争议',
    )

    instance.sources.clear()
    instance.layers.clear()
    instance.emit('style.load')

    expect(instance.setLayoutProperty).toHaveBeenCalledWith(
      'mvp-places-selected',
      'visibility',
      'visible',
    )
    expect(instance.setFilter).toHaveBeenLastCalledWith(
      'mvp-places-selected',
      ['==', ['get', 'id'], 'place-tongguan'],
    )

    app.unmount()
    host.remove()
  })

  it('HistoryMap 在路线关闭时仍随事件前进/后退更新派生过滤状态', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const pinia = createPinia()
    const store = useMvpStore(pinia)
    store.initializeTimeline(routeEvents, firstEvent.id)
    store.toggleLayer('routes')
    const app = createApp(HistoryMap, {
      ...emptyHistoryMapProps,
      events: routeEvents,
      routeSegments,
    })

    app.use(pinia).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]
    instance.emit('style.load')
    await nextTick()

    expect(instance.setLayoutProperty).toHaveBeenCalledWith(
      'mvp-routes-tang',
      'visibility',
      'none',
    )
    expect(instance.setFilter).toHaveBeenCalledWith('mvp-routes-tang', [
      'all',
      ['==', ['get', 'side'], 'TANG'],
      ['in', ['get', 'id'], ['literal', []]],
    ])

    store.selectNextEvent()
    await nextTick()

    expect(store.selectedEventId).toBe(secondEvent.id)
    expect(instance.setFilter).toHaveBeenCalledWith(
      'mvp-routes-tang-active',
      [
        'all',
        ['==', ['get', 'side'], 'TANG'],
        ['in', ['get', 'id'], ['literal', ['route-tang-01']]],
      ],
    )
    expect(instance.setFilter).toHaveBeenCalledWith('mvp-places-related', [
      'in',
      ['get', 'id'],
      ['literal', ['place-lingbao']],
    ])

    store.selectPreviousEvent()
    await nextTick()

    expect(store.selectedEventId).toBe(firstEvent.id)
    expect(instance.setFilter).toHaveBeenLastCalledWith(
      'mvp-places-selected',
      ['==', ['get', 'id'], ''],
    )
    expect(instance.setFilter).toHaveBeenCalledWith('mvp-routes-tang', [
      'all',
      ['==', ['get', 'side'], 'TANG'],
      ['in', ['get', 'id'], ['literal', []]],
    ])

    app.unmount()
    host.remove()
  })

  it('HistoryMap 在外部根样式失败后的 style.load 恢复图层、可见性和选择', async () => {
    vi.stubEnv(
      'VITE_MAP_STYLE_URL',
      'https://maps.example.test/broken-style.json',
    )
    const host = document.createElement('div')
    document.body.append(host)
    const pinia = createPinia()
    const store = useMvpStore(pinia)
    store.toggleLayer('hydrography')
    store.toggleLayer('geography')
    store.toggleLayer('routes')
    store.initializeTimeline(routeEvents, secondEvent.id)
    store.selectPlace('place-tongguan')
    const app = createApp(HistoryMap, {
      ...emptyHistoryMapProps,
      events: routeEvents,
      routeSegments,
    })

    app.use(pinia).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]

    expect(instance.listeners['style.load']).toHaveLength(2)
    expect(instance.listeners.error).toHaveLength(2)
    expect(instance.listeners.click).toHaveLength(1)
    expect(instance.listeners.idle).toHaveLength(1)

    instance.emit('error', {
      error: {
        message: 'HTTP 503',
        url: 'https://maps.example.test/broken-style.json',
      },
    })

    expect(instance.setStyle).toHaveBeenCalledTimes(1)
    expect(instance.addSource).not.toHaveBeenCalled()

    instance.emit('style.load')
    await nextTick()

    expect(instance.addSource).toHaveBeenCalledTimes(historySourceCount)
    expect(instance.addLayer).toHaveBeenCalledTimes(historyLayerCount)
    for (const layerId of GEOGRAPHY_LAYER_IDS) {
      expect(instance.setLayoutProperty).toHaveBeenCalledWith(
        layerId,
        'visibility',
        'none',
      )
    }
    for (const layerId of MILITARY_GEOGRAPHY_LAYER_IDS) {
      expect(instance.setLayoutProperty).toHaveBeenCalledWith(
        layerId,
        'visibility',
        'none',
      )
    }
    expect(instance.setFilter).toHaveBeenCalledWith('mvp-places-selected', [
      '==',
      ['get', 'id'],
      'place-tongguan',
    ])
    expect(instance.setLayoutProperty).toHaveBeenCalledWith(
      'mvp-routes-tang',
      'visibility',
      'none',
    )
    expect(instance.setFilter).toHaveBeenCalledWith(
      'mvp-routes-tang-active',
      [
        'all',
        ['==', ['get', 'side'], 'TANG'],
        ['in', ['get', 'id'], ['literal', ['route-tang-01']]],
      ],
    )
    expect(instance.setFilter).toHaveBeenCalledWith('mvp-places-related', [
      'in',
      ['get', 'id'],
      ['literal', ['place-lingbao']],
    ])
    expect(store.selectedEventId).toBe(secondEvent.id)
    expect(store.selectedPlaceId).toBe('place-tongguan')

    instance.emit('style.load')

    expect(instance.addSource).toHaveBeenCalledTimes(historySourceCount)
    expect(instance.addLayer).toHaveBeenCalledTimes(historyLayerCount)
    expect(instance.listeners['style.load']).toHaveLength(2)
    expect(instance.listeners.error).toHaveLength(2)
    expect(instance.listeners.click).toHaveLength(1)
    expect(instance.listeners.idle).toHaveLength(1)

    app.unmount()

    expect(instance.listeners['style.load']).toHaveLength(0)
    expect(instance.listeners.error).toHaveLength(0)
    expect(instance.listeners.click).toHaveLength(0)
    expect(instance.listeners.idle).toHaveLength(0)
    host.remove()
  })

  it('HistoryMap 在本地样式失败后结束忙碌态并保留可读告警', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(HistoryMap, emptyHistoryMapProps)

    app.use(createPinia()).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]

    instance.emit('error', {
      error: {
        message: 'HTTP 404',
        url: EMPTY_MAP_STYLE_URL,
      },
    })
    await nextTick()

    expect(host.querySelector('[aria-busy="false"]')).not.toBeNull()
    expect(host.textContent).not.toContain('地图底图加载中')
    expect(host.textContent).toContain('本地降级底图未能加载')

    app.unmount()
    host.remove()
  })

  it('地形失败时保留历史图层，并可经 setStyle -> style.load 幂等恢复状态', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const pinia = createPinia()
    const store = useMvpStore(pinia)
    store.toggleLayer('routes')
    store.selectPlace('place-tongguan')
    const app = createApp(HistoryMap, emptyHistoryMapProps)

    app.use(pinia).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]

    instance.emit('style.load')
    instance.emit('idle')
    await nextTick()
    expect(host.querySelector('[data-terrain-status="ready"]')).not.toBeNull()

    instance.emit('error', {
      sourceId: 'phase2-terrain-dem',
      error: {
        message: 'terrain tile HTTP 404',
        url: '/terrain/phase2-02/terrain/8/205/101.png',
      },
    })
    await nextTick()

    expect(host.querySelector('[data-terrain-status="degraded"]')).not.toBeNull()
    expect(host.textContent).toContain('历史地点、路线与事件仍可阅读')
    expect(instance.layers.has('mvp-places-city')).toBe(true)
    expect(instance.layers.has('mvp-routes-tang')).toBe(true)

    host.querySelector<HTMLButtonElement>('.history-map__terrain-degraded button')?.click()
    expect(instance.setStyle).toHaveBeenCalledWith(EMPTY_MAP_STYLE_URL, { diff: false })

    instance.emit('style.load')
    instance.emit('idle')
    await nextTick()

    expect(host.querySelector('[data-terrain-status="ready"]')).not.toBeNull()
    expect(maplibreMock.instances).toHaveLength(1)
    expect(instance.addSource).toHaveBeenCalledTimes(historySourceCount * 2)
    expect(instance.addLayer).toHaveBeenCalledTimes(historyLayerCount * 2)
    expect(instance.setLayoutProperty).toHaveBeenCalledWith(
      'mvp-routes-tang',
      'visibility',
      'none',
    )
    expect(instance.setFilter).toHaveBeenCalledWith('mvp-places-selected', [
      '==',
      ['get', 'id'],
      'place-tongguan',
    ])
    expect(instance.listeners['style.load']).toHaveLength(2)
    expect(instance.listeners.error).toHaveLength(2)
    expect(instance.listeners.idle).toHaveLength(1)

    app.unmount()
    host.remove()
  })

  it('只在用户主动触发时定位当前事件，时间轴切换不会自动移动地图', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const pinia = createPinia()
    const store = useMvpStore(pinia)
    store.initializeTimeline(routeEvents, firstEvent.id)
    const app = createApp(HistoryMap, {
      ...emptyHistoryMapProps,
      events: routeEvents,
      places: focusPlaces,
      routeSegments,
    })

    app.use(pinia).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]
    const focusButton = host.querySelector<HTMLButtonElement>(
      '[aria-label="定位当前事件"]',
    )

    expect(focusButton?.disabled).toBe(false)
    expect(instance.easeTo).not.toHaveBeenCalled()
    expect(instance.fitBounds).not.toHaveBeenCalled()

    store.selectNextEvent()
    await nextTick()

    expect(instance.easeTo).not.toHaveBeenCalled()
    expect(instance.fitBounds).not.toHaveBeenCalled()

    focusButton?.click()

    expect(instance.fitBounds).toHaveBeenCalledWith(
      [
        [110, 34],
        [111.25, 35.5],
      ],
      {
        duration: 450,
        maxZoom: 9,
        padding: 64,
      },
    )

    app.unmount()
    host.remove()
  })

  it('路线图层关闭不影响定位计算，重复定位与 style.load 后定位均可用', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const pinia = createPinia()
    const store = useMvpStore(pinia)
    store.initializeTimeline(routeEvents, secondEvent.id)
    store.toggleLayer('routes')
    const app = createApp(HistoryMap, {
      ...emptyHistoryMapProps,
      events: routeEvents,
      places: focusPlaces,
      routeSegments,
    })

    app.use(pinia).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]
    const focusButton = host.querySelector<HTMLButtonElement>(
      '[aria-label="定位当前事件"]',
    )

    focusButton?.click()
    focusButton?.click()
    expect(instance.fitBounds).toHaveBeenCalledTimes(2)

    instance.emit('style.load')
    await nextTick()
    focusButton?.click()

    expect(instance.fitBounds).toHaveBeenCalledTimes(3)
    expect(store.layerVisibility.routes).toBe(false)

    app.unmount()
    host.remove()
  })

  it('单地点事件使用点定位，缺少定位几何时按钮正确禁用', async () => {
    const pointHost = document.createElement('div')
    document.body.append(pointHost)
    const pointPinia = createPinia()
    const pointStore = useMvpStore(pointPinia)
    pointStore.initializeTimeline(routeEvents, firstEvent.id)
    const pointApp = createApp(HistoryMap, {
      ...emptyHistoryMapProps,
      events: routeEvents,
      places: focusPlaces,
      routeSegments,
    })

    pointApp.use(pointPinia).mount(pointHost)
    await nextTick()
    const pointInstance = maplibreMock.instances[0]
    pointHost
      .querySelector<HTMLButtonElement>('[aria-label="定位当前事件"]')
      ?.click()

    expect(pointInstance.easeTo).toHaveBeenCalledWith({
      center: [110.25, 34.5],
      duration: 450,
      zoom: 8,
    })
    pointApp.unmount()
    pointHost.remove()

    const emptyHost = document.createElement('div')
    document.body.append(emptyHost)
    const emptyApp = createApp(HistoryMap, emptyHistoryMapProps)
    emptyApp.use(createPinia()).mount(emptyHost)
    await nextTick()

    expect(
      emptyHost.querySelector<HTMLButtonElement>(
        '[aria-label="定位当前事件"]',
      )?.disabled,
    ).toBe(true)

    emptyApp.unmount()
    emptyHost.remove()
  })
})
