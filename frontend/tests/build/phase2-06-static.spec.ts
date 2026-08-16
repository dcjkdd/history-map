import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  auditPhase2StaticBundle,
  Phase2StaticAuditError,
} from '../../scripts/phase2-06-static-audit.ts'
import { validateMapLibreWorkerBundle } from '../../scripts/verify-worker-bundle.ts'

function staticFixture(base: '/' | '/history-map/' = '/') {
  const app = [
    `const base = ${JSON.stringify(base)};`,
    `const data = 'data/anshi/mvp-v1.json';`,
    `const terrain = 'terrain/phase2-02';`,
  ].join('\n')
  return new Map<string, Buffer>([
    [
      'index.html',
      Buffer.from(
        `<link rel="stylesheet" href="${base}assets/app.css"><script type="module" src="${base}assets/app.js"></script>`,
      ),
    ],
    ['assets/app.css', Buffer.from('body{color:#111}')],
    ['assets/app.js', Buffer.from(app)],
    ['assets/maplibre-gl-worker-test.js', Buffer.from('self.onmessage=()=>{}')],
    ['data/anshi/mvp-v1.json', Buffer.from('{}')],
    ['terrain/phase2-02/manifest.json', Buffer.from('{}')],
    ['terrain/phase2-02/color-relief.png', Buffer.from([0])],
    ['terrain/phase2-02/provinces.geojson', Buffer.from('{}')],
  ])
}

function issuesFor(files: Map<string, Buffer>, base: '/' | '/history-map/') {
  try {
    auditPhase2StaticBundle(files, base)
    return []
  } catch (error) {
    if (error instanceof Phase2StaticAuditError) return error.issues
    throw error
  }
}

describe('PHASE2-06 双 base 静态闭包', () => {
  it('根 base 与 /history-map/ 成功夹具都能闭包', () => {
    expect(auditPhase2StaticBundle(staticFixture('/'), '/')).toMatchObject({
      base: '/',
      workerFile: 'assets/maplibre-gl-worker-test.js',
    })
    expect(
      auditPhase2StaticBundle(staticFixture('/history-map/'), '/history-map/'),
    ).toMatchObject({
      base: '/history-map/',
      workerFile: 'assets/maplibre-gl-worker-test.js',
    })
  })

  it('F11：构建产物中的高置信秘密必须失败且不回显值', () => {
    const files = staticFixture('/')
    files.set(
      'assets/app.js',
      Buffer.from(
        `${files.get('assets/app.js')!.toString('utf8')}\n${'INTERNAL_' + 'LICENSE_DATA=do_not_echo'}`,
      ),
    )

    const issues = issuesFor(files, '/')
    expect(issues).toContain(
      '[BUNDLE:/:assets/app.js] secretScan.internal-license-data: 检出高置信秘密或内部许可数据标记',
    )
    expect(issues.join('\n')).not.toContain('do_not_echo')
  })

  it('F12：HTML、CSS 或可执行脚本出现未登记外网依赖时失败', () => {
    const files = staticFixture('/history-map/')
    files.set(
      'assets/app.js',
      Buffer.from(
        `${files.get('assets/app.js')!.toString('utf8')}\nfetch('https://tiles.example.test/private/{z}/{x}/{y}.png')`,
      ),
    )

    expect(issuesFor(files, '/history-map/')).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'assets/app.js.runtimeExternal: 未登记可执行外网 URL 主机 tiles.example.test',
        ),
      ]),
    )
  })

  it('F13：非根 base 越界和 worker 相对依赖缺失都必须失败', () => {
    const files = staticFixture('/history-map/')
    files.set(
      'index.html',
      Buffer.from(
        '<script type="module" src="/assets/app.js"></script>',
      ),
    )
    expect(issuesFor(files, '/history-map/')).toEqual(
      expect.arrayContaining([
        expect.stringContaining('index.html.base: /assets/app.js 越过预期 base'),
      ]),
    )

    const temporaryRoot = mkdtempSync('/private/tmp/history-map-phase2-06-worker-')
    try {
      mkdirSync(resolve(temporaryRoot, 'assets'))
      writeFileSync(
        resolve(temporaryRoot, 'assets/maplibre-gl-worker-test.js'),
        'import "./missing-worker-module.js";',
      )
      expect(() =>
        validateMapLibreWorkerBundle(resolve(temporaryRoot, 'assets')),
      ).toThrow('引用了缺失模块 ./missing-worker-module.js')
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })
})
