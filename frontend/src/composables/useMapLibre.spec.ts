import { createPinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import HistoryMap from '../components/map/HistoryMap.vue'
import type { InitialView } from '../domain/mvpTypes'
import { GEOGRAPHY_LAYER_IDS } from '../map/layers/geographyLayer'
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

  return { instances, MockMap }
})

vi.mock('maplibre-gl', () => ({
  Map: maplibreMock.MockMap,
  setWorkerUrl: vi.fn(),
}))

const centerView: InitialView = {
  center: [110.7, 34.6],
  zoom: 6.5,
}

const emptyGeography = { type: 'FeatureCollection' as const, features: [] }
const emptyPlaces = { type: 'FeatureCollection' as const, features: [] }

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
      center: centerView.center,
      container,
      style: 'https://maps.example.test/style.json',
      zoom: centerView.zoom,
    })

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
    expect(mapStyleWarning.value).toContain('本地中性背景')
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
    const app = createApp(HistoryMap, {
      geography: emptyGeography,
      initialView: centerView,
      places: emptyPlaces,
    })

    app.use(createPinia()).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]

    expect(maplibreMock.instances).toHaveLength(1)
    expect(host.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(host.textContent).toContain('本地中性背景')

    instance.emit('style.load')
    await nextTick()

    expect(host.querySelector('[aria-busy="false"]')).not.toBeNull()
    expect(host.textContent).not.toContain('地图底图加载中')
    expect(instance.addSource).toHaveBeenCalledTimes(2)
    expect(instance.addLayer).toHaveBeenCalledTimes(10)

    instance.emit('style.load')

    expect(instance.addSource).toHaveBeenCalledTimes(2)
    expect(instance.addLayer).toHaveBeenCalledTimes(10)

    instance.sources.clear()
    instance.layers.clear()
    instance.emit('style.load')

    expect(instance.addSource).toHaveBeenCalledTimes(4)
    expect(instance.addLayer).toHaveBeenCalledTimes(20)

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
    const app = createApp(HistoryMap, {
      geography: emptyGeography,
      initialView: centerView,
      places: emptyPlaces,
    })

    app.use(pinia).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]
    const store = useMvpStore(pinia)

    instance.emit('style.load')
    await nextTick()

    const geographyToggle = host.querySelector<HTMLInputElement>(
      '.layer-control input',
    )
    geographyToggle?.dispatchEvent(new Event('change'))
    await nextTick()

    expect(store.layerVisibility.geography).toBe(false)
    expect(instance.setLayoutProperty).toHaveBeenCalledWith(
      'mvp-geography-river',
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

    instance.sources.clear()
    instance.layers.clear()
    instance.emit('style.load')

    expect(instance.setLayoutProperty).toHaveBeenLastCalledWith(
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

  it('HistoryMap 在外部根样式失败后的 style.load 恢复图层、可见性和选择', async () => {
    vi.stubEnv(
      'VITE_MAP_STYLE_URL',
      'https://maps.example.test/broken-style.json',
    )
    const host = document.createElement('div')
    document.body.append(host)
    const pinia = createPinia()
    const store = useMvpStore(pinia)
    store.toggleLayer('geography')
    store.selectPlace('place-tongguan')
    const app = createApp(HistoryMap, {
      geography: emptyGeography,
      initialView: centerView,
      places: emptyPlaces,
    })

    app.use(pinia).mount(host)
    await nextTick()
    const instance = maplibreMock.instances[0]

    expect(instance.listeners['style.load']).toHaveLength(2)
    expect(instance.listeners.error).toHaveLength(1)
    expect(instance.listeners.click).toHaveLength(1)

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

    expect(instance.addSource).toHaveBeenCalledTimes(2)
    expect(instance.addLayer).toHaveBeenCalledTimes(10)
    for (const layerId of GEOGRAPHY_LAYER_IDS) {
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

    instance.emit('style.load')

    expect(instance.addSource).toHaveBeenCalledTimes(2)
    expect(instance.addLayer).toHaveBeenCalledTimes(10)
    expect(instance.listeners['style.load']).toHaveLength(2)
    expect(instance.listeners.error).toHaveLength(1)
    expect(instance.listeners.click).toHaveLength(1)

    app.unmount()

    expect(instance.listeners['style.load']).toHaveLength(0)
    expect(instance.listeners.error).toHaveLength(0)
    expect(instance.listeners.click).toHaveLength(0)
    host.remove()
  })

  it('HistoryMap 在本地样式失败后结束忙碌态并保留可读告警', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(HistoryMap, {
      geography: emptyGeography,
      initialView: centerView,
      places: emptyPlaces,
    })

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
})
