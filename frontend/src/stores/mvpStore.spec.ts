import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useMvpStore } from './mvpStore'

describe('mvpStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('默认显示三组图层并可独立切换', () => {
    const store = useMvpStore()

    expect(store.layerVisibility).toEqual({
      geography: true,
      places: true,
      routes: true,
    })

    store.toggleLayer('places')

    expect(store.layerVisibility).toEqual({
      geography: true,
      places: false,
      routes: true,
    })
  })

  it('记录和清除 selectedPlaceId 而不改变事件选择', () => {
    const store = useMvpStore()
    store.selectedEventId = 'event-01'

    store.selectPlace('place-tongguan')
    expect(store.selectedPlaceId).toBe('place-tongguan')
    expect(store.selectedEventId).toBe('event-01')

    store.selectPlace(undefined)
    expect(store.selectedPlaceId).toBeUndefined()
    expect(store.selectedEventId).toBe('event-01')
  })
})
