import { MvpDataError } from '../domain/mvpTypes'
import type { MvpDataset } from '../domain/mvpTypes'
import { validateMvpDataset } from '../domain/mvpValidation'

const MVP_DATASET_URL = '/data/anshi/mvp-v1.json'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function loadMvpDataset(): Promise<MvpDataset> {
  let response: Response

  try {
    response = await fetch(MVP_DATASET_URL, {
      headers: {
        Accept: 'application/json',
      },
    })
  } catch (error) {
    throw new MvpDataError({
      code: 'NETWORK_ERROR',
      message: 'MVP 数据请求失败，请检查网络或静态资源配置',
      details: {
        cause: errorMessage(error),
      },
    })
  }

  if (!response.ok) {
    throw new MvpDataError({
      code: 'HTTP_ERROR',
      message: `MVP 数据请求失败：HTTP ${response.status}`,
      details: {
        status: response.status,
        statusText: response.statusText,
        url: response.url || MVP_DATASET_URL,
      },
    })
  }

  let responseText: string

  try {
    responseText = await response.text()
  } catch (error) {
    throw new MvpDataError({
      code: 'NETWORK_ERROR',
      message: '读取 MVP 数据响应体失败',
      details: {
        cause: errorMessage(error),
      },
    })
  }

  let input: unknown

  try {
    input = JSON.parse(responseText)
  } catch (error) {
    throw new MvpDataError({
      code: 'INVALID_JSON',
      message: 'MVP 数据不是合法 JSON',
      details: {
        cause: errorMessage(error),
      },
    })
  }

  const result = validateMvpDataset(input)

  if (!result.ok) {
    const firstError = result.errors[0]

    throw new MvpDataError({
      code: firstError?.code ?? 'INVALID_DATASET',
      message: firstError?.message ?? 'MVP 数据未通过运行时校验',
      path: firstError?.path ?? '$',
      details: result.errors.map((error) => ({
        code: error.code,
        message: error.message,
        path: error.path,
        details: error.details,
      })),
    })
  }

  return result.data
}
