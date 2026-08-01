<script setup lang="ts">
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useMapLibre } from '../../composables/useMapLibre'
import { deriveMapState } from '../../domain/deriveMapState'
import {
  getCurrentEventFocusTarget,
  getPlaceFocusTarget,
} from '../../domain/mapFocus'
import type { MapFocusTarget } from '../../domain/mapFocus'
import type { InitialView, LayerGroup, MvpDataset } from '../../domain/mvpTypes'
import {
  addGeographyLayers,
  setLayerVisibility,
} from '../../map/layers/geographyLayer'
import {
  addPlaceLayers,
  applyRelatedPlaceState,
  PLACE_INTERACTIVE_LAYER_IDS,
  setSelectedPlace,
} from '../../map/layers/placeLayer'
import {
  addRouteLayers,
  applyRouteState,
} from '../../map/layers/routeLayer'
import { useMvpStore } from '../../stores/mvpStore'
import LayerControl from './LayerControl.vue'
import MapLegend from './MapLegend.vue'

const props = defineProps<{
  initialView: InitialView
  events: MvpDataset['events']
  geography: MvpDataset['geography']
  places: MvpDataset['places']
  routeSegments: MvpDataset['routeSegments']
}>()

const store = useMvpStore()
const mapContainer = ref<HTMLElement | null>(null)
const mapInitializationError = ref<string | null>(null)
const mapReady = ref(false)
let mapInstance: MapLibreMap | null = null
let onHistoryStyleLoad: (() => void) | null = null
let onMapClick: ((event: MapMouseEvent) => void) | null = null

const {
  createMap,
  destroyMap,
  fitToTopic,
  mapStyleState,
  mapStyleWarning,
} = useMapLibre()

const derivedMapState = computed(() =>
  deriveMapState(
    {
      events: props.events,
      routeSegments: props.routeSegments,
    },
    store.selectedEventId,
    store.selectedPlaceId,
  ),
)

const currentEventFocusTarget = computed(() =>
  getCurrentEventFocusTarget(
    {
      events: props.events,
      places: props.places,
      routeSegments: props.routeSegments,
    },
    store.selectedEventId,
  ),
)

function applyFocusTarget(target: MapFocusTarget): void {
  if (!mapInstance) {
    return
  }

  if (target.kind === 'bounds') {
    mapInstance.fitBounds(target.bounds, {
      duration: 450,
      maxZoom: 9,
      padding: 64,
    })
    return
  }

  mapInstance.easeTo({
    center: target.center,
    duration: 450,
    zoom: Math.max(mapInstance.getZoom(), 8),
  })
}

function focusCurrentEvent(): void {
  const target = currentEventFocusTarget.value

  if (target) {
    applyFocusTarget(target)
  }
}

function focusPlace(placeId: string): void {
  const target = getPlaceFocusTarget(props.places, placeId)

  if (target) {
    applyFocusTarget(target)
  }
}

function applyLayerVisibility(map: MapLibreMap): void {
  for (const layerGroup of [
    'geography',
    'places',
    'routes',
  ] satisfies LayerGroup[]) {
    setLayerVisibility(
      map,
      layerGroup,
      store.layerVisibility[layerGroup],
    )
  }
}

function syncHistoryLayers(map: MapLibreMap): void {
  addGeographyLayers(map, props.geography)
  addRouteLayers(map, props.routeSegments)
  addPlaceLayers(map, props.places)
  applyLayerVisibility(map)
  applyRouteState(map, derivedMapState.value)
  applyRelatedPlaceState(map, derivedMapState.value)
  setSelectedPlace(map, derivedMapState.value.selectedPlaceId)
}

function toggleLayer(layerGroup: LayerGroup): void {
  store.toggleLayer(layerGroup)
}

watch(
  () => [
    store.layerVisibility.geography,
    store.layerVisibility.places,
    store.layerVisibility.routes,
  ] as const,
  () => {
    if (mapInstance) {
      applyLayerVisibility(mapInstance)
    }
  },
)

watch(derivedMapState, (nextDerivedMapState) => {
  if (mapInstance) {
    applyRouteState(mapInstance, nextDerivedMapState)
    applyRelatedPlaceState(mapInstance, nextDerivedMapState)
    setSelectedPlace(mapInstance, nextDerivedMapState.selectedPlaceId)
  }
})

onMounted(() => {
  if (!mapContainer.value) {
    mapInitializationError.value = '地图容器不可用。'
    return
  }

  try {
    const handle = createMap(mapContainer.value, props.initialView)
    mapInstance = handle.map
    mapReady.value = true
    onHistoryStyleLoad = () => {
      if (mapInstance) {
        syncHistoryLayers(mapInstance)
      }
    }
    onMapClick = (event) => {
      if (!mapInstance) {
        return
      }

      const interactiveLayerIds = PLACE_INTERACTIVE_LAYER_IDS.filter(
        (layerId) => mapInstance?.getLayer(layerId),
      )
      const feature = interactiveLayerIds.length
        ? mapInstance.queryRenderedFeatures(event.point, {
            layers: interactiveLayerIds,
          })[0]
        : undefined
      const placeId = feature?.properties.id

      store.selectPlace(typeof placeId === 'string' ? placeId : undefined)
    }

    mapInstance.on('style.load', onHistoryStyleLoad)
    mapInstance.on('click', onMapClick)

    if (mapInstance.isStyleLoaded()) {
      syncHistoryLayers(mapInstance)
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    mapInitializationError.value = `地图初始化失败：${reason}`
  }
})

onBeforeUnmount(() => {
  if (mapInstance && onHistoryStyleLoad) {
    mapInstance.off('style.load', onHistoryStyleLoad)
  }

  if (mapInstance && onMapClick) {
    mapInstance.off('click', onMapClick)
  }

  destroyMap()
  mapReady.value = false
  mapInstance = null
  onHistoryStyleLoad = null
  onMapClick = null
})

defineExpose({ fitToTopic, focusCurrentEvent, focusPlace })
</script>

<template>
  <section
    class="history-map"
    aria-label="安史之乱专题地图"
    :aria-busy="mapStyleState === 'loading' && !mapInitializationError"
  >
    <div ref="mapContainer" class="history-map__canvas"></div>

    <div class="history-map__actions" role="group" aria-label="地图定位控制">
      <button
        type="button"
        :disabled="!mapReady || !currentEventFocusTarget"
        aria-label="定位当前事件"
        @click="focusCurrentEvent"
      >
        定位当前事件
      </button>
    </div>

    <LayerControl
      :visibility="store.layerVisibility"
      @toggle="toggleLayer"
    />

    <MapLegend />

    <p
      v-if="mapInitializationError"
      class="history-map__message history-map__message--error"
      role="alert"
    >
      {{ mapInitializationError }}
    </p>
    <p
      v-else-if="mapStyleState === 'loading'"
      class="history-map__message"
      role="status"
    >
      地图底图加载中…
    </p>

    <p
      v-if="mapStyleWarning"
      class="history-map__warning"
      role="status"
    >
      {{ mapStyleWarning }}
    </p>
  </section>
</template>
