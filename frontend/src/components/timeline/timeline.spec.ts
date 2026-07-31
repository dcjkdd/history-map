import { createApp, h, nextTick, reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import type { Event } from '../../domain/mvpTypes'
import EventTimeline from './EventTimeline.vue'
import TimelineControls from './TimelineControls.vue'

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
      text: '仅用于组件测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    whyItMatters: {
      claimId: `claim-importance-${id}`,
      text: '仅用于组件测试。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
      citationIds: ['citation-test'],
    },
    relatedPlaceIds: [],
    actorLabels: [],
    citationIds: ['citation-test'],
  }
}

describe('MVP-06 timeline components', () => {
  const events = [makeEvent('event-first', 1), makeEvent('event-second', 2)]

  it('显示 dateLabel 与标题，直选同一节点得到一致事件 ID', async () => {
    const onSelect = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(EventTimeline, {
      events,
      selectedEventId: 'event-first',
      onSelect,
    })

    app.mount(host)
    const buttons = host.querySelectorAll<HTMLButtonElement>('button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0]?.getAttribute('aria-current')).toBe('step')
    expect(host.textContent).toContain('相对时间 1')
    expect(host.textContent).toContain('测试事件 2')

    buttons[1]?.click()
    buttons[1]?.click()
    await nextTick()

    expect(onSelect).toHaveBeenNthCalledWith(1, 'event-second')
    expect(onSelect).toHaveBeenNthCalledWith(2, 'event-second')

    app.unmount()
    host.remove()
  })

  it('左右方向键选择相邻事件并把可见焦点移到对应按钮', async () => {
    const onSelect = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(EventTimeline, {
      events,
      selectedEventId: 'event-first',
      onSelect,
    })

    app.mount(host)
    const buttons = host.querySelectorAll<HTMLButtonElement>('button')
    buttons[0]?.focus()
    buttons[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    )
    await nextTick()

    expect(onSelect).toHaveBeenCalledWith('event-second')
    expect(document.activeElement).toBe(buttons[1])

    app.unmount()
    host.remove()
  })

  it('带修饰键的方向键保留浏览器快捷键且不切换事件', async () => {
    const onSelect = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(EventTimeline, {
      events,
      selectedEventId: 'event-first',
      onSelect,
    })

    app.mount(host)
    const buttons = host.querySelectorAll<HTMLButtonElement>('button')
    const keyboardEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      altKey: true,
      bubbles: true,
      cancelable: true,
    })
    buttons[0]?.focus()
    buttons[0]?.dispatchEvent(keyboardEvent)
    await nextTick()

    expect(keyboardEvent.defaultPrevented).toBe(false)
    expect(onSelect).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(buttons[0])

    app.unmount()
    host.remove()
  })

  it('前后按钮暴露原生禁用状态且只触发可用方向', async () => {
    const onPrevious = vi.fn()
    const onNext = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(TimelineControls, {
      hasPrevious: false,
      hasNext: true,
      selectedSequence: 1,
      total: 2,
      onPrevious,
      onNext,
    })

    app.mount(host)
    const buttons = host.querySelectorAll<HTMLButtonElement>('button')

    expect(buttons[0]?.disabled).toBe(true)
    expect(buttons[1]?.disabled).toBe(false)
    expect(host.textContent).toContain('第 1 / 2 个事件')

    buttons[0]?.click()
    buttons[1]?.click()
    await nextTick()

    expect(onPrevious).not.toHaveBeenCalled()
    expect(onNext).toHaveBeenCalledTimes(1)

    app.unmount()
    host.remove()
  })

  it('到达首尾后把焦点交给仍可用的相邻控制按钮', async () => {
    const state = reactive({ selectedSequence: 1 })
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      setup() {
        return () =>
          h(TimelineControls, {
            hasPrevious: state.selectedSequence > 1,
            hasNext: state.selectedSequence < 2,
            selectedSequence: state.selectedSequence,
            total: 2,
            onPrevious: () => {
              state.selectedSequence -= 1
            },
            onNext: () => {
              state.selectedSequence += 1
            },
          })
      },
    })

    app.mount(host)
    let buttons = host.querySelectorAll<HTMLButtonElement>('button')
    buttons[1]?.focus()
    buttons[1]?.click()
    await nextTick()

    buttons = host.querySelectorAll<HTMLButtonElement>('button')
    expect(buttons[1]?.disabled).toBe(true)
    expect(document.activeElement).toBe(buttons[0])

    buttons[0]?.click()
    await nextTick()

    buttons = host.querySelectorAll<HTMLButtonElement>('button')
    expect(buttons[0]?.disabled).toBe(true)
    expect(document.activeElement).toBe(buttons[1])
    expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe(
      '事件切换控制',
    )

    app.unmount()
    host.remove()
  })
})
