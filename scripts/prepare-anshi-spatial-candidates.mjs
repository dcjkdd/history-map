#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url))
const CANDIDATE_OUTPUT_PATH = resolve(
  SCRIPT_DIRECTORY,
  '../data/curated/spatial/anshi-natural-earth-v5.0.0.geojson',
)
const EARTH_RADIUS_KILOMETERS = 6371.0088
const MINIMUM_LONGEST_LINE_MARGIN_KILOMETERS = 0.001
const REVIEWER = 'banq'
const REVIEW_DATE = '2026-07-31'
const CANDIDATE_STATUS = 'APPROVED'

const EXPECTED_INPUTS = {
  rivers: {
    sha256: 'bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a',
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.0.0/geojson/ne_10m_rivers_lake_centerlines.geojson',
  },
  physicalRegions: {
    sha256: 'b7b26e50ea917d3696aec87f932def2bf5f890f5770e441d59c162c6f4c92a77',
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.0.0/geojson/ne_10m_geography_regions_polys.geojson',
  },
}

const [riversInput, physicalRegionsInput, outputArg] = process.argv.slice(2)

if (!riversInput || !physicalRegionsInput || !outputArg) {
  console.error(
    'Usage: node scripts/prepare-anshi-spatial-candidates.mjs <rivers.geojson> <physical-regions.geojson> <output.geojson>',
  )
  process.exit(1)
}

function readVerifiedGeoJson(filePath, expected) {
  const absolutePath = resolve(filePath)
  const contents = readFileSync(absolutePath)
  const actualHash = createHash('sha256').update(contents).digest('hex')

  if (actualHash !== expected.sha256) {
    throw new Error(
      `Unexpected SHA-256 for ${absolutePath}: expected ${expected.sha256}, received ${actualHash}`,
    )
  }

  const parsed = JSON.parse(contents.toString('utf8'))
  if (parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
    throw new Error(`${absolutePath} is not a GeoJSON FeatureCollection`)
  }

  return parsed
}

function findSingleFeature(collection, predicate, label) {
  const matches = collection.features.filter(predicate)
  if (matches.length !== 1) {
    throw new Error(`Expected one ${label} feature, received ${matches.length}`)
  }
  return matches[0]
}

function samePosition(left, right) {
  return (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === 2 &&
    right.length === 2 &&
    left[0] === right[0] &&
    left[1] === right[1]
  )
}

function lineLengthKilometers(coordinates, label) {
  validateLine(coordinates, label)

  let length = 0
  for (let index = 1; index < coordinates.length; index += 1) {
    const [previousLongitude, previousLatitude] = coordinates[index - 1]
    const [longitude, latitude] = coordinates[index]
    const previousLatitudeRadians = previousLatitude * (Math.PI / 180)
    const latitudeRadians = latitude * (Math.PI / 180)
    const latitudeDelta = (latitude - previousLatitude) * (Math.PI / 180)
    const longitudeDelta =
      (longitude - previousLongitude) * (Math.PI / 180)
    const haversine =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(previousLatitudeRadians) *
        Math.cos(latitudeRadians) *
        Math.sin(longitudeDelta / 2) ** 2
    const boundedHaversine = Math.min(1, Math.max(0, haversine))

    length +=
      2 *
      EARTH_RADIUS_KILOMETERS *
      Math.atan2(
        Math.sqrt(boundedHaversine),
        Math.sqrt(1 - boundedHaversine),
      )
  }
  return length
}

function longestLine(parts, label) {
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new Error(`${label} has no line parts`)
  }
  let longest = parts[0]
  let longestLength = lineLengthKilometers(longest, `${label} part 0`)
  for (let index = 1; index < parts.length; index += 1) {
    const candidate = parts[index]
    const candidateLength = lineLengthKilometers(
      candidate,
      `${label} part ${index}`,
    )
    if (
      Math.abs(candidateLength - longestLength) <=
      MINIMUM_LONGEST_LINE_MARGIN_KILOMETERS
    ) {
      throw new Error(
        `${label} has line parts whose geodesic lengths are too close to select deterministically`,
      )
    }
    if (candidateLength > longestLength) {
      longest = candidate
      longestLength = candidateLength
    }
  }
  return longest
}

function onlyLine(parts, label) {
  if (!Array.isArray(parts) || parts.length !== 1) {
    throw new Error(`Expected one ${label} line part, received ${parts?.length}`)
  }
  return parts[0]
}

function findConnectedLine(parts, endpoint, label) {
  const matches = parts.flatMap((part) => {
    if (samePosition(part[0], endpoint)) return [part]
    if (samePosition(part.at(-1), endpoint)) return [[...part].reverse()]
    return []
  })

  if (matches.length !== 1) {
    throw new Error(
      `Expected one ${label} part connected to ${JSON.stringify(endpoint)}, received ${matches.length}`,
    )
  }
  return matches[0]
}

function validatePosition(position, label) {
  if (
    !Array.isArray(position) ||
    position.length !== 2 ||
    !Number.isFinite(position[0]) ||
    !Number.isFinite(position[1]) ||
    position[0] < -180 ||
    position[0] > 180 ||
    position[1] < -90 ||
    position[1] > 90
  ) {
    throw new Error(`Invalid longitude/latitude position in ${label}`)
  }
}

function validateLine(coordinates, label) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error(`${label} must contain at least two positions`)
  }
  coordinates.forEach((position) => validatePosition(position, label))
}

function validatePolygon(coordinates, label) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error(`${label} must contain at least one ring`)
  }
  coordinates.forEach((ring) => {
    if (ring.length < 4 || !samePosition(ring[0], ring.at(-1))) {
      throw new Error(`${label} contains an invalid or open ring`)
    }
    ring.forEach((position) => validatePosition(position, label))
  })
}

function calculateBbox(positions, label) {
  positions.forEach((position) => validatePosition(position, label))
  return positions.reduce(
    ([west, south, east, north], [longitude, latitude]) => [
      Math.min(west, longitude),
      Math.min(south, latitude),
      Math.max(east, longitude),
      Math.max(north, latitude),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  )
}

const rivers = readVerifiedGeoJson(riversInput, EXPECTED_INPUTS.rivers)
const physicalRegions = readVerifiedGeoJson(
  physicalRegionsInput,
  EXPECTED_INPUTS.physicalRegions,
)

const yellowRiverWestFeature = findSingleFeature(
  rivers,
  ({ properties }) => properties?.dissolve === '66River',
  'Natural Earth dissolve=66River',
)
const yellowRiverEastFeature = findSingleFeature(
  rivers,
  ({ properties }) => properties?.dissolve === '95River',
  'Natural Earth dissolve=95River',
)
const weiRiverFeature = findSingleFeature(
  rivers,
  ({ properties }) => properties?.dissolve === '873River',
  'Natural Earth dissolve=873River',
)
const qinlingFeature = findSingleFeature(
  physicalRegions,
  ({ properties }) =>
    properties?.NE_ID === 1159103573 &&
    properties?.WIKIDATAID === 'Q863798' &&
    properties?.NAME_ZH === '秦岭',
  'Natural Earth Qinling NE_ID=1159103573',
)

for (const [feature, label] of [
  [yellowRiverWestFeature, '66River'],
  [yellowRiverEastFeature, '95River'],
  [weiRiverFeature, '873River'],
]) {
  if (feature.geometry?.type !== 'MultiLineString') {
    throw new Error(`${label} is not a MultiLineString`)
  }
}
if (qinlingFeature.geometry?.type !== 'Polygon') {
  throw new Error('Qinling source geometry is not a Polygon')
}

const yellowRiverWest = longestLine(
  yellowRiverWestFeature.geometry.coordinates,
  '66River',
)
const yellowRiverEast = findConnectedLine(
  yellowRiverEastFeature.geometry.coordinates,
  yellowRiverWest.at(-1),
  '95River',
)
const yellowRiver = [
  ...yellowRiverWest,
  ...yellowRiverEast.slice(1),
]
const weiRiver = onlyLine(
  weiRiverFeature.geometry.coordinates,
  '873River',
)
const qinling = qinlingFeature.geometry.coordinates

validateLine(yellowRiver, 'Yellow River candidate')
validateLine(weiRiver, 'Wei River candidate')
validatePolygon(qinling, 'Qinling candidate')

const yellowRiverBbox = calculateBbox(yellowRiver, 'Yellow River bbox')
const weiRiverBbox = calculateBbox(weiRiver, 'Wei River bbox')
const qinlingPositions = qinling.flat()
const qinlingBbox = calculateBbox(qinlingPositions, 'Qinling bbox')

const output = {
  type: 'FeatureCollection',
  name: 'anshi-mvp-spatial-candidates-ne-v5.0.0',
  candidateStatus: CANDIDATE_STATUS,
  reviewer: REVIEWER,
  reviewDate: REVIEW_DATE,
  reviewDecision:
    'Accepted as modern generalized overview geometry only; it must not be described as a reconstruction of Tang-period rivers or a precise historical mountain boundary.',
  dataVersion: 'Natural Earth 5.0.0',
  accessDate: '2026-07-30',
  sourceId: 'SRC-SPATIAL-01',
  source: {
    provider: 'Natural Earth',
    repository: 'https://github.com/nvkelso/natural-earth-vector',
    releaseTag: 'v5.0.0',
    licenseName: 'Public domain',
    licenseUrl: 'https://www.naturalearthdata.com/about/terms-of-use/',
    recommendedAttribution: 'Made with Natural Earth',
    inputs: [
      {
        outputRole: 'rivers',
        url: EXPECTED_INPUTS.rivers.url,
        sha256: EXPECTED_INPUTS.rivers.sha256,
      },
      {
        outputRole: 'physical-regions',
        url: EXPECTED_INPUTS.physicalRegions.url,
        sha256: EXPECTED_INPUTS.physicalRegions.sha256,
      },
    ],
  },
  coordinateReferenceSystem:
    'OGC:CRS84 (WGS84 longitude, latitude); no reprojection performed',
  processing: [
    'Select named/identified source features only; do not infer geometry by visual tracing.',
    'Keep all selected source coordinates without clipping or simplification.',
    'Convert the single-part Wei MultiLineString (dissolve=873River) to LineString.',
    'Join the geodesically longest dissolve=66River line (WGS84 haversine length) to the dissolve=95River part whose endpoint is exactly equal; remove only the duplicate shared endpoint.',
    'Keep the Qinling Polygon identified by NE_ID=1159103573, WIKIDATAID=Q863798 and NAME_ZH=秦岭.',
  ],
  usageBoundary:
    'Curated review evidence. Approved geometry may enter release data only after each full Geography record and all other dependencies pass their own gates. It does not establish Tang-period river channels, a precise mountain boundary, historical sites, battle positions, corridors, or routes.',
  features: [
    {
      type: 'Feature',
      bbox: yellowRiverBbox,
      properties: {
        id: 'spatial-candidate-yellow-river-ne-v5',
        name: '黄河',
        geographyType: 'RIVER',
        candidateStatus: CANDIDATE_STATUS,
        reviewer: REVIEWER,
        reviewDate: REVIEW_DATE,
        certainty: 'UNKNOWN',
        citationCandidateIds: ['CIT-NE50-RIVERS-MVP'],
        sourceFeatureLocator:
          'ne_10m_rivers_lake_centerlines: dissolve=66River geodesically longest part + dissolve=95River endpoint-connected part',
        sourceCoverage:
          'Selected uncut Natural Earth source parts only; completeness of the full named river is not asserted.',
        sourceFeaturePartCounts: {
          '66River': yellowRiverWestFeature.geometry.coordinates.length,
          '95River': yellowRiverEastFeature.geometry.coordinates.length,
        },
        selectedSourcePartCount: 2,
        coordinateCount: yellowRiver.length,
        startPosition: yellowRiver[0],
        endPosition: yellowRiver.at(-1),
        temporalScope: '现代概览地理背景；不代表唐代精确河道',
      },
      geometry: {
        type: 'LineString',
        coordinates: yellowRiver,
      },
    },
    {
      type: 'Feature',
      bbox: weiRiverBbox,
      properties: {
        id: 'spatial-candidate-wei-river-ne-v5',
        name: '渭河',
        geographyType: 'RIVER',
        candidateStatus: CANDIDATE_STATUS,
        reviewer: REVIEWER,
        reviewDate: REVIEW_DATE,
        certainty: 'UNKNOWN',
        citationCandidateIds: ['CIT-NE50-RIVERS-MVP'],
        sourceFeatureLocator:
          'ne_10m_rivers_lake_centerlines: dissolve=873River, only line part',
        sourceCoverage:
          'Selected uncut Natural Earth source part only; completeness of the full named river is not asserted.',
        sourceFeaturePartCounts: {
          '873River': weiRiverFeature.geometry.coordinates.length,
        },
        selectedSourcePartCount: 1,
        coordinateCount: weiRiver.length,
        startPosition: weiRiver[0],
        endPosition: weiRiver.at(-1),
        temporalScope: '现代概览地理背景；不代表唐代精确河道',
      },
      geometry: {
        type: 'LineString',
        coordinates: weiRiver,
      },
    },
    {
      type: 'Feature',
      bbox: qinlingBbox,
      properties: {
        id: 'spatial-candidate-qinling-ne-v5',
        name: '秦岭',
        geographyType: 'MOUNTAIN',
        candidateStatus: CANDIDATE_STATUS,
        reviewer: REVIEWER,
        reviewDate: REVIEW_DATE,
        certainty: 'UNKNOWN',
        citationCandidateIds: ['CIT-NE50-QINLING-MVP'],
        sourceFeatureLocator:
          'ne_10m_geography_regions_polys: NE_ID=1159103573, WIKIDATAID=Q863798, NAME_ZH=秦岭',
        sourceCoverage:
          'Uncut Natural Earth source polygon only; it is a generalized modern overview region, not a precise boundary.',
        sourceRingCount: qinling.length,
        coordinateCount: qinlingPositions.length,
        temporalScope: '现代概览地理背景；仅为广义山地区域，不代表精确历史边界',
      },
      geometry: {
        type: 'Polygon',
        coordinates: qinling,
      },
    },
  ],
}

const outputPath = resolve(outputArg)
if (outputPath !== CANDIDATE_OUTPUT_PATH) {
  throw new Error(
    `Curated output must be the approved candidate path ${CANDIDATE_OUTPUT_PATH}; received ${outputPath}`,
  )
}
if (
  outputPath === resolve(riversInput) ||
  outputPath === resolve(physicalRegionsInput)
) {
  throw new Error(`Refusing to overwrite a verified source input: ${outputPath}`)
}
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)
console.log(
  `Wrote ${output.features.length} ${CANDIDATE_STATUS} features to ${outputPath}`,
)
