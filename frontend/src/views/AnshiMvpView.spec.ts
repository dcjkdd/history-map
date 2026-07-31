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
    props: ['geography', 'initialView', 'places'],
    setup(props: {
      geography: { features: unknown[] }
      initialView: { center: [number, number] }
      places: { features: unknown[] }
    }) {
      return () =>
        h('div', {
          'data-center': JSON.stringify(props.initialView.center),
          'data-geography-count': props.geography.features.length,
          'data-place-count': props.places.features.length,
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
    defaultEventId: null,
  },
  places: { type: 'FeatureCollection', features: [] },
  geography: { type: 'FeatureCollection', features: [] },
  routeSegments: { type: 'FeatureCollection', features: [] },
  events: [],
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

    app.mount(host)
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

    app.unmount()
    host.remove()
  })

  it('数据加载失败时显示可读错误而不创建地图', async () => {
    repositoryMock.loadMvpDataset.mockRejectedValue(new Error('模拟数据错误'))
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(AnshiMvpView)

    app.mount(host)
    await settleView()

    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      '专题数据加载失败：模拟数据错误',
    )
    expect(host.querySelector('[data-testid="history-map"]')).toBeNull()

    app.unmount()
    host.remove()
  })
})
