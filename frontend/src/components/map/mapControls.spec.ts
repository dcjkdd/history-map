import { createApp, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import LayerControl from './LayerControl.vue'
import MapLegend from './MapLegend.vue'

describe('MVP-05 map controls', () => {
  it('渲染四组键盘可操作图层开关并发出对应组名', async () => {
    const onToggle = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(LayerControl, {
      onToggle,
      visibility: {
        hydrography: true,
        geography: true,
        places: true,
        routes: true,
      },
    })

    app.mount(host)
    const inputs = host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

    expect(inputs).toHaveLength(4)
    expect(
      host.querySelector('[data-layer-group="hydrography"]'),
    ).not.toBeNull()
    expect(
      host.querySelector('[data-layer-group="routes"]'),
    ).not.toBeNull()
    expect(host.textContent).toContain('行动路线')
    expect(host.textContent).toContain('解释性示意')

    inputs[2]?.dispatchEvent(new Event('change'))
    await nextTick()

    expect(onToggle).toHaveBeenCalledWith('places')

    app.unmount()
    host.remove()
  })

  it('图例说明地点、地理要素及低可信度外圈语义', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(MapLegend)

    app.mount(host)

    expect(host.textContent).toContain('城池')
    expect(host.textContent).toContain('关隘')
    expect(host.textContent).toContain('现代河流概览')
    expect(host.textContent).toContain('现代总体流向')
    expect(host.textContent).toContain('秦岭相关山地')
    expect(host.textContent).toContain('东入关中解释性通道')
    expect(host.textContent).toContain('唐军')
    expect(host.textContent).toContain('燕军')
    expect(host.textContent).toContain('朝廷转移')
    expect(host.textContent).toContain('虚线与粗细区分主体')
    expect(host.textContent).toContain('首现加粗')
    expect(host.textContent).toContain('LOW、DISPUTED 或 UNKNOWN')
    expect(host.textContent).toContain('INFERENCE / LOW')
    expect(host.textContent).toContain('不应理解为精确历史坐标或行军轨迹')
    expect(host.textContent).toContain('固定 22px')

    app.unmount()
    host.remove()
  })
})
