/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const layoutCss = readFileSync(
  resolve(process.cwd(), 'src/styles/layout.css'),
  'utf8',
)
const responsiveCss = readFileSync(
  resolve(process.cwd(), 'src/styles/responsive.css'),
  'utf8',
)

describe('MVP-09 desktop layout contract', () => {
  it('宽屏和 1024px 桌面使用地图/时间轴加可滚动详情侧栏', () => {
    expect(layoutCss).toContain('"map detail"')
    expect(layoutCss).toContain('"timeline detail"')
    expect(layoutCss).toContain('grid-template-columns: minmax(0, 1fr) minmax(18rem, 22rem)')
    expect(layoutCss).toContain('max-height: calc(100vh - 2rem)')
    expect(layoutCss).toContain('overflow-y: auto')
    expect(responsiveCss).toContain('@media (max-width: 63rem)')
  })

  it('地图保留桌面最小高度，较窄窗口才切换为单列', () => {
    expect(layoutCss).toContain('grid-template-rows: auto minmax(34rem, 1fr)')
    expect(layoutCss).toContain('min-height: 34rem')
    expect(responsiveCss).toContain('"map"')
    expect(responsiveCss).toContain('"timeline"')
    expect(responsiveCss).toContain('"detail"')
  })

  it('所有按钮和链接都有统一可见键盘焦点', () => {
    expect(layoutCss).toContain('button:focus-visible')
    expect(layoutCss).toContain('input:focus-visible')
    expect(layoutCss).toContain('a:focus-visible')
    expect(layoutCss).toContain('outline: 3px solid #236785')
  })
})
