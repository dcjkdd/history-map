import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve, relative } from 'node:path'

const EXPECTED_TILE_COUNTS = new Map([
  [5, 2],
  [6, 2],
  [7, 6],
  [8, 20],
  [9, 48],
])
const EXPECTED_ASSET_COUNT = 80
const MAX_ASSET_BYTES = 10 * 1024 * 1024
const COPERNICUS_CREDIT =
  'produced using Copernicus WorldDEM-90 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved'
const COPERNICUS_DISCLAIMER =
  'The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability for any use of the Copernicus WorldDEM™-90.'

interface ManifestAsset {
  path: string
  bytes: number
  sha256: string
}

interface TerrainManifest {
  schemaVersion: string
  assetSetId: string
  runtimeNetworkRequired: boolean
  assetBudgetBytes: number
  totalBytes: number
  assets: ManifestAsset[]
  terrainTiles: Array<{ zoom: number; tiles: number }>
  dem: { sourceInputsCommitted: boolean; inputs: ManifestAsset[] }
  licenses: {
    copernicus: {
      access: string
      requiredAttribution: string
      requiredDisclaimer: string
    }
    geoBoundaries: {
      distributionLicense: string
      upstreamBoundaryMetadataLicense: string
      requiredAttribution: string
    }
  }
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

async function sha256(path: string): Promise<string> {
  return createHash('sha256').update(await readFile(path)).digest('hex')
}

async function listFiles(root: string, current = root): Promise<string[]> {
  const files: string[] = []
  for (const entry of await readdir(current)) {
    const path = resolve(current, entry)
    if ((await stat(path)).isDirectory()) {
      files.push(...(await listFiles(root, path)))
    } else {
      files.push(relative(root, path))
    }
  }
  return files.sort()
}

export async function verifyTerrainAssets(assetRoot: string): Promise<void> {
  const root = resolve(assetRoot)
  const manifest = JSON.parse(
    await readFile(resolve(root, 'manifest.json'), 'utf8'),
  ) as TerrainManifest

  invariant(manifest.schemaVersion === '1.0', 'unexpected terrain manifest schema')
  invariant(
    manifest.assetSetId === 'phase2-02-glo90-topdown',
    'unexpected terrain asset set',
  )
  invariant(manifest.runtimeNetworkRequired === false, 'runtime network must be disabled')
  invariant(manifest.dem.sourceInputsCommitted === false, 'source COGs must not be committed')
  invariant(manifest.dem.inputs.length === 15, 'manifest must record 15 GLO-90 inputs')
  invariant(manifest.assets.length === EXPECTED_ASSET_COUNT, 'unexpected asset count')
  invariant(manifest.totalBytes <= MAX_ASSET_BYTES, 'terrain assets exceed the 10 MiB budget')
  invariant(manifest.assetBudgetBytes === MAX_ASSET_BYTES, 'manifest budget has drifted')
  invariant(
    manifest.licenses.copernicus.access === 'GLO-90 Full, Free and Open' &&
      manifest.licenses.copernicus.requiredAttribution === COPERNICUS_CREDIT,
    'Copernicus license or required credit is incomplete',
  )
  invariant(
    manifest.licenses.copernicus.requiredDisclaimer === COPERNICUS_DISCLAIMER,
    'Copernicus required liability disclaimer is incomplete',
  )
  invariant(
    manifest.licenses.geoBoundaries.distributionLicense === 'CC BY 4.0' &&
      manifest.licenses.geoBoundaries.upstreamBoundaryMetadataLicense === 'Public Domain' &&
      manifest.licenses.geoBoundaries.requiredAttribution === 'geoBoundaries',
    'geoBoundaries license layers or attribution are incomplete',
  )

  const files = await listFiles(root)
  invariant(
    files.length === manifest.assets.length + 1 && files.includes('manifest.json'),
    'terrain directory contains unmanifested or missing files',
  )
  invariant(
    !files.some((path) => /\.(?:tif|tiff|cog|zip)$/iu.test(path)),
    'raw or archived source data must not be included',
  )

  let totalBytes = 0
  for (const asset of manifest.assets) {
    invariant(!asset.path.startsWith('/') && !asset.path.includes('..'), `unsafe asset path: ${asset.path}`)
    const path = resolve(root, asset.path)
    const info = await stat(path)
    invariant(info.isFile(), `manifest asset is not a file: ${asset.path}`)
    invariant(info.size === asset.bytes, `size mismatch: ${asset.path}`)
    invariant((await sha256(path)) === asset.sha256, `SHA-256 mismatch: ${asset.path}`)
    totalBytes += info.size
  }
  invariant(totalBytes === manifest.totalBytes, 'manifest totalBytes mismatch')

  for (const [zoom, expected] of EXPECTED_TILE_COUNTS) {
    const declared = manifest.terrainTiles.find((entry) => entry.zoom === zoom)?.tiles
    const actual = files.filter((path) => path.startsWith(`terrain/${zoom}/`) && path.endsWith('.png')).length
    invariant(declared === expected && actual === expected, `zoom ${zoom} tile closure mismatch`)
  }

  const text = [
    await readFile(resolve(root, 'manifest.json'), 'utf8'),
    await readFile(resolve(root, 'provinces.geojson'), 'utf8'),
  ].join('\n')
  invariant(
    !/(?:AKIA[0-9A-Z]{16}|aws_access_key|bearer\s+[a-z0-9._-]+|[?&](?:token|key)=)/iu.test(text),
    'possible credential or token found in terrain text assets',
  )

  console.log(
    `Terrain assets verified: ${manifest.assets.length} files, ${manifest.totalBytes} bytes, 78 offline DEM tiles.`,
  )
}

const target = process.argv[2] ?? 'public/terrain/phase2-02'
await verifyTerrainAssets(target)
