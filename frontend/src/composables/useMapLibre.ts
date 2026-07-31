import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl'
import type {
  ErrorEvent as MapLibreErrorEvent,
  MapOptions,
} from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { ref, shallowRef } from 'vue'

import type { InitialView } from '../domain/mvpTypes'

export type MapStyleState = 'loading' | 'ready' | 'degraded'

type MapStyleErrorEvent = MapLibreErrorEvent & {
  layer?: unknown
  source?: unknown
  sourceId?: unknown
}

export function resolveEmptyMapStyleUrl(baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${normalizedBaseUrl}map/empty-style.json`
}

export const EMPTY_MAP_STYLE_URL = resolveEmptyMapStyleUrl(
  import.meta.env.BASE_URL,
)

const TOPIC_BOUNDS_PADDING = 32

setWorkerUrl(maplibreWorkerUrl)

export interface MapHandle {
  map: MapLibreMap
}

interface UseMapLibreOptions {
  styleUrl?: string | null
}

function resolveConfiguredStyleUrl(
  styleUrl: string | null | undefined,
): string | null {
  const candidate =
    styleUrl === undefined ? import.meta.env.VITE_MAP_STYLE_URL : styleUrl
  const normalized = candidate?.trim()

  return normalized ? normalized : null
}

function errorMessage(event: MapLibreErrorEvent): string | null {
  const message = event.error?.message.trim()
  return message ? message : null
}

function errorUrl(event: MapLibreErrorEvent): string | null {
  const url = (event.error as { url?: unknown }).url
  return typeof url === 'string' && url ? url : null
}

function sameUrl(first: string, second: string): boolean {
  try {
    return (
      new URL(first, window.location.href).href ===
      new URL(second, window.location.href).href
    )
  } catch {
    return first === second
  }
}

function isRootStyleFailure(
  event: MapStyleErrorEvent,
  currentStyleUrl: string,
): boolean {
  if (
    event.sourceId !== undefined ||
    event.source !== undefined ||
    event.layer !== undefined
  ) {
    return false
  }

  const requestUrl = errorUrl(event)
  return requestUrl ? sameUrl(requestUrl, currentStyleUrl) : true
}

export function useMapLibre(options: UseMapLibreOptions = {}) {
  const map = shallowRef<MapLibreMap | null>(null)
  const mapStyleState = ref<MapStyleState>('loading')
  const isUsingFallbackStyle = ref(false)
  const mapStyleWarning = ref<string | null>(null)

  let initialView: InitialView | null = null
  let handle: MapHandle | null = null
  let onStyleLoad: (() => void) | null = null
  let onStyleError: ((event: MapStyleErrorEvent) => void) | null = null

  function fitToTopic(): void {
    const instance = map.value

    if (!instance || !initialView) {
      return
    }

    if (initialView.bounds) {
      instance.fitBounds(initialView.bounds, {
        duration: 0,
        padding: TOPIC_BOUNDS_PADDING,
      })
      return
    }

    instance.jumpTo({
      center: initialView.center,
      zoom: initialView.zoom,
    })
  }

  function createMap(
    container: HTMLElement,
    nextInitialView: InitialView,
  ): MapHandle {
    if (handle) {
      return handle
    }

    const configuredStyleUrl = resolveConfiguredStyleUrl(options.styleUrl)
    const usingFallbackInitially = configuredStyleUrl === null
    const mapOptions: MapOptions = {
      container,
      style: configuredStyleUrl ?? EMPTY_MAP_STYLE_URL,
      center: nextInitialView.center,
      zoom: nextInitialView.zoom,
    }

    if (nextInitialView.bounds) {
      mapOptions.bounds = nextInitialView.bounds
      mapOptions.fitBoundsOptions = {
        duration: 0,
        padding: TOPIC_BOUNDS_PADDING,
      }
    }

    if (nextInitialView.maxBounds) {
      mapOptions.maxBounds = nextInitialView.maxBounds
    }

    const instance = new MapLibreMap(mapOptions)

    initialView = nextInitialView
    map.value = instance
    mapStyleState.value = 'loading'
    isUsingFallbackStyle.value = usingFallbackInitially
    mapStyleWarning.value = usingFallbackInitially
      ? '未配置外部底图，当前使用本地中性背景。'
      : null
    onStyleLoad = () => {
      mapStyleState.value = 'ready'
    }

    onStyleError = (event) => {
      const reason = errorMessage(event)

      if (mapStyleState.value === 'loading') {
        const currentStyleUrl = isUsingFallbackStyle.value
          ? EMPTY_MAP_STYLE_URL
          : configuredStyleUrl

        if (currentStyleUrl && isRootStyleFailure(event, currentStyleUrl)) {
          if (!isUsingFallbackStyle.value) {
            isUsingFallbackStyle.value = true
            mapStyleWarning.value = reason
              ? `外部底图加载失败，已切换为本地中性背景：${reason}`
              : '外部底图加载失败，已切换为本地中性背景。'
            instance.setStyle(EMPTY_MAP_STYLE_URL, { diff: false })
            return
          }

          mapStyleState.value = 'degraded'
          mapStyleWarning.value = reason
            ? `本地降级底图未能加载，地图背景将保持中性色：${reason}`
            : '本地降级底图未能加载，地图背景将保持中性色。'
          return
        }

        mapStyleWarning.value = reason
          ? `地图部分资源不可用，地图交互仍可继续：${reason}`
          : '地图部分资源不可用，地图交互仍可继续。'
        return
      }

      if (mapStyleState.value === 'ready') {
        mapStyleWarning.value = reason
          ? `地图部分资源不可用，地图交互仍可继续：${reason}`
          : '地图部分资源不可用，地图交互仍可继续。'
      }
    }

    instance.on('style.load', onStyleLoad)
    instance.on('error', onStyleError)

    handle = { map: instance }
    return handle
  }

  function destroyMap(): void {
    const instance = map.value

    if (!instance) {
      return
    }

    if (onStyleLoad) {
      instance.off('style.load', onStyleLoad)
    }

    if (onStyleError) {
      instance.off('error', onStyleError)
    }

    instance.remove()
    map.value = null
    initialView = null
    handle = null
    onStyleLoad = null
    onStyleError = null
    mapStyleState.value = 'loading'
  }

  return {
    map,
    mapStyleState,
    isUsingFallbackStyle,
    mapStyleWarning,
    createMap,
    destroyMap,
    fitToTopic,
  }
}
