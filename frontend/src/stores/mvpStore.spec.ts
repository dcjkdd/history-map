import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Event } from '../domain/mvpTypes'
import { useMvpStore } from './mvpStore'

function makeEvent(id: string, sequence: number): Event {
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
      text: '仅用于 store 测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    whyItMatters: {
      claimId: `claim-importance-${id}`,
      text: '仅用于 store 测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    relatedPlaceIds: [],
    actorLabels: [],
    citationIds: ['citation-test'],
  }
}

describe('mvpStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('默认显示四组图层并可独立切换', () => {
    const store = useMvpStore()

    expect(store.layerVisibility).toEqual({
      hydrography: true,
      geography: true,
      places: true,
      routes: true,
    })

    store.toggleLayer('places')

    expect(store.layerVisibility).toEqual({
      hydrography: true,
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

    store.clearSelectedPlace()
    expect(store.selectedPlaceId).toBeUndefined()
    expect(store.selectedEventId).toBe('event-01')
  })

  it('重复选择和重复关闭地点详情保持幂等且不改变时间轴或图层状态', () => {
    const store = useMvpStore()
    const events = [makeEvent('event-first', 1), makeEvent('event-second', 2)]
    store.initializeTimeline(events, 'event-second')
    store.toggleLayer('routes')

    store.selectPlace('place-tongguan')
    store.selectPlace('place-tongguan')
    store.clearSelectedPlace()
    store.clearSelectedPlace()

    expect(store.selectedPlaceId).toBeUndefined()
    expect(store.selectedEventId).toBe('event-second')
    expect(store.selectedSequence).toBe(2)
    expect(store.layerVisibility.routes).toBe(false)
  })

  it('按顺序初始化并选中数据集默认事件', () => {
    const store = useMvpStore()
    const events = [makeEvent('event-third', 3), makeEvent('event-first', 1), makeEvent('event-second', 2)]

    store.initializeTimeline(events, 'event-second')

    expect(store.orderedEventIds).toEqual([
      'event-first',
      'event-second',
      'event-third',
    ])
    expect(store.selectedEventId).toBe('event-second')
    expect(store.selectedSequence).toBe(2)
    expect(store.hasPrevious).toBe(true)
    expect(store.hasNext).toBe(true)
  })

  it('在首尾边界禁用对应方向并可往返切换', () => {
    const store = useMvpStore()
    const events = [makeEvent('event-first', 1), makeEvent('event-second', 2)]
    store.initializeTimeline(events, 'event-first')

    store.selectPreviousEvent()
    expect(store.selectedEventId).toBe('event-first')
    expect(store.hasPrevious).toBe(false)
    expect(store.hasNext).toBe(true)

    store.selectNextEvent()
    store.selectNextEvent()
    expect(store.selectedEventId).toBe('event-second')
    expect(store.hasPrevious).toBe(true)
    expect(store.hasNext).toBe(false)

    store.selectPreviousEvent()
    expect(store.selectedEventId).toBe('event-first')
  })

  it('重复选择保持一致，未知 ID 不改变状态，并可复位默认事件', () => {
    const store = useMvpStore()
    const events = [makeEvent('event-first', 1), makeEvent('event-second', 2)]
    store.initializeTimeline(events, 'event-second')

    store.selectEvent('event-first')
    store.selectEvent('event-first')
    expect(store.selectedEventId).toBe('event-first')
    expect(store.selectedSequence).toBe(1)

    store.selectEvent('event-unknown')
    expect(store.selectedEventId).toBe('event-first')

    store.resetToDefaultEvent()
    expect(store.selectedEventId).toBe('event-second')
  })

  it('路线图层关闭时事件状态仍可前进和后退', () => {
    const store = useMvpStore()
    const events = [makeEvent('event-first', 1), makeEvent('event-second', 2)]
    store.initializeTimeline(events, 'event-first')
    store.toggleLayer('routes')

    store.selectNextEvent()
    expect(store.layerVisibility.routes).toBe(false)
    expect(store.selectedEventId).toBe('event-second')

    store.selectPreviousEvent()
    expect(store.layerVisibility.routes).toBe(false)
    expect(store.selectedEventId).toBe('event-first')
  })

  it('空事件或未知默认事件不会产生虚假的选择状态', () => {
    const store = useMvpStore()

    store.initializeTimeline([], 'event-unknown')

    expect(store.orderedEventIds).toEqual([])
    expect(store.selectedEventId).toBeUndefined()
    expect(store.selectedSequence).toBeUndefined()
    expect(store.hasPrevious).toBe(false)
    expect(store.hasNext).toBe(false)
  })
})
