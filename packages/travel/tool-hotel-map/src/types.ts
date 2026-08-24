import type { Branded } from '@deepseek-ai/dsh-brand'

/** Durable identity for one rendered hotel map. */
export type TravelMapId = Branded<'TravelMapId'>

/** A geographic coordinate in WGS84 longitude/latitude order. */
export interface MapCoordinate {
  readonly latitude: number
  readonly longitude: number
}

/** Route status independent of the configured provider. */
export type MapRouteStatus = 'available' | 'unavailable' | 'failed'

/** Replayable route result for one travel mode. */
export interface MapRoute {
  readonly status: MapRouteStatus
  readonly durationSeconds?: number
  readonly distanceMeters?: number
  readonly geometry?: readonly MapCoordinate[]
  readonly diagnostic?: string
}

/** Resolved destination shared by every hotel route. */
export interface MapDestination extends MapCoordinate {
  readonly name: string
  readonly address: string
}

/** One hotel and its optional destination routes. */
export interface MappedHotel {
  readonly name: string
  readonly address: string
  readonly coordinate?: MapCoordinate
  readonly diagnostic?: string
  readonly driving?: MapRoute
  readonly transit?: MapRoute
}

/** Provider attribution persisted with the facts it covers. */
export interface MapAttribution {
  readonly label: string
  readonly url: string
}

/** Complete payload required to replay one hotel map without provider I/O. */
export interface TravelMapShowData {
  readonly mapId: TravelMapId
  readonly title: string
  readonly destination?: MapDestination
  readonly hotels: readonly MappedHotel[]
  readonly attributions: readonly MapAttribution[]
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /**
     * Records one complete hotel map after all provider requests settle.
     * @param data - replayable markers, route outcomes, and attribution.
     */
    'travel-map/show': TravelMapShowData
  }
}
