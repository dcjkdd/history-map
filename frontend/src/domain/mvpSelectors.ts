import { MvpDataError } from './mvpTypes'
import type {
  CitationWithSource,
  Event,
  MvpDataset,
  PlaceFeature,
  SelectionState,
} from './mvpTypes'

export function getEventById(
  dataset: MvpDataset,
  eventId: string,
): Event | undefined {
  return dataset.events.find((event) => event.id === eventId)
}

export function getPlaceById(
  dataset: MvpDataset,
  placeId: string,
): PlaceFeature | undefined {
  return dataset.places.features.find(
    (place) => place.properties.id === placeId,
  )
}

export function getSelectedEvent(
  dataset: MvpDataset,
  state: SelectionState,
): Event | undefined {
  return state.selectedEventId
    ? getEventById(dataset, state.selectedEventId)
    : undefined
}

export function getSelectedPlace(
  dataset: MvpDataset,
  state: SelectionState,
): PlaceFeature | undefined {
  return state.selectedPlaceId
    ? getPlaceById(dataset, state.selectedPlaceId)
    : undefined
}

export function getCitationBundle(
  dataset: MvpDataset,
  citationIds: readonly string[],
): CitationWithSource[] {
  const citationsById = new Map(
    dataset.citations.map((citation) => [citation.id, citation]),
  )
  const sourcesById = new Map(
    dataset.sources.map((source) => [source.id, source]),
  )

  return citationIds.flatMap((citationId, citationIndex) => {
    const citation = citationsById.get(citationId)
    if (!citation) {
      throw new MvpDataError({
        code: 'INVALID_DATASET',
        message: `无法解析 Citation：${citationId}`,
        path: `$.citationIds[${citationIndex}]`,
        details: {
          citationId,
        },
      })
    }

    const source = sourcesById.get(citation.sourceId)
    if (!source) {
      throw new MvpDataError({
        code: 'INVALID_DATASET',
        message: `Citation ${citation.id} 引用了不存在的 Source：${citation.sourceId}`,
        path: `$.citations[id="${citation.id}"].sourceId`,
        details: {
          citationId: citation.id,
          sourceId: citation.sourceId,
        },
      })
    }

    return [
      {
        citation,
        source,
      },
    ]
  })
}
