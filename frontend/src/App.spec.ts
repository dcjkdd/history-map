import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'

import App from './App.vue'

describe('App', () => {
  it('显示 MVP-00 页面壳的必要信息', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(App)

    app.mount(host)

    expect(host.querySelector('h1')?.textContent).toBe('中国古代战争地形地图')
    expect(host.querySelector('.topic-label')?.textContent).toBe(
      '当前专题 · 安史之乱',
    )
    expect(host.querySelector('[role="status"]')?.textContent).toBe('数据尚未加载')

    app.unmount()
    host.remove()
  })
})
