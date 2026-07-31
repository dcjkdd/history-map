import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { validateMapLibreWorkerBundle } from '../../scripts/verify-worker-bundle.ts'

const temporaryDirectories: string[] = []

function createAssetsDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'history-map-worker-'))
  const assetsDirectory = join(directory, 'assets')
  mkdirSync(assetsDirectory)
  temporaryDirectories.push(directory)
  return assetsDirectory
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

describe('MapLibre worker 生产产物校验', () => {
  it('接受没有外部模块依赖的自包含 worker', () => {
    const assetsDirectory = createAssetsDirectory()
    writeFileSync(
      join(assetsDirectory, 'maplibre-gl-worker-example.js'),
      'self.onmessage = () => undefined\n',
    )

    expect(validateMapLibreWorkerBundle(assetsDirectory)).toMatchObject({
      dependencyCount: 0,
    })
  })

  it('拒绝引用未随构建产物发布的相对模块', () => {
    const assetsDirectory = createAssetsDirectory()
    writeFileSync(
      join(assetsDirectory, 'maplibre-gl-worker-example.mjs'),
      "import { Actor } from './maplibre-gl-shared.mjs'\nvoid Actor\n",
    )

    expect(() => validateMapLibreWorkerBundle(assetsDirectory)).toThrow(
      /引用了缺失模块 .*maplibre-gl-shared\.mjs/,
    )
  })
})
