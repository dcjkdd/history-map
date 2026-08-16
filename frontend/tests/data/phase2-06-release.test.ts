import { appendFileSync, cpSync, mkdtempSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  auditPhase2Release,
  loadPhase2ReleaseAuditInput,
  Phase2ReleaseAuditError,
  type Phase2ReleaseAuditInput,
} from '../../scripts/phase2-06-release-audit.ts'
import { verifyTerrainAssets } from '../../scripts/verify-terrain-assets.ts'

const frontendRoot = process.cwd()
const repositoryRoot = resolve(frontendRoot, '..')
const baseline = loadPhase2ReleaseAuditInput(repositoryRoot)

function cloneInput(): Phase2ReleaseAuditInput {
  return structuredClone(baseline)
}

function issuesFor(input: Phase2ReleaseAuditInput): string[] {
  try {
    auditPhase2Release(input)
    return []
  } catch (error) {
    if (error instanceof Phase2ReleaseAuditError) return error.issues
    throw error
  }
}

function source(input: Phase2ReleaseAuditInput, id: string) {
  return input.registry.sources.find((entry) => entry.id === id)!
}

function record(input: Phase2ReleaseAuditInput, id: string) {
  return input.registry.records.find((entry) => entry.id === id)!
}

describe('PHASE2-06 二期内容与空间发布门禁', () => {
  it('成功夹具覆盖 2 条来源、10 条记录、正式审核边界和运行时映射', () => {
    expect(auditPhase2Release(cloneInput())).toMatchObject({
      sourceCount: 2,
      recordCount: 10,
    })
  })

  it('F01：DEM 缺许可名或许可链接时按来源 ID/字段失败', () => {
    const input = cloneInput()
    const dem = source(input, 'P2SRC-COPERNICUS-GLO90-2021-01')
    dem.license.name = ''
    dem.license.url = ''

    expect(issuesFor(input)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`[${dem.id}] license.name`),
        expect.stringContaining(`[${dem.id}] license.url`),
      ]),
    )
  })

  it('F02：DEM 缺 Copernicus 完整署名或免责声明时失败', () => {
    const input = cloneInput()
    const dem = source(input, 'P2SRC-COPERNICUS-GLO90-2021-01')
    dem.license.attribution = 'Copernicus'

    expect(issuesFor(input)).toContain(
      `[${dem.id}] license.attribution: 缺少 Copernicus 完整署名或责任免责声明`,
    )
  })

  it('F03：行政边界缺双层许可、再分发或署名判定时失败', () => {
    const input = cloneInput()
    const boundary = source(
      input,
      'P2SRC-GEOBOUNDARIES-CHN-ADM1-9469F09-01',
    )
    boundary.license.name = 'CC BY 4.0'
    boundary.license.redistribution = 'unknown'
    boundary.license.attribution = 'unknown'

    expect(issuesFor(input)).toContain(
      `[${boundary.id}] license: 缺少 CC BY 4.0、上游 Public Domain、再分发或署名判定`,
    )
  })

  it('F04：解释性通道几何或图层缺审核映射时失败', () => {
    const input = cloneInput()
    const corridor = record(
      input,
      'P2R-CORRIDOR-EAST-GUANZHONG-DISPLAY-01',
    )
    corridor.releaseMappings = corridor.releaseMappings.filter(
      (mapping) => mapping.id !== 'phase2-east-guanzhong-corridor-band',
    )

    expect(issuesFor(input)).toContain(
      `[${corridor.id}] releaseMappings.MAP_LAYER:phase2-east-guanzhong-corridor-band: 缺少已发布对象审核映射`,
    )
  })

  it('F05：距离缺方法、半径、取整或免责声明时失败', () => {
    const input = cloneInput()
    const distance = record(input, 'P2R-DISTANCE-HAVERSINE-MODERN-01')
    distance.method = {
      name: 'PLANAR',
      earthRadiusKm: 0,
      roundingKm: 1,
      unit: 'mile',
      approximateLabelRequired: false,
      disclaimer: '',
    }

    expect(issuesFor(input)).toContain(
      `[${distance.id}] method: 缺少 Haversine、6371.0088 km、最近 5 km、约略或历史里程免责声明`,
    )
  })

  it('F06：任一距离输出缺“现代代表点”或“约”时失败', () => {
    const input = cloneInput()
    const distance = record(input, 'P2R-DISTANCE-HAVERSINE-MODERN-01')
    distance.outputs![0]!.label = '历史道路距离 120 公里'

    expect(issuesFor(input)).toContain(
      `[${distance.id}] outputs.route-yan-westward-01: 必须包含“现代代表点”“直线距离”“约”和批准公里数`,
    )
  })

  it('F07：解释性通道或路线被升级为确定历史语义时失败', () => {
    const input = cloneInput()
    const corridor = record(
      input,
      'P2R-CORRIDOR-EAST-GUANZHONG-DISPLAY-01',
    )
    corridor.semantics.certainty = 'FORMAL_UNCERTAIN'
    corridor.semantics.displayOnly = false
    corridor.semantics.prohibitedInterpretations = []

    expect(issuesFor(input)).toContain(
      `[${corridor.id}] semantics: 确定性、displayOnly 或禁止解释边界错误`,
    )
  })

  it('F08：发布记录或引用为 PENDING/REJECTED 时失败', () => {
    const input = cloneInput()
    const corridor = record(
      input,
      'P2R-CORRIDOR-EAST-GUANZHONG-DISPLAY-01',
    )
    corridor.review.status = 'PENDING_REVIEW'
    corridor.reviewRefs.push('geography-guanzhong-corridor')

    expect(issuesFor(input)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`[${corridor.id}] review:`),
        expect.stringContaining(
          `[${corridor.id}] reviewRefs.geography-guanzhong-corridor`,
        ),
      ]),
    )
  })

  it('F09：正式数据、审核资料或 manifest hash 漂移时失败', () => {
    const input = cloneInput()
    input.artifactHashes['frontend/public/data/anshi/mvp-v1.json'] = '0'.repeat(64)

    expect(issuesFor(input)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          '[frontend/public/data/anshi/mvp-v1.json] sha256:',
        ),
      ]),
    )
  })

  it('F10：manifest 清单漂移时失败，实际资产字节漂移也由闭包脚本拒绝', async () => {
    const input = cloneInput()
    input.manifest.assets.pop()
    expect(issuesFor(input)).toContain(
      '[phase2-02-glo90-topdown] manifest.assets: 必须保持 15 个源输入和 80 个输出',
    )

    const temporaryRoot = mkdtempSync('/private/tmp/history-map-phase2-06-assets-')
    const copied = resolve(temporaryRoot, 'terrain')
    try {
      cpSync(resolve(frontendRoot, 'public/terrain/phase2-02'), copied, {
        recursive: true,
      })
      appendFileSync(resolve(copied, 'color-relief.png'), Buffer.from([0]))
      await expect(verifyTerrainAssets(copied)).rejects.toThrow(
        'size mismatch: color-relief.png',
      )
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  }, 15_000)

  it('F11：跟踪文件中的私钥、Token 或内部许可数据标记必须失败且不回显值', () => {
    const input = cloneInput()
    input.trackedTextFiles.push({
      path: 'fixtures/leaked.env',
      contents: 'INTERNAL_' + 'LICENSE_DATA=restricted',
    })

    const issues = issuesFor(input)
    expect(issues).toContain(
      '[TRACKED:fixtures/leaked.env] secretScan.internal-license-data: 检出高置信秘密或内部许可数据标记',
    )
    expect(issues.join('\n')).not.toContain('restricted')
  })

  it('F14：正式集合数量或 5/3/3/6 不确定性边界漂移时失败', () => {
    const input = cloneInput()
    input.dataset.places.features[0]!.properties.certainty = 'HIGH'
    input.dataset.events.pop()

    expect(issuesFor(input)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('[formal:Place] certainty/count:'),
        expect.stringContaining('[formal:Event] precision/count:'),
      ]),
    )
  })
})
