import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  auditPhase2StaticBundleDirectory,
  Phase2StaticAuditError,
} from './phase2-06-static-audit.ts'
import { verifyTerrainAssets } from './verify-terrain-assets.ts'
import { validateMapLibreWorkerBundle } from './verify-worker-bundle.ts'

const frontendRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const rootDist = resolve(frontendRoot, 'dist')
const temporaryRoot = mkdtempSync('/private/tmp/history-map-phase2-06-')
const siteRoot = resolve(temporaryRoot, 'site-root')
const subpathDist = resolve(siteRoot, 'history-map')
const sourceData = resolve(frontendRoot, 'public/data/anshi/mvp-v1.json')

async function verifyBundle(root: string, base: string): Promise<void> {
  const report = auditPhase2StaticBundleDirectory(root, base)
  const worker = validateMapLibreWorkerBundle(resolve(root, 'assets'))
  await verifyTerrainAssets(resolve(root, 'terrain/phase2-02'))
  console.log(
    `PHASE2-06 静态闭包通过：base=${base}，${report.fileCount} 个文件、${report.textFileCount} 个文本文件，worker ${worker.dependencyCount} 个相对依赖完整。`,
  )
}

try {
  await verifyBundle(rootDist, '/')

  const vite = resolve(frontendRoot, 'node_modules/vite/bin/vite.js')
  const build = spawnSync(
    process.execPath,
    [
      vite,
      'build',
      '--base=/history-map/',
      `--outDir=${subpathDist}`,
      '--emptyOutDir',
    ],
    {
      cwd: frontendRoot,
      env: process.env,
      encoding: 'utf8',
    },
  )
  if (build.stdout) process.stdout.write(build.stdout)
  if (build.stderr) process.stderr.write(build.stderr)
  if (build.status !== 0) {
    throw new Error(`非根 base 构建失败，退出码 ${build.status ?? 'null'}`)
  }
  const deployedRootData = resolve(siteRoot, 'data/anshi/mvp-v1.json')
  mkdirSync(resolve(siteRoot, 'data/anshi'), { recursive: true })
  copyFileSync(sourceData, deployedRootData)
  if (!readFileSync(sourceData).equals(readFileSync(deployedRootData))) {
    throw new Error('非根站点根 /data/anshi/mvp-v1.json 与冻结正式 JSON 不一致')
  }
  await verifyBundle(subpathDist, '/history-map/')
  console.log('PHASE2-06 非根站点根数据闭包通过：/data/anshi/mvp-v1.json 与冻结正式 JSON 字节一致。')
} catch (error) {
  if (error instanceof Phase2StaticAuditError) {
    console.error(error.message)
    error.issues.forEach((issue) => console.error(`- ${issue}`))
  } else {
    console.error(error instanceof Error ? error.message : String(error))
  }
  process.exitCode = 1
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
