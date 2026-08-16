import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, posix, relative, resolve, sep } from 'node:path'

import { findSecretIssues, type TextFile } from './phase2-06-release-audit.ts'

export interface Phase2StaticAuditReport {
  base: string
  fileCount: number
  textFileCount: number
  workerFile: string
}

export class Phase2StaticAuditError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(`PHASE2-06 静态闭包失败（${issues.length} 项）`)
    this.name = 'Phase2StaticAuditError'
    this.issues = issues
  }
}

const ALLOWED_EXECUTABLE_URL_HOSTS = new Set([
  'www.naturalearthdata.com',
  'www.geoboundaries.org',
  'www.smx.gov.cn',
  'www.lingbao.gov.cn',
  'news.gmw.cn',
  'zrzyt.xinjiang.gov.cn',
  'www.wushan.gov.cn',
  'www.shaanxi.gov.cn',
  'maplibre.org',
  'www.w3.org',
  'vuejs.org',
  'wiki.openstreetmap.org',
])

const ALLOWED_EXECUTABLE_URLS = new Set([
  'https://github.com/mapbox/mapbox-gl-js/issues/2907',
  'https://github.com/maplibre/maplibre-gl-js/blob/v6.0.0/LICENSE.txt',
])

function normalizeBase(base: string): string {
  if (!base.startsWith('/') || !base.endsWith('/') || base.includes('..')) {
    throw new Error(`无效静态 base：${base}`)
  }
  return base.replace(/\/{2,}/g, '/')
}

function listFiles(root: string, current = root): string[] {
  return readdirSync(current).flatMap((entry) => {
    const path = resolve(current, entry)
    if (statSync(path).isDirectory()) return listFiles(root, path)
    return [relative(root, path).split(sep).join('/')]
  })
}

export function loadStaticBundleFiles(root: string): Map<string, Buffer> {
  return new Map(
    listFiles(root).map((path) => [path, readFileSync(resolve(root, path))]),
  )
}

function asTextFiles(files: Map<string, Buffer>): TextFile[] {
  return [...files].flatMap(([path, contents]) =>
    contents.includes(0) ? [] : [{ path, contents: contents.toString('utf8') }],
  )
}

function executableTextFiles(files: readonly TextFile[]): TextFile[] {
  return files.filter((file) => /(?:^|\/)index\.html$|\.(?:js|mjs|css)$/u.test(file.path))
}

function stripQuery(value: string): string {
  return value.split(/[?#]/, 1)[0] ?? value
}

function resolveHtmlAsset(path: string, base: string): string | undefined {
  const clean = stripQuery(path)
  if (!clean || clean.startsWith('data:') || clean.startsWith('#')) return undefined
  if (/^https?:\/\//iu.test(clean) || clean.startsWith('//')) return undefined
  if (clean.startsWith('/')) {
    if (!clean.startsWith(base)) return `!BASE!${clean}`
    return clean.slice(base.length)
  }
  return posix.normalize(clean)
}

function externalUrls(files: readonly TextFile[]): Array<{ path: string; url: string }> {
  const matches: Array<{ path: string; url: string }> = []
  const pattern = /https?:\/\/[^\s"'`<>\\)]+/giu
  for (const file of executableTextFiles(files)) {
    pattern.lastIndex = 0
    for (const match of file.contents.matchAll(pattern)) {
      if (match[0]) matches.push({ path: file.path, url: match[0] })
    }
  }
  return matches
}

export function auditPhase2StaticBundle(
  files: Map<string, Buffer>,
  requestedBase: string,
): Phase2StaticAuditReport {
  const issues: string[] = []
  const base = normalizeBase(requestedBase)
  const paths = new Set(files.keys())
  const textFiles = asTextFiles(files)
  const index = files.get('index.html')?.toString('utf8')

  for (const required of [
    'index.html',
    'data/anshi/mvp-v1.json',
    'terrain/phase2-02/manifest.json',
    'terrain/phase2-02/color-relief.png',
    'terrain/phase2-02/provinces.geojson',
  ]) {
    if (!paths.has(required)) {
      issues.push(`[bundle:${base}] files.${required}: 必需静态文件缺失`)
    }
  }

  if (index) {
    const tagUrlPattern = /<(?:script|link|img)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/giu
    for (const match of index.matchAll(tagUrlPattern)) {
      const url = match[1] ?? ''
      if (/^https?:\/\//iu.test(url) || url.startsWith('//')) {
        issues.push(`[bundle:${base}] index.html.runtimeExternal: 外部标签依赖 ${url}`)
        continue
      }
      const resolved = resolveHtmlAsset(url, base)
      if (resolved?.startsWith('!BASE!')) {
        issues.push(`[bundle:${base}] index.html.base: ${url} 越过预期 base`)
      } else if (resolved && !paths.has(resolved)) {
        issues.push(`[bundle:${base}] index.html.asset: ${url} 对应文件 ${resolved} 缺失`)
      }
    }
  }

  for (const file of textFiles.filter((candidate) => candidate.path.endsWith('.css'))) {
    const pattern = /url\(\s*["']?([^"')]+)["']?\s*\)/giu
    for (const match of file.contents.matchAll(pattern)) {
      const url = match[1] ?? ''
      if (/^https?:\/\//iu.test(url) || url.startsWith('//')) {
        issues.push(`[bundle:${base}] ${file.path}.runtimeExternal: CSS 外部资源 ${url}`)
        continue
      }
      if (url.startsWith('data:') || url.startsWith('#')) continue
      const asset = posix.normalize(posix.join(posix.dirname(file.path), stripQuery(url)))
      if (!paths.has(asset)) {
        issues.push(`[bundle:${base}] ${file.path}.asset: CSS 依赖 ${asset} 缺失`)
      }
    }
  }

  for (const occurrence of externalUrls(textFiles)) {
    try {
      const host = new URL(occurrence.url).hostname
      if (
        !ALLOWED_EXECUTABLE_URL_HOSTS.has(host) &&
        !ALLOWED_EXECUTABLE_URLS.has(occurrence.url)
      ) {
        issues.push(
          `[bundle:${base}] ${occurrence.path}.runtimeExternal: 未登记可执行外网 URL 主机 ${host}`,
        )
      }
    } catch {
      issues.push(`[bundle:${base}] ${occurrence.path}.runtimeExternal: 无法解析 URL`)
    }
  }

  const executableText = executableTextFiles(textFiles)
    .map((file) => file.contents)
    .join('\n')
  for (const marker of ['data/anshi/mvp-v1.json', 'terrain/phase2-02']) {
    if (!executableText.includes(marker)) {
      issues.push(`[bundle:${base}] runtimePaths.${marker}: 构建未保留本地数据/地形入口`)
    }
  }
  if (base !== '/' && !executableText.includes(base)) {
    issues.push(`[bundle:${base}] runtimePaths.base: 构建中缺少非根 base`)
  }

  const workerFiles = [...paths].filter((path) =>
    /^assets\/maplibre-gl-worker-.*\.(?:js|mjs)$/u.test(path),
  )
  if (workerFiles.length !== 1) {
    issues.push(`[bundle:${base}] worker.count: 预期 1 个，实际 ${workerFiles.length} 个`)
  }

  issues.push(...findSecretIssues(textFiles, `BUNDLE:${base}`))

  if (issues.length > 0) throw new Phase2StaticAuditError(issues)

  return {
    base,
    fileCount: files.size,
    textFileCount: textFiles.length,
    workerFile: workerFiles[0]!,
  }
}

export function auditPhase2StaticBundleDirectory(
  root: string,
  base: string,
): Phase2StaticAuditReport {
  return auditPhase2StaticBundle(loadStaticBundleFiles(root), base)
}
