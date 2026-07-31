import { describe, expect, it } from 'vitest'

import {
  getNextEventId,
  getPreviousEventId,
  sortEvents,
} from '../../src/domain/timeline'
import type { Event } from '../../src/domain/mvpTypes'

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
      text: '仅用于时间轴单元测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    whyItMatters: {
      claimId: `claim-importance-${id}`,
      text: '仅用于时间轴单元测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    relatedPlaceIds: [],
    actorLabels: [],
    citationIds: ['citation-test'],
  }
}

describe('timeline domain', () => {
  const first = makeEvent('event-first', 1)
  const second = makeEvent('event-second', 2)
  const third = makeEvent('event-third', 3)

  it('按 sequence 稳定排序且不修改输入数组', () => {
    const input = [third, first, second]

    expect(sortEvents(input).map((event) => event.id)).toEqual([
      'event-first',
      'event-second',
      'event-third',
    ])
    expect(input.map((event) => event.id)).toEqual([
      'event-third',
      'event-first',
      'event-second',
    ])
  })

  it('返回中间事件的上一项和下一项', () => {
    const events = [third, first, second]

    expect(getPreviousEventId(events, second.id)).toBe(first.id)
    expect(getNextEventId(events, second.id)).toBe(third.id)
  })

  it('在首尾边界返回 undefined', () => {
    const events = [third, first, second]

    expect(getPreviousEventId(events, first.id)).toBeUndefined()
    expect(getNextEventId(events, third.id)).toBeUndefined()
  })

  it('未知 ID 和空事件集合安全返回 undefined', () => {
    expect(getPreviousEventId([first], 'event-unknown')).toBeUndefined()
    expect(getNextEventId([first], 'event-unknown')).toBeUndefined()
    expect(getPreviousEventId([], first.id)).toBeUndefined()
    expect(getNextEventId([], first.id)).toBeUndefined()
  })
})
