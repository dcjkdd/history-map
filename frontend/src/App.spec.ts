import { createPinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import App from './App.vue'

vi.mock('./data/mvpRepository', () => ({
  loadMvpDataset: vi.fn(() => new Promise(() => undefined)),
}))

describe('App', () => {
  it('显示 MVP-09 页面壳、跳转链接和数据加载状态', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(App)

    app.use(createPinia()).mount(host)
    await nextTick()

    expect(host.querySelector('h1')?.textContent).toBe('中国古代战争地形地图')
    expect(host.querySelector('.topic-label')?.textContent).toBe(
      '当前专题 · 安史之乱',
    )
    expect(host.querySelector('[role="status"]')?.textContent).toContain(
      '正在加载专题数据',
    )
    expect(host.querySelector('.skip-link')?.getAttribute('href')).toBe(
      '#main-content',
    )
    expect(host.querySelector('main')?.id).toBe('main-content')

    app.unmount()
    host.remove()
  })
})
