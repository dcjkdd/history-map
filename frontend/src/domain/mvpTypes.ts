export const MVP_SCHEMA_VERSION = '1.0' as const

export const PLACE_TYPES = [
  'CITY',
  'PASS',
  'FERRY',
  'BATTLEFIELD',
  'REGION',
  'OTHER',
] as const

export const GEOGRAPHY_TYPES = [
  'RIVER',
  'MOUNTAIN',
  'CORRIDOR',
  'REGION',
] as const

export const EVENT_TYPES = [
  'MARCH',
  'CAPTURE',
  'DEFENSE',
  'BATTLE',
  'RETREAT',
  'POLITICAL',
  'OTHER',
] as const

export const SIDES = ['TANG', 'YAN', 'COURT', 'OTHER'] as const

export const ACTION_TYPES = [
  'ADVANCE',
  'RETREAT',
  'DEFEND',
  'TRANSFER',
] as const

export const CERTAINTIES = [
  'HIGH',
  'MEDIUM',
  'LOW',
  'DISPUTED',
  'UNKNOWN',
] as const

export const TIME_PRECISIONS = [
  'DAY',
  'MONTH',
  'YEAR',
  'APPROXIMATE',
] as const

export const VIEWPOINT_TYPES = [
  'FACT',
  'PRIMARY_RECORD',
  'MODERN_RESEARCH',
  'LATER_NARRATIVE',
  'INFERENCE',
  'DISPUTE',
] as const

export const MVP_DATA_ERROR_CODES = [
  'NETWORK_ERROR',
  'HTTP_ERROR',
  'INVALID_JSON',
  'UNSUPPORTED_SCHEMA_VERSION',
  'UNSUPPORTED_ENUM',
  'MISSING_CITATION',
  'INVALID_DATASET',
] as const

export const MVP_INTEGRITY_SEVERITIES = ['ERROR', 'WARNING'] as const

export const MVP_INTEGRITY_CODES = [
  'DUPLICATE_ID',
  'MISSING_REFERENCE',
  'INVALID_COORDINATE',
  'INVALID_EVENT_SEQUENCE',
  'INVALID_ROUTE_SEQUENCE',
  'UNKNOWN_APPEAR_EVENT',
  'MISSING_CITATION',
  'MISSING_COORDINATE_NOTE',
  'UNSUPPORTED_ENUM',
] as const

export type PlaceType = (typeof PLACE_TYPES)[number]
export type GeographyType = (typeof GEOGRAPHY_TYPES)[number]
export type EventType = (typeof EVENT_TYPES)[number]
export type Side = (typeof SIDES)[number]
export type ActionType = (typeof ACTION_TYPES)[number]
export type Certainty = (typeof CERTAINTIES)[number]
export type TimePrecision = (typeof TIME_PRECISIONS)[number]
export type ViewpointType = (typeof VIEWPOINT_TYPES)[number]
export type MvpDataErrorCode = (typeof MVP_DATA_ERROR_CODES)[number]
export type MvpIntegritySeverity =
  (typeof MVP_INTEGRITY_SEVERITIES)[number]
export type MvpIntegrityCode = (typeof MVP_INTEGRITY_CODES)[number]

export type Position = [longitude: number, latitude: number]
export type Bounds = [southwest: Position, northeast: Position]

export interface PointGeometry {
  type: 'Point'
  coordinates: Position
}

export interface LineStringGeometry {
  type: 'LineString'
  coordinates: Position[]
}

export interface PolygonGeometry {
  type: 'Polygon'
  coordinates: Position[][]
}

export interface GeoJsonFeature<
  Geometry,
  Properties extends Record<string, unknown>,
> {
  type: 'Feature'
  geometry: Geometry
  properties: Properties
}

export interface GeoJsonFeatureCollection<Feature> {
  type: 'FeatureCollection'
  features: Feature[]
}

export interface InitialView {
  center: Position
  zoom: number
  bounds?: Bounds
  maxBounds?: Bounds
}

export interface Topic {
  id: string
  title: string
  subtitle: string
  summary: string
  initialView: InitialView
  /**
   * The technical empty dataset uses null until reviewed events exist.
   * MVP-02 will require a resolvable ID whenever events are present.
   */
  defaultEventId: string | null
}

export interface SourcedClaim {
  claimId: string
  text: string
  viewpointType: ViewpointType
  certainty: Certainty
  citationIds: string[]
}

export interface PlaceProperties extends Record<string, unknown> {
  id: string
  name: string
  modernName: string | null
  placeType: PlaceType
  summary: SourcedClaim
  strategicRole: SourcedClaim
  certainty: Certainty
  coordinateNote: SourcedClaim | null
  /**
   * Provenance for the identity and point geometry. Narrative claims keep
   * their own citation IDs.
   */
  citationIds: string[]
}

export interface GeographyProperties extends Record<string, unknown> {
  id: string
  name: string
  geographyType: GeographyType
  summary: SourcedClaim
  certainty: Certainty
  /**
   * Provenance for the geometry. Narrative claims keep their own citation
   * IDs.
   */
  citationIds: string[]
}

export interface RouteSegmentProperties extends Record<string, unknown> {
  id: string
  routeId: string
  routeName: string
  segmentNo: number
  side: Side
  actionType: ActionType
  appearAtEventId: string
  fromPlaceId: string | null
  toPlaceId: string | null
  certainty: Certainty
  summary: SourcedClaim
  /**
   * Provenance for the line geometry. Narrative claims keep their own
   * citation IDs.
   */
  citationIds: string[]
}

export type PlaceFeature = GeoJsonFeature<PointGeometry, PlaceProperties>
export type GeographyFeature = GeoJsonFeature<
  LineStringGeometry | PolygonGeometry,
  GeographyProperties
>
export type RouteSegmentFeature = GeoJsonFeature<
  LineStringGeometry,
  RouteSegmentProperties
>

export interface Event {
  id: string
  sequence: number
  title: string
  eventType: EventType
  dateLabel: string
  normalizedDate: string | null
  timePrecision: TimePrecision
  certainty: Certainty
  summary: SourcedClaim
  whyItMatters: SourcedClaim
  relatedPlaceIds: string[]
  actorLabels: string[]
  /**
   * Provenance for event identity and time. Narrative claims keep their own
   * citation IDs.
   */
  citationIds: string[]
}

export interface SourceProvenance {
  url: string | null
  accessDate: string | null
  licenseName: string | null
  licenseUrl: string | null
  attribution: string | null
  usageRestrictions: string | null
  dataVersion: string | null
  originalCrs: string | null
  coverage: string | null
  processingNotes: string | null
  outputId: string | null
}

export interface Source {
  id: string
  title: string
  author: string | null
  edition: string | null
  publisher: string | null
  publishYear: number | null
  sourceType: string
  provenance: SourceProvenance | null
}

export interface Citation {
  id: string
  sourceId: string
  chapter: string | null
  locator: string | null
  pageStart: number | null
  pageEnd: number | null
  quote: string | null
  summary: string
  viewpointType: ViewpointType
  certainty: Certainty
}

export interface MvpDataset {
  schemaVersion: typeof MVP_SCHEMA_VERSION
  topic: Topic
  places: GeoJsonFeatureCollection<PlaceFeature>
  geography: GeoJsonFeatureCollection<GeographyFeature>
  routeSegments: GeoJsonFeatureCollection<RouteSegmentFeature>
  events: Event[]
  sources: Source[]
  citations: Citation[]
}

export type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export class MvpDataError extends Error {
  readonly code: MvpDataErrorCode
  readonly path: string
  readonly details: unknown

  constructor({
    code,
    message,
    path = '$',
    details,
  }: {
    code: MvpDataErrorCode
    message: string
    path?: string
    details?: unknown
  }) {
    super(message)
    this.name = 'MvpDataError'
    this.code = code
    this.path = path
    this.details = details
  }
}

export type ValidationResult =
  | {
      ok: true
      data: MvpDataset
    }
  | {
      ok: false
      errors: MvpDataError[]
    }

export interface MvpIntegrityIssue {
  severity: MvpIntegritySeverity
  code: MvpIntegrityCode
  path: string
  message: string
}

export interface MvpIntegrityResult {
  ok: boolean
  issues: MvpIntegrityIssue[]
}

export interface CitationWithSource {
  citation: Citation
  source: Source
}
