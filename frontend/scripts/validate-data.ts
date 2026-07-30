import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  validateMvpDataset,
  validateMvpIntegrity,
} from '../src/domain/mvpValidation.ts'
import type {
  MvpDataError,
  MvpIntegrityIssue,
} from '../src/domain/mvpTypes.ts'

const DEFAULT_DATASET_PATH = fileURLToPath(
  new URL('../public/data/anshi/mvp-v1.json', import.meta.url),
)

function displayPath(filePath: string): string {
  const relativePath = filePath.startsWith(`${process.cwd()}/`)
    ? filePath.slice(process.cwd().length + 1)
    : filePath

  return relativePath
}

function printContractErrors(errors: readonly MvpDataError[]): void {
  errors.forEach((error) => {
    console.error(`[ERROR] ${error.code} ${error.path}: ${error.message}`)
  })
}

function printIntegrityIssues(issues: readonly MvpIntegrityIssue[]): void {
  issues.forEach((issue) => {
    const output = `[${issue.severity}] ${issue.code} ${issue.path}: ${issue.message}`

    if (issue.severity === 'ERROR') {
      console.error(output)
    } else {
      console.warn(output)
    }
  })
}

function main(): void {
  const requestedPath = process.argv[2]
  const datasetPath = requestedPath
    ? resolve(process.cwd(), requestedPath)
    : DEFAULT_DATASET_PATH
  let source: string

  try {
    source = readFileSync(datasetPath, 'utf8')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(
      `[ERROR] INVALID_DATASET $: 无法读取 ${displayPath(datasetPath)}：${message}`,
    )
    process.exitCode = 1
    return
  }

  let input: unknown

  try {
    input = JSON.parse(source)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(
      `[ERROR] INVALID_JSON $: ${displayPath(datasetPath)} 不是合法 JSON：${message}`,
    )
    process.exitCode = 1
    return
  }

  const contractResult = validateMvpDataset(input)

  if (!contractResult.ok) {
    printContractErrors(contractResult.errors)
    console.error(
      `数据校验失败：${displayPath(datasetPath)}（${contractResult.errors.length} 个错误）`,
    )
    process.exitCode = 1
    return
  }

  const integrityResult = validateMvpIntegrity(contractResult.data)
  printIntegrityIssues(integrityResult.issues)

  const errorCount = integrityResult.issues.filter(
    (issue) => issue.severity === 'ERROR',
  ).length
  const warningCount = integrityResult.issues.filter(
    (issue) => issue.severity === 'WARNING',
  ).length

  if (!integrityResult.ok) {
    console.error(
      `数据校验失败：${displayPath(datasetPath)}（${errorCount} 个错误，${warningCount} 个警告）`,
    )
    process.exitCode = 1
    return
  }

  console.log(
    `数据校验通过：${displayPath(datasetPath)}（${warningCount} 个警告）`,
  )
}

main()
