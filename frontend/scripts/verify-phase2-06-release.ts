import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  auditPhase2Release,
  loadPhase2ReleaseAuditInput,
  Phase2ReleaseAuditError,
} from './phase2-06-release-audit.ts'

const frontendRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const repositoryRoot = resolve(frontendRoot, '..')

try {
  const report = auditPhase2Release(loadPhase2ReleaseAuditInput(repositoryRoot))
  console.log(
    `PHASE2-06 发布门禁通过：${report.sourceCount} 条空间来源、${report.recordCount} 条发布记录、${report.mappingCount} 项运行时映射；已扫描 ${report.trackedTextFileCount} 个跟踪/待跟踪文本文件。`,
  )
  console.log(
    '正式 5/3/3/6 不确定性边界、9/5/2 待审/拒绝状态、五项冻结 hash、地形 manifest、许可/署名、离线依赖与 PHASE2-03/04 审核映射均保持。',
  )
} catch (error) {
  if (error instanceof Phase2ReleaseAuditError) {
    console.error(error.message)
    error.issues.forEach((issue) => console.error(`- ${issue}`))
    process.exitCode = 1
  } else {
    throw error
  }
}
