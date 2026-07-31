import { createPinia } from 'pinia'
import { createApp, h, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MvpDataset } from '../domain/mvpTypes'
import AnshiMvpView from './AnshiMvpView.vue'

const repositoryMock = vi.hoisted(() => ({
  loadMvpDataset: vi.fn(),
}))

vi.mock('../data/mvpRepository', () => ({
  loadMvpDataset: repositoryMock.loadMvpDataset,
}))

vi.mock('../components/map/HistoryMap.vue', () => ({
  default: {
    props: ['events', 'geography', 'initialView', 'places', 'routeSegments'],
    setup(props: {
      events: unknown[]
      geography: { features: unknown[] }
      initialView: { center: [number, number] }
      places: { features: unknown[] }
      routeSegments: { features: unknown[] }
    }) {
      return () =>
        h('div', {
          'data-center': JSON.stringify(props.initialView.center),
          'data-event-count': props.events.length,
          'data-geography-count': props.geography.features.length,
          'data-place-count': props.places.features.length,
          'data-route-count': props.routeSegments.features.length,
          'data-testid': 'history-map',
        })
    },
  },
}))

const dataset: MvpDataset = {
  schemaVersion: '1.0',
  topic: {
    id: 'test-topic',
    title: '测试专题',
    subtitle: '测试地图副标题',
    summary: '仅用于组件测试。',
    initialView: {
      center: [110.7, 34.6],
      zoom: 6.5,
    },
    defaultEventId: 'event-second',
  },
  places: { type: 'FeatureCollection', features: [] },
  geography: { type: 'FeatureCollection', features: [] },
  routeSegments: { type: 'FeatureCollection', features: [] },
  events: [
    {
      id: 'event-second',
      sequence: 2,
      title: '测试事件二',
      eventType: 'OTHER',
      dateLabel: '相对时间二',
      normalizedDate: null,
      timePrecision: 'APPROXIMATE',
      certainty: 'UNKNOWN',
      summary: {
        claimId: 'claim-event-second-summary',
        text: '仅用于组件测试。',
        viewpointType: 'INFERENCE',
        certainty: 'UNKNOWN',
        citationIds: ['citation-test'],
      },
      whyItMatters: {
        claimId: 'claim-event-second-importance',
        text: '仅用于组件测试。',
        viewpointType: 'INFERENCE',
        certainty: 'UNKNOWN',
        citationIds: ['citation-test'],
      },
      relatedPlaceIds: [],
      actorLabels: [],
      citationIds: ['citation-test'],
    },
    {
      id: 'event-first',
      sequence: 1,
      title: '测试事件一',
      eventType: 'OTHER',
      dateLabel: '相对时间一',
      normalizedDate: null,
      timePrecision: 'APPROXIMATE',
      certainty: 'UNKNOWN',
      summary: {
        claimId: 'claim-event-first-summary',
        text: '仅用于组件测试。',
        viewpointType: 'INFERENCE',
        certainty: 'UNKNOWN',
        citationIds: ['citation-test'],
      },
      whyItMatters: {
        claimId: 'claim-event-first-importance',
        text: '仅用于组件测试。',
        viewpointType: 'INFERENCE',
        certainty: 'UNKNOWN',
        citationIds: ['citation-test'],
      },
      relatedPlaceIds: [],
      actorLabels: [],
      citationIds: ['citation-test'],
    },
  ],
  sources: [],
  citations: [],
}

async function settleView(): Promise<void> {
  await Promise.resolve()
  await nextTick()
}

describe('AnshiMvpView', () => {
  beforeEach(() => {
    repositoryMock.loadMvpDataset.mockReset()
  })

  it('通过 Repository 加载专题并把数据集初始视野交给地图', async () => {
    repositoryMock.loadMvpDataset.mockResolvedValue(dataset)
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(AnshiMvpView)

    app.use(createPinia()).mount(host)
    await settleView()

    expect(repositoryMock.loadMvpDataset).toHaveBeenCalledTimes(1)
    expect(host.querySelector('h1')?.textContent).toBe('测试专题')
    expect(host.querySelector('.hero-description')?.textContent).toContain(
      '测试地图副标题',
    )
    expect(
      host.querySelector('[data-testid="history-map"]')?.getAttribute('data-center'),
    ).toBe('[110.7,34.6]')
    expect(
      host
        .querySelector('[data-testid="history-map"]')
        ?.getAttribute('data-geography-count'),
    ).toBe('0')
    expect(
      host
        .querySelector('[data-testid="history-map"]')
        ?.getAttribute('data-place-count'),
    ).toBe('0')
    expect(
      host
        .querySelector('[data-testid="history-map"]')
        ?.getAttribute('data-route-count'),
    ).toBe('0')
    expect(
      host
        .querySelector('[data-testid="history-map"]')
        ?.getAttribute('data-event-count'),
    ).toBe('2')
    expect(host.querySelector('[aria-current="step"]')?.textContent).toContain(
      '测试事件二',
    )
    expect(host.textContent).toContain('第 2 / 2 个事件')

    app.unmount()
    host.remove()
  })

  it('数据加载失败时显示可读错误而不创建地图', async () => {
    repositoryMock.loadMvpDataset.mockRejectedValue(new Error('模拟数据错误'))
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(AnshiMvpView)

    app.use(createPinia()).mount(host)
    await settleView()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      '专题数据加载失败：模拟数据错误',
    )
    expect(host.querySelector('[data-testid="history-map"]')).toBeNull()

    app.unmount()
    host.remove()
  })

  it('前后按钮和节点直选同步更新当前时间轴状态', async () => {
    repositoryMock.loadMvpDataset.mockResolvedValue(dataset)
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(AnshiMvpView)

    app.use(createPinia()).mount(host)
    await settleView()

    const previousButton = host.querySelector<HTMLButtonElement>(
      '[aria-label="上一事件"]',
    )
    previousButton?.click()
    await nextTick()

    expect(host.querySelector('[aria-current="step"]')?.textContent).toContain(
      '测试事件一',
    )
    expect(previousButton?.disabled).toBe(true)

    host
      .querySelector<HTMLButtonElement>('[data-event-id="event-second"]')
      ?.click()
    await nextTick()

    expect(host.querySelector('[aria-current="step"]')?.textContent).toContain(
      '测试事件二',
    )

    app.unmount()
    host.remove()
  })
})
