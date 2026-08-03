// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  auditContentRelease,
  ContentReleaseAuditError,
} from '../../scripts/audit-content-release'
import type { MvpDataset } from '../../src/domain/mvpTypes'

function loadInputs(): {
  dataset: MvpDataset
  sourceNotes: string
  contentReview: string
} {
  return {
    dataset: JSON.parse(
      readFileSync(
        resolve(process.cwd(), 'public/data/anshi/mvp-v1.json'),
        'utf8',
      ),
    ) as MvpDataset,
    sourceNotes: readFileSync(
      resolve(process.cwd(), '../data/curated/anshi-mvp-source-notes.md'),
      'utf8',
    ),
    contentReview: readFileSync(
      resolve(process.cwd(), '../docs/reviews/anshi-mvp-content-review.md'),
      'utf8',
    ),
  }
}

function changeReviewRow(
  markdown: string,
  prefix: string,
  change: (line: string) => string,
): string {
  let changed = false
  const result = markdown
    .split('\n')
    .map((line) => {
      if (!line.startsWith(prefix)) {
        return line
      }
      changed = true
      return change(line)
    })
    .join('\n')

  expect(changed, prefix).toBe(true)
  return result
}

function expectAuditFailure(
  run: () => unknown,
  expectedIssue: string,
): void {
  try {
    run()
    throw new Error('Expected content audit to fail')
  } catch (error) {
    expect(error).toBeInstanceOf(ContentReleaseAuditError)
    expect((error as ContentReleaseAuditError).issues.join('\n')).toContain(
      expectedIssue,
    )
  }
}

describe('MVP-11 内容发布映射审计', () => {
  it('逐项覆盖正式实体、运行时 Claim、Citation、Source 和独立 RouteSegment', () => {
    const report = auditContentRelease(loadInputs())

    expect(report.releaseCounts).toEqual({
      Place: 5,
      Event: 6,
      Geography: 3,
      RouteSegment: 3,
      Claim: 33,
      Citation: 36,
      Source: 19,
    })
    expect(report.releaseReviewCount).toBe(105)
    expect(report.routePlanCount).toBe(2)
    expect(report.totalReviewCount).toBe(125)
    expect(
      report.outsideReleaseRows.map((row) => row.status).sort(),
    ).toEqual([
      'APPROVED',
      'APPROVED',
      'APPROVED',
      'APPROVED',
      'PENDING_REVIEW',
      'PENDING_REVIEW',
      'PENDING_REVIEW',
      'PENDING_REVIEW',
      'PENDING_REVIEW',
      'PENDING_REVIEW',
      'PENDING_REVIEW',
      'PENDING_REVIEW',
      'PENDING_REVIEW',
      'PENDING_SOURCE',
      'PENDING_SOURCE',
      'PENDING_SOURCE',
      'PENDING_SOURCE',
      'PENDING_SOURCE',
      'REJECTED',
      'REJECTED',
    ])
  })

  it('RoutePlan 仍在时，缺失实际 RouteSegment 审核行也会失败', () => {
    const inputs = loadInputs()
    inputs.contentReview = changeReviewRow(
      inputs.contentReview,
      '| RouteSegment | route-tang-advance-01 |',
      () => '',
    )

    expectAuditFailure(
      () => auditContentRelease(inputs),
      '正式发布记录缺少审核行：RouteSegment:route-tang-advance-01',
    )
  })

  it('正式记录的审核行不是 APPROVED 时失败', () => {
    const inputs = loadInputs()
    inputs.contentReview = changeReviewRow(
      inputs.contentReview,
      '| Event | event-04-lingbao-engagement |',
      (line) => line.replace('| APPROVED |', '| PENDING_REVIEW |'),
    )

    expectAuditFailure(
      () => auditContentRelease(inputs),
      '正式发布记录未获 APPROVED：Event:event-04-lingbao-engagement',
    )
  })

  it('Claim 的 entityType/entityId/field/citationIds 映射错误时失败', () => {
    const inputs = loadInputs()
    inputs.sourceNotes = inputs.sourceNotes.replace(
      '| claim-route-tang-advance-segment-01-inference-01 | RouteSegment | route-tang-advance-01 |',
      '| claim-route-tang-advance-segment-01-inference-01 | RouteSegment | route-yan-westward-01 |',
    )

    expectAuditFailure(
      () => auditContentRelease(inputs),
      '正式 Claim 映射错误：claim-route-tang-advance-segment-01-inference-01',
    )
  })

  it('空间 Source 缺少许可证链接时失败', () => {
    const inputs = loadInputs()
    const dataset = structuredClone(inputs.dataset)
    const source = dataset.sources.find(
      (candidate) => candidate.id === 'SRC-SPATIAL-01',
    )
    expect(source?.provenance).toBeTruthy()
    if (source?.provenance) {
      source.provenance.licenseUrl = null
    }

    expectAuditFailure(
      () => auditContentRelease({ ...inputs, dataset }),
      '空间 Source SRC-SPATIAL-01 缺少许可证链接',
    )
  })

  it('Citation 悬空引用不存在的 Source 时失败', () => {
    const inputs = loadInputs()
    const dataset = structuredClone(inputs.dataset)
    dataset.citations[0].sourceId = 'SRC-MISSING'

    expectAuditFailure(
      () => auditContentRelease({ ...inputs, dataset }),
      `Citation ${dataset.citations[0].id} 悬空引用 Source SRC-MISSING`,
    )
  })
})
