import { createApp, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import ErrorState from './ErrorState.vue'
import LoadingState from './LoadingState.vue'

describe('MVP-09 loading and error states', () => {
  it('加载状态使用可读的 live status', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(LoadingState)

    app.mount(host)

    expect(host.querySelector('[role="status"]')).not.toBeNull()
    expect(host.textContent).toContain('正在加载专题数据')
    expect(host.textContent).toContain('数据校验完成后显示')

    app.unmount()
    host.remove()
  })

  it('错误状态显示诊断信息、可重试并暴露正确禁用状态', async () => {
    const onRetry = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(ErrorState, {
      error: {
        code: 'INVALID_DATASET',
        message: '测试数据无效',
        path: '$.events[0]',
      },
      onRetry,
    })

    app.mount(host)
    const retryButton = host.querySelector<HTMLButtonElement>(
      '[aria-label="重试加载专题数据"]',
    )

    expect(host.querySelector('[role="alert"]')).not.toBeNull()
    expect(host.textContent).toContain('INVALID_DATASET')
    expect(host.textContent).toContain('$.events[0]')
    expect(retryButton?.disabled).toBe(false)
    retryButton?.click()
    await nextTick()
    expect(onRetry).toHaveBeenCalledTimes(1)

    app.unmount()
    host.remove()
  })

  it('重试进行中时按钮不可误触', async () => {
    const onRetry = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(ErrorState, {
      busy: true,
      error: { message: '测试错误' },
      onRetry,
    })

    app.mount(host)
    const retryButton = host.querySelector<HTMLButtonElement>(
      '[aria-label="重试加载专题数据"]',
    )

    expect(retryButton?.disabled).toBe(true)
    retryButton?.click()
    await nextTick()
    expect(onRetry).not.toHaveBeenCalled()

    app.unmount()
    host.remove()
  })
})
