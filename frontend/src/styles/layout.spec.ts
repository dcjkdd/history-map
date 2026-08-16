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
const mapCss = readFileSync(
  resolve(process.cwd(), 'src/styles/map.css'),
  'utf8',
)

describe('MVP-09 desktop layout contract', () => {
  it('PHASE2-05 宽屏和 1024px 桌面使用地图、短详情与跨列紧凑时间轴', () => {
    expect(layoutCss).toContain('"map detail"')
    expect(layoutCss).toContain('"timeline timeline"')
    expect(layoutCss).toContain(
      'grid-template-columns: minmax(0, 1fr) clamp(17.5rem, 22vw, 20rem)',
    )
    expect(layoutCss).toContain(
      'grid-template-rows: clamp(35rem, calc(100dvh - 12.875rem), 41.25rem) auto',
    )
    expect(layoutCss).toContain('grid-template-columns: minmax(8.5rem, 10rem) minmax(0, 1fr)')
    expect(layoutCss).toContain('height: 100%')
    expect(layoutCss).toContain('overflow-y: auto')
    expect(responsiveCss).toContain('@media (max-width: 63rem)')
  })

  it('地图在桌面首屏使用动态高度，较窄窗口才切换为单列', () => {
    expect(layoutCss).toContain('grid-template-rows: auto minmax(0, 1fr)')
    expect(layoutCss).toContain('min-height: 0')
    expect(responsiveCss).toContain('"map"')
    expect(responsiveCss).toContain('"timeline"')
    expect(responsiveCss).toContain('"detail"')
  })

  it('所有按钮和链接都有统一可见键盘焦点', () => {
    expect(layoutCss).toContain('button:focus-visible')
    expect(layoutCss).toContain('input:focus-visible')
    expect(layoutCss).toContain('a:focus-visible')
    expect(layoutCss).toContain('summary:focus-visible')
    expect(layoutCss).toContain('outline: 3px solid #236785')
  })

  it('地图说明进入外置工具条，署名展开与比例尺保留水平避让带', () => {
    expect(mapCss).toContain('.history-map__toolbar-row')
    expect(mapCss).toContain('.history-map__toolbar-panel')
    expect(mapCss).toContain('grid-template-rows: auto minmax(0, 1fr)')
    expect(mapCss).toContain('.history-map .maplibregl-ctrl-bottom-right')
    expect(mapCss).toContain('left: 6rem')
    expect(mapCss).toContain('max-height: 8rem')
    expect(mapCss).not.toContain('bottom: 11rem')
    expect(mapCss).not.toContain('.history-map__tongguan-note')
  })
})
