import { createPinia } from 'pinia'
import { createApp, h, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MvpDataError } from '../domain/mvpTypes'
import type { MvpDataset } from '../domain/mvpTypes'
import AnshiMvpView from './AnshiMvpView.vue'

const repositoryMock = vi.hoisted(() => ({
  loadMvpDataset: vi.fn(),
}))
const mapComponentMock = vi.hoisted(() => ({
  focusCurrentEvent: vi.fn(),
  focusPlace: vi.fn(),
}))

vi.mock('../data/mvpRepository', () => ({
  loadMvpDataset: repositoryMock.loadMvpDataset,
}))

vi.mock('../components/map/HistoryMap.vue', () => ({
  default: {
    props: ['events', 'geography', 'initialView', 'places', 'routeSegments'],
    setup(
      props: {
        events: unknown[]
        geography: { features: unknown[] }
        initialView: { center: [number, number] }
        places: { features: unknown[] }
        routeSegments: { features: unknown[] }
      },
      { expose }: { expose: (value: Record<string, unknown>) => void },
    ) {
      expose({
        focusCurrentEvent: mapComponentMock.focusCurrentEvent,
        focusPlace: mapComponentMock.focusPlace,
      })
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
  places: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {
          id: 'place-test',
          name: '测试地点',
          modernName: null,
          placeType: 'OTHER',
          summary: {
            claimId: 'claim-place-summary',
            text: '仅用于组件测试。',
            viewpointType: 'INFERENCE',
            certainty: 'DISPUTED',
            citationIds: ['citation-test'],
          },
          strategicRole: {
            claimId: 'claim-place-role',
            text: '仅用于组件测试。',
            viewpointType: 'INFERENCE',
            certainty: 'UNKNOWN',
            citationIds: ['citation-test'],
          },
          certainty: 'DISPUTED',
          coordinateNote: {
            claimId: 'claim-place-coordinate',
            text: '测试坐标不是精确历史坐标。',
            viewpointType: 'INFERENCE',
            certainty: 'DISPUTED',
            citationIds: ['citation-test'],
          },
          citationIds: ['citation-test'],
        },
      },
    ],
  },
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
      relatedPlaceIds: ['place-test'],
      actorLabels: ['测试参与者'],
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
  sources: [
    {
      id: 'source-test',
      title: '《测试资料》',
      author: '测试作者',
      edition: '测试版本',
      publisher: null,
      publishYear: null,
      sourceType: '合成资料',
      provenance: null,
    },
  ],
  citations: [
    {
      id: 'citation-test',
      sourceId: 'source-test',
      chapter: '测试章节',
      locator: 'test-anchor',
      pageStart: null,
      pageEnd: null,
      quote: null,
      summary: '仅用于组件测试的项目归纳。',
      viewpointType: 'INFERENCE',
      certainty: 'UNKNOWN',
    },
  ],
}

async function settleView(): Promise<void> {
  await Promise.resolve()
  await nextTick()
}

describe('AnshiMvpView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    repositoryMock.loadMvpDataset.mockReset()
    mapComponentMock.focusCurrentEvent.mockReset()
    mapComponentMock.focusPlace.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
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
    ).toBe('1')
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
      '专题数据加载失败',
    )
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      '模拟数据错误',
    )
    expect(
      host.querySelector<HTMLButtonElement>('[aria-label="重试加载专题数据"]')
        ?.disabled,
    ).toBe(false)
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

    expect(mapComponentMock.focusCurrentEvent).not.toHaveBeenCalled()
    expect(mapComponentMock.focusPlace).not.toHaveBeenCalled()
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

  it('事件详情可进入地点详情并关闭返回，时间轴和图层状态保持', async () => {
    repositoryMock.loadMvpDataset.mockResolvedValue(dataset)
    const host = document.createElement('div')
    document.body.append(host)
    const pinia = createPinia()
    const app = createApp(AnshiMvpView)

    app.use(pinia).mount(host)
    await settleView()

    const { useMvpStore } = await import('../stores/mvpStore')
    const store = useMvpStore(pinia)
    store.toggleLayer('routes')
    expect(host.querySelector('.detail-panel')?.getAttribute('data-detail-mode')).toBe(
      'EVENT',
    )
    expect(host.querySelector('.event-detail')?.textContent).toContain(
      '测试事件二',
    )

    host
      .querySelector<HTMLButtonElement>('[data-related-place-id="place-test"]')
      ?.click()
    await nextTick()

    expect(store.selectedPlaceId).toBe('place-test')
    expect(mapComponentMock.focusPlace).toHaveBeenCalledWith('place-test')
    expect(host.querySelector('.detail-panel')?.getAttribute('data-detail-mode')).toBe(
      'PLACE',
    )
    expect(host.querySelector('.place-detail')?.textContent).toContain('测试地点')

    host
      .querySelector<HTMLButtonElement>('[aria-label="在地图上定位此地点"]')
      ?.click()
    expect(mapComponentMock.focusPlace).toHaveBeenCalledTimes(2)

    host.querySelector<HTMLButtonElement>('.detail-close')?.click()
    await nextTick()

    expect(store.selectedPlaceId).toBeUndefined()
    expect(store.selectedEventId).toBe('event-second')
    expect(store.selectedSequence).toBe(2)
    expect(store.layerVisibility.routes).toBe(false)
    expect(host.querySelector('.detail-panel')?.getAttribute('data-detail-mode')).toBe(
      'EVENT',
    )
    expect(host.querySelector('.event-detail')?.textContent).toContain(
      '测试事件二',
    )

    app.unmount()
    host.remove()
  })

  it('加载失败后可重试成功，并显示 Repository 错误代码与字段路径', async () => {
    repositoryMock.loadMvpDataset
      .mockRejectedValueOnce(
        new MvpDataError({
          code: 'INVALID_JSON',
          message: 'MVP 数据不是合法 JSON',
          path: '$.events',
        }),
      )
      .mockResolvedValueOnce(dataset)
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(AnshiMvpView)

    app.use(createPinia()).mount(host)
    await settleView()

    expect(host.textContent).toContain('INVALID_JSON')
    expect(host.textContent).toContain('$.events')

    host
      .querySelector<HTMLButtonElement>('[aria-label="重试加载专题数据"]')
      ?.click()
    await settleView()

    expect(repositoryMock.loadMvpDataset).toHaveBeenCalledTimes(2)
    expect(host.querySelector('[data-testid="history-map"]')).not.toBeNull()
    expect(host.querySelector('[role="alert"]')).toBeNull()
    expect(host.querySelector('[aria-current="step"]')?.textContent).toContain(
      '测试事件二',
    )

    app.unmount()
    host.remove()
  })

  it('重试再次失败时保留重试入口并更新为最近一次错误', async () => {
    repositoryMock.loadMvpDataset
      .mockRejectedValueOnce(new Error('首次失败'))
      .mockRejectedValueOnce(new Error('再次失败'))
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(AnshiMvpView)

    app.use(createPinia()).mount(host)
    await settleView()
    host
      .querySelector<HTMLButtonElement>('[aria-label="重试加载专题数据"]')
      ?.click()
    await settleView()

    expect(repositoryMock.loadMvpDataset).toHaveBeenCalledTimes(2)
    expect(host.textContent).toContain('再次失败')
    expect(host.textContent).not.toContain('首次失败')
    expect(
      host.querySelector<HTMLButtonElement>('[aria-label="重试加载专题数据"]')
        ?.disabled,
    ).toBe(false)

    app.unmount()
    host.remove()
  })

  it('组件卸载后的异步结果不会写入 store 或产生错误日志', async () => {
    let resolveDataset: ((value: MvpDataset) => void) | undefined
    repositoryMock.loadMvpDataset.mockReturnValue(
      new Promise<MvpDataset>((resolve) => {
        resolveDataset = resolve
      }),
    )
    const host = document.createElement('div')
    document.body.append(host)
    const pinia = createPinia()
    const app = createApp(AnshiMvpView)

    app.use(pinia).mount(host)
    await nextTick()
    app.unmount()
    resolveDataset?.(dataset)
    await settleView()

    const { useMvpStore } = await import('../stores/mvpStore')
    const store = useMvpStore(pinia)
    expect(store.orderedEventIds).toEqual([])
    expect(store.selectedEventId).toBeUndefined()
    expect(console.error).not.toHaveBeenCalled()

    host.remove()
  })
})
