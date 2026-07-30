import {
  ACTION_TYPES,
  CERTAINTIES,
  EVENT_TYPES,
  GEOGRAPHY_TYPES,
  MVP_SCHEMA_VERSION,
  MvpDataError,
  PLACE_TYPES,
  SIDES,
  TIME_PRECISIONS,
  VIEWPOINT_TYPES,
} from './mvpTypes'
import type { MvpDataset, ValidationResult } from './mvpTypes'

interface ValidationContext {
  errors: MvpDataError[]
}

type UnknownRecord = Record<string, unknown>

function addError(
  context: ValidationContext,
  path: string,
  message: string,
  details?: unknown,
): void {
  context.errors.push(
    new MvpDataError({
      code: 'INVALID_DATASET',
      message,
      path,
      details,
    }),
  )
}

function isRecord(
  value: unknown,
  path: string,
  context: ValidationContext,
): value is UnknownRecord {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return true
  }

  addError(context, path, '应为对象')
  return false
}

function isRequiredString(
  value: unknown,
  path: string,
  context: ValidationContext,
): value is string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return true
  }

  addError(context, path, '应为非空字符串')
  return false
}

function isNullableString(
  value: unknown,
  path: string,
  context: ValidationContext,
): value is string | null {
  return value === null || isRequiredString(value, path, context)
}

function isFiniteNumber(
  value: unknown,
  path: string,
  context: ValidationContext,
): value is number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return true
  }

  addError(context, path, '应为有限数值')
  return false
}

function isPositiveInteger(
  value: unknown,
  path: string,
  context: ValidationContext,
): value is number {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) {
    return true
  }

  addError(context, path, '应为从 1 开始的正整数')
  return false
}

function isNullableInteger(
  value: unknown,
  path: string,
  context: ValidationContext,
): value is number | null {
  if (
    value === null ||
    (typeof value === 'number' && Number.isInteger(value))
  ) {
    return true
  }

  addError(context, path, '应为整数或 null')
  return false
}

function isStringArray(
  value: unknown,
  path: string,
  context: ValidationContext,
  minimumLength = 0,
): value is string[] {
  if (!Array.isArray(value)) {
    addError(context, path, '应为字符串数组')
    return false
  }

  let valid = true

  if (value.length < minimumLength) {
    addError(context, path, `至少需要 ${minimumLength} 项`)
    valid = false
  }

  for (let index = 0; index < value.length; index += 1) {
    const item = value[index]
    if (!isRequiredString(item, `${path}[${index}]`, context)) {
      valid = false
    }
  }

  return valid
}

function isEnumValue(
  value: unknown,
  values: readonly string[],
  path: string,
  context: ValidationContext,
): boolean {
  if (typeof value === 'string' && values.includes(value)) {
    return true
  }

  addError(context, path, `不支持的枚举值，应为：${values.join('、')}`, {
    received: value,
    allowed: values,
  })
  return false
}

function isPosition(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!Array.isArray(value) || value.length !== 2) {
    addError(context, path, '应为 [longitude, latitude] 二元坐标')
    return false
  }

  const longitudeValid = isFiniteNumber(value[0], `${path}[0]`, context)
  const latitudeValid = isFiniteNumber(value[1], `${path}[1]`, context)
  return longitudeValid && latitudeValid
}

function isBounds(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!Array.isArray(value) || value.length !== 2) {
    addError(context, path, '应为 [southwest, northeast] 边界')
    return false
  }

  const southwestValid = isPosition(value[0], `${path}[0]`, context)
  const northeastValid = isPosition(value[1], `${path}[1]`, context)
  return southwestValid && northeastValid
}

function isInitialView(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  if (!isPosition(value.center, `${path}.center`, context)) {
    valid = false
  }
  if (!isFiniteNumber(value.zoom, `${path}.zoom`, context)) {
    valid = false
  }
  if (
    value.bounds !== undefined &&
    !isBounds(value.bounds, `${path}.bounds`, context)
  ) {
    valid = false
  }
  if (
    value.maxBounds !== undefined &&
    !isBounds(value.maxBounds, `${path}.maxBounds`, context)
  ) {
    valid = false
  }

  return valid
}

function isTopic(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  for (const key of ['id', 'title', 'subtitle', 'summary'] as const) {
    if (!isRequiredString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  if (!isInitialView(value.initialView, `${path}.initialView`, context)) {
    valid = false
  }
  if (
    value.defaultEventId !== null &&
    !isRequiredString(value.defaultEventId, `${path}.defaultEventId`, context)
  ) {
    valid = false
  }

  return valid
}

function isSourcedClaim(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  if (!isRequiredString(value.claimId, `${path}.claimId`, context)) {
    valid = false
  }
  if (!isRequiredString(value.text, `${path}.text`, context)) {
    valid = false
  }
  if (
    !isEnumValue(
      value.viewpointType,
      VIEWPOINT_TYPES,
      `${path}.viewpointType`,
      context,
    )
  ) {
    valid = false
  }
  if (
    !isEnumValue(
      value.certainty,
      CERTAINTIES,
      `${path}.certainty`,
      context,
    )
  ) {
    valid = false
  }
  if (!isStringArray(value.citationIds, `${path}.citationIds`, context, 1)) {
    valid = false
  }

  return valid
}

function isPointGeometry(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  if (value.type !== 'Point') {
    addError(context, `${path}.type`, '地点几何必须为 Point')
    valid = false
  }
  if (!isPosition(value.coordinates, `${path}.coordinates`, context)) {
    valid = false
  }

  return valid
}

function isLineStringGeometry(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  if (value.type !== 'LineString') {
    addError(context, `${path}.type`, '线几何必须为 LineString')
    valid = false
  }
  if (!Array.isArray(value.coordinates)) {
    addError(context, `${path}.coordinates`, 'LineString 坐标应为数组')
    return false
  }
  if (value.coordinates.length < 2) {
    addError(context, `${path}.coordinates`, 'LineString 至少需要两个坐标')
    valid = false
  }
  for (let index = 0; index < value.coordinates.length; index += 1) {
    const position = value.coordinates[index]
    if (!isPosition(position, `${path}.coordinates[${index}]`, context)) {
      valid = false
    }
  }

  return valid
}

function isPolygonGeometry(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  if (value.type !== 'Polygon') {
    addError(context, `${path}.type`, '面几何必须为 Polygon')
    valid = false
  }
  if (!Array.isArray(value.coordinates)) {
    addError(context, `${path}.coordinates`, 'Polygon 坐标应为线性环数组')
    return false
  }
  if (value.coordinates.length < 1) {
    addError(context, `${path}.coordinates`, 'Polygon 至少需要一个线性环')
    valid = false
  }

  for (
    let ringIndex = 0;
    ringIndex < value.coordinates.length;
    ringIndex += 1
  ) {
    const ring = value.coordinates[ringIndex]
    const ringPath = `${path}.coordinates[${ringIndex}]`
    if (!Array.isArray(ring)) {
      addError(context, ringPath, 'Polygon 线性环应为坐标数组')
      valid = false
      continue
    }
    if (ring.length < 4) {
      addError(context, ringPath, 'Polygon 线性环至少需要四个坐标')
      valid = false
    }
    for (
      let positionIndex = 0;
      positionIndex < ring.length;
      positionIndex += 1
    ) {
      const position = ring[positionIndex]
      if (
        !isPosition(position, `${ringPath}[${positionIndex}]`, context)
      ) {
        valid = false
      }
    }
  }

  return valid
}

function isPlaceProperties(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  for (const key of ['id', 'name'] as const) {
    if (!isRequiredString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  if (!isNullableString(value.modernName, `${path}.modernName`, context)) {
    valid = false
  }
  if (
    !isEnumValue(value.placeType, PLACE_TYPES, `${path}.placeType`, context)
  ) {
    valid = false
  }
  if (!isSourcedClaim(value.summary, `${path}.summary`, context)) {
    valid = false
  }
  if (
    !isSourcedClaim(value.strategicRole, `${path}.strategicRole`, context)
  ) {
    valid = false
  }
  if (
    !isEnumValue(
      value.certainty,
      CERTAINTIES,
      `${path}.certainty`,
      context,
    )
  ) {
    valid = false
  }
  if (
    value.coordinateNote !== null &&
    !isSourcedClaim(value.coordinateNote, `${path}.coordinateNote`, context)
  ) {
    valid = false
  }
  if (!isStringArray(value.citationIds, `${path}.citationIds`, context)) {
    valid = false
  }

  return valid
}

function isGeographyProperties(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  for (const key of ['id', 'name'] as const) {
    if (!isRequiredString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  if (
    !isEnumValue(
      value.geographyType,
      GEOGRAPHY_TYPES,
      `${path}.geographyType`,
      context,
    )
  ) {
    valid = false
  }
  if (!isSourcedClaim(value.summary, `${path}.summary`, context)) {
    valid = false
  }
  if (
    !isEnumValue(
      value.certainty,
      CERTAINTIES,
      `${path}.certainty`,
      context,
    )
  ) {
    valid = false
  }
  if (!isStringArray(value.citationIds, `${path}.citationIds`, context)) {
    valid = false
  }

  return valid
}

function isRouteSegmentProperties(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  for (const key of ['id', 'routeId', 'routeName', 'appearAtEventId'] as const) {
    if (!isRequiredString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  if (!isPositiveInteger(value.segmentNo, `${path}.segmentNo`, context)) {
    valid = false
  }
  if (!isEnumValue(value.side, SIDES, `${path}.side`, context)) {
    valid = false
  }
  if (
    !isEnumValue(
      value.actionType,
      ACTION_TYPES,
      `${path}.actionType`,
      context,
    )
  ) {
    valid = false
  }
  if (
    !isNullableString(value.fromPlaceId, `${path}.fromPlaceId`, context)
  ) {
    valid = false
  }
  if (!isNullableString(value.toPlaceId, `${path}.toPlaceId`, context)) {
    valid = false
  }
  if (
    !isEnumValue(
      value.certainty,
      CERTAINTIES,
      `${path}.certainty`,
      context,
    )
  ) {
    valid = false
  }
  if (!isSourcedClaim(value.summary, `${path}.summary`, context)) {
    valid = false
  }
  if (!isStringArray(value.citationIds, `${path}.citationIds`, context)) {
    valid = false
  }

  return valid
}

function isFeature(
  value: unknown,
  path: string,
  context: ValidationContext,
  geometryValidator: (
    geometry: unknown,
    geometryPath: string,
    validationContext: ValidationContext,
  ) => boolean,
  propertiesValidator: (
    properties: unknown,
    propertiesPath: string,
    validationContext: ValidationContext,
  ) => boolean,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  if (value.type !== 'Feature') {
    addError(context, `${path}.type`, 'GeoJSON 对象必须为 Feature')
    valid = false
  }
  if (!geometryValidator(value.geometry, `${path}.geometry`, context)) {
    valid = false
  }
  if (!propertiesValidator(value.properties, `${path}.properties`, context)) {
    valid = false
  }

  return valid
}

function isFeatureCollection(
  value: unknown,
  path: string,
  context: ValidationContext,
  featureValidator: (
    feature: unknown,
    featurePath: string,
    validationContext: ValidationContext,
  ) => boolean,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  if (value.type !== 'FeatureCollection') {
    addError(context, `${path}.type`, 'GeoJSON 集合必须为 FeatureCollection')
    valid = false
  }
  if (!Array.isArray(value.features)) {
    addError(context, `${path}.features`, 'features 应为数组')
    return false
  }

  for (let index = 0; index < value.features.length; index += 1) {
    const feature = value.features[index]
    if (!featureValidator(feature, `${path}.features[${index}]`, context)) {
      valid = false
    }
  }

  return valid
}

function isGeographyGeometry(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  if (value.type === 'LineString') {
    return isLineStringGeometry(value, path, context)
  }
  if (value.type === 'Polygon') {
    return isPolygonGeometry(value, path, context)
  }

  addError(context, `${path}.type`, '地理要素几何必须为 LineString 或 Polygon')
  return false
}

function isEvent(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  for (const key of ['id', 'title', 'dateLabel'] as const) {
    if (!isRequiredString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  if (!isPositiveInteger(value.sequence, `${path}.sequence`, context)) {
    valid = false
  }
  if (
    !isEnumValue(value.eventType, EVENT_TYPES, `${path}.eventType`, context)
  ) {
    valid = false
  }
  if (
    !isNullableString(value.normalizedDate, `${path}.normalizedDate`, context)
  ) {
    valid = false
  }
  if (
    !isEnumValue(
      value.timePrecision,
      TIME_PRECISIONS,
      `${path}.timePrecision`,
      context,
    )
  ) {
    valid = false
  }
  if (
    !isEnumValue(
      value.certainty,
      CERTAINTIES,
      `${path}.certainty`,
      context,
    )
  ) {
    valid = false
  }
  if (!isSourcedClaim(value.summary, `${path}.summary`, context)) {
    valid = false
  }
  if (!isSourcedClaim(value.whyItMatters, `${path}.whyItMatters`, context)) {
    valid = false
  }
  if (
    !isStringArray(value.relatedPlaceIds, `${path}.relatedPlaceIds`, context)
  ) {
    valid = false
  }
  if (!isStringArray(value.actorLabels, `${path}.actorLabels`, context)) {
    valid = false
  }
  if (!isStringArray(value.citationIds, `${path}.citationIds`, context)) {
    valid = false
  }

  return valid
}

function isSourceProvenance(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  for (const key of [
    'url',
    'accessDate',
    'licenseName',
    'licenseUrl',
    'attribution',
    'usageRestrictions',
    'dataVersion',
    'originalCrs',
    'coverage',
    'processingNotes',
    'outputId',
  ] as const) {
    if (!isNullableString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }

  return valid
}

function isSource(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  for (const key of ['id', 'title', 'sourceType'] as const) {
    if (!isRequiredString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  for (const key of ['author', 'edition', 'publisher'] as const) {
    if (!isNullableString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  if (!isNullableInteger(value.publishYear, `${path}.publishYear`, context)) {
    valid = false
  }
  if (
    value.provenance !== null &&
    !isSourceProvenance(value.provenance, `${path}.provenance`, context)
  ) {
    valid = false
  }

  return valid
}

function isCitation(
  value: unknown,
  path: string,
  context: ValidationContext,
): boolean {
  if (!isRecord(value, path, context)) {
    return false
  }

  let valid = true

  for (const key of ['id', 'sourceId', 'summary'] as const) {
    if (!isRequiredString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  for (const key of ['chapter', 'locator', 'quote'] as const) {
    if (!isNullableString(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  for (const key of ['pageStart', 'pageEnd'] as const) {
    if (!isNullableInteger(value[key], `${path}.${key}`, context)) {
      valid = false
    }
  }
  if (
    !isEnumValue(
      value.viewpointType,
      VIEWPOINT_TYPES,
      `${path}.viewpointType`,
      context,
    )
  ) {
    valid = false
  }
  if (
    !isEnumValue(
      value.certainty,
      CERTAINTIES,
      `${path}.certainty`,
      context,
    )
  ) {
    valid = false
  }

  return valid
}

function isArrayOf(
  value: unknown,
  path: string,
  context: ValidationContext,
  itemValidator: (
    item: unknown,
    itemPath: string,
    validationContext: ValidationContext,
  ) => boolean,
): boolean {
  if (!Array.isArray(value)) {
    addError(context, path, '应为数组')
    return false
  }

  let valid = true

  for (let index = 0; index < value.length; index += 1) {
    const item = value[index]
    if (!itemValidator(item, `${path}[${index}]`, context)) {
      valid = false
    }
  }

  return valid
}

function isMvpDataset(
  value: unknown,
  context: ValidationContext,
): value is MvpDataset {
  if (!isRecord(value, '$', context)) {
    return false
  }

  let valid = true

  if (value.schemaVersion !== MVP_SCHEMA_VERSION) {
    context.errors.push(
      new MvpDataError({
        code:
          typeof value.schemaVersion === 'string'
            ? 'UNSUPPORTED_SCHEMA_VERSION'
            : 'INVALID_DATASET',
        message:
          typeof value.schemaVersion === 'string'
            ? `不支持 schemaVersion ${value.schemaVersion}，当前仅支持 ${MVP_SCHEMA_VERSION}`
            : `schemaVersion 必须为 ${MVP_SCHEMA_VERSION}`,
        path: '$.schemaVersion',
        details: {
          received: value.schemaVersion,
          supported: MVP_SCHEMA_VERSION,
        },
      }),
    )
    valid = false
  }
  if (!isTopic(value.topic, '$.topic', context)) {
    valid = false
  }
  if (
    !isFeatureCollection(
      value.places,
      '$.places',
      context,
      (feature, path, validationContext) =>
        isFeature(
          feature,
          path,
          validationContext,
          isPointGeometry,
          isPlaceProperties,
        ),
    )
  ) {
    valid = false
  }
  if (
    !isFeatureCollection(
      value.geography,
      '$.geography',
      context,
      (feature, path, validationContext) =>
        isFeature(
          feature,
          path,
          validationContext,
          isGeographyGeometry,
          isGeographyProperties,
        ),
    )
  ) {
    valid = false
  }
  if (
    !isFeatureCollection(
      value.routeSegments,
      '$.routeSegments',
      context,
      (feature, path, validationContext) =>
        isFeature(
          feature,
          path,
          validationContext,
          isLineStringGeometry,
          isRouteSegmentProperties,
        ),
    )
  ) {
    valid = false
  }
  if (!isArrayOf(value.events, '$.events', context, isEvent)) {
    valid = false
  }
  if (!isArrayOf(value.sources, '$.sources', context, isSource)) {
    valid = false
  }
  if (!isArrayOf(value.citations, '$.citations', context, isCitation)) {
    valid = false
  }

  return valid && context.errors.length === 0
}

export function validateMvpDataset(input: unknown): ValidationResult {
  const context: ValidationContext = {
    errors: [],
  }

  if (isMvpDataset(input, context)) {
    return {
      ok: true,
      data: input,
    }
  }

  return {
    ok: false,
    errors: context.errors,
  }
}
