import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const STATIC_MODULE_PATTERN =
  /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s*)?["'](\.{1,2}\/[^"']+)["']/g
const DYNAMIC_IMPORT_PATTERN =
  /\bimport\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g

function displayPath(filePath: string): string {
  return relative(process.cwd(), filePath) || '.'
}

export function relativeModuleSpecifiers(source: string): readonly string[] {
  const specifiers = new Set<string>()

  for (const pattern of [STATIC_MODULE_PATTERN, DYNAMIC_IMPORT_PATTERN]) {
    pattern.lastIndex = 0

    for (const match of source.matchAll(pattern)) {
      const specifier = match[1]
      if (specifier) {
        specifiers.add(specifier)
      }
    }
  }

  return [...specifiers]
}

export interface WorkerBundleValidationResult {
  dependencyCount: number
  workerPath: string
}

export function validateMapLibreWorkerBundle(
  assetsDirectory: string,
): WorkerBundleValidationResult {
  if (!existsSync(assetsDirectory)) {
    throw new Error(`找不到构建产物目录 ${displayPath(assetsDirectory)}`)
  }

  const workerFiles = readdirSync(assetsDirectory).filter((fileName) =>
    /^maplibre-gl-worker-.*\.(?:js|mjs)$/.test(fileName),
  )

  if (workerFiles.length !== 1) {
    throw new Error(
      `预期恰好一个 MapLibre worker 产物，实际找到 ${workerFiles.length} 个：${workerFiles.join(', ') || '无'}`,
    )
  }

  const workerPath = resolve(assetsDirectory, workerFiles[0]!)
  const source = readFileSync(workerPath, 'utf8')
  const specifiers = relativeModuleSpecifiers(source)

  for (const specifier of specifiers) {
    const cleanSpecifier = specifier.split(/[?#]/, 1)[0]
    const dependencyPath = resolve(dirname(workerPath), cleanSpecifier)

    if (!existsSync(dependencyPath)) {
      throw new Error(
        `${displayPath(workerPath)} 引用了缺失模块 ${specifier}（解析为 ${displayPath(dependencyPath)}）`,
      )
    }
  }

  return {
    dependencyCount: specifiers.length,
    workerPath,
  }
}

function main(): void {
  const requestedDirectory = process.argv[2]
  const assetsDirectory = requestedDirectory
    ? resolve(process.cwd(), requestedDirectory)
    : fileURLToPath(new URL('../dist/assets/', import.meta.url))
  const result = validateMapLibreWorkerBundle(assetsDirectory)

  console.log(
    `MapLibre worker 产物校验通过：${displayPath(result.workerPath)}（${result.dependencyCount} 个相对依赖均存在）`,
  )
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isDirectExecution) {
  try {
    main()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[ERROR] INVALID_WORKER_BUNDLE: ${message}`)
    process.exitCode = 1
  }
}
