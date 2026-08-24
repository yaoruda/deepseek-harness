import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { drivingRoute, geocode, transitRoute } from './providers.ts'
import type {
  MapCoordinate, MapDestination, MapRoute, MappedHotel, TravelMapId, TravelMapShowData,
} from './types.ts'
export type * from './types.ts'

export const name = 'tool-hotel-map'
export const inject = ['tools']

/** Free-provider endpoints and operational bounds for the hotel map tool. */
export interface Config {
  /** Nominatim-compatible geocoding service root URL. */
  geocoderBaseUrl: string
  /** OSRM-compatible driving route service root URL. */
  drivingBaseUrl: string
  /** Transitous MOTIS-compatible public transport service root URL. */
  transitBaseUrl: string
  /** Identifying HTTP User-Agent sent to community providers. */
  userAgent: string
  /** Timeout applied independently to each provider request. */
  requestTimeoutMs: number
  /** Minimum delay between uncached geocoding requests. */
  geocodeIntervalMs: number
  /** Maximum hotels accepted by one tool call. */
  maxHotels: number
}

/** Schemastery configuration for free map providers and bounded requests. */
export const Config: z<Config> = z.object({
  geocoderBaseUrl: z.string().default('https://nominatim.openstreetmap.org/'),
  drivingBaseUrl: z.string().default('https://router.project-osrm.org/'),
  transitBaseUrl: z.string().default('https://api.transitous.org/'),
  userAgent: z.string().required(),
  requestTimeoutMs: z.number().min(1000).max(120000).default(20000),
  geocodeIntervalMs: z.number().min(1000).max(60000).default(1100),
  maxHotels: z.number().min(1).max(50).default(20),
})

interface PlaceInput {
  readonly name: string
  readonly address: string
  readonly latitude?: number
  readonly longitude?: number
}

function normalizePlace(place: PlaceInput, label: string): PlaceInput {
  const name = place.name.trim()
  const address = place.address.trim()
  if (name === '' || address === '') throw new Error(`${label} name and address must be non-empty`)
  if ((place.latitude === undefined) !== (place.longitude === undefined)) {
    throw new Error(`${label} latitude and longitude must be supplied together`)
  }
  if (place.latitude !== undefined && (place.latitude < -90 || place.latitude > 90)) {
    throw new Error(`${label} latitude is outside -90..90`)
  }
  if (place.longitude !== undefined && (place.longitude < -180 || place.longitude > 180)) {
    throw new Error(`${label} longitude is outside -180..180`)
  }
  return { name, address, ...place.latitude === undefined ? {} : { latitude: place.latitude, longitude: place.longitude } }
}

function directCoordinate(place: PlaceInput): MapCoordinate | undefined {
  return place.latitude === undefined || place.longitude === undefined
    ? undefined
    : { latitude: place.latitude, longitude: place.longitude }
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return }
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason) }, { once: true })
  })
}

async function safeRoute(run: () => Promise<MapRoute>): Promise<MapRoute> {
  try { return await run() } catch (error) {
    return { status: 'failed', diagnostic: error instanceof Error ? error.message : String(error) }
  }
}

/** Register the bounded hotel-map tool and its complete durable result event. */
export function apply(ctx: Context, config: Config): void {
  const cache = new Map<string, MapCoordinate>()
  const providerOptions = (signal: AbortSignal) => ({ signal, timeoutMs: config.requestTimeoutMs, userAgent: config.userAgent })
  ctx.tools.register(defineTool({
    name: 'hotel_map',
    description: 'Plot a bounded list of known hotels by address. Optionally compare driving and public-transport routes from each hotel to one destination. This tool does not search prices, availability, or inventory.',
    parameters: {
      title: { type: 'string', description: 'Short title for the map.' },
      hotels: {
        type: 'array', required: true,
        items: { type: 'object', additionalProperties: false, properties: {
          name: { type: 'string', required: true }, address: { type: 'string', required: true },
          latitude: { type: 'number' }, longitude: { type: 'number' },
        } },
      },
      destination: { type: 'object', additionalProperties: false, properties: {
        name: { type: 'string', required: true }, address: { type: 'string', required: true },
        latitude: { type: 'number' }, longitude: { type: 'number' },
      } },
      departure_time: { type: 'string', description: 'ISO 8601 departure time for public transport; defaults to execution time.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        mapId: { type: 'string', required: true }, resolvedHotels: { type: 'integer', required: true },
        unresolvedHotels: { type: 'integer', required: true }, destinationResolved: { type: 'boolean', required: true },
      } },
      render: (_args, value) => [{ type: 'text', text: `Created hotel map with ${value.resolvedHotels} resolved and ${value.unresolvedHotels} unresolved hotels${value.destinationResolved ? ', including destination routes' : ''}.` }],
    },
    async execute(args, exec) {
      if (exec.agent === undefined) throw new Error('hotel_map requires an owning agent session')
      if (args.hotels.length === 0 || args.hotels.length > config.maxHotels) {
        throw new Error(`hotel_map requires 1..${config.maxHotels} hotels`)
      }
      const hotels = args.hotels.map((hotel, index) => normalizePlace(hotel, `hotel ${index + 1}`))
      const destinationInput = args.destination === undefined ? undefined : normalizePlace(args.destination, 'destination')
      let lastGeocode = 0
      const resolve = async (place: PlaceInput): Promise<MapCoordinate | undefined> => {
        const direct = directCoordinate(place)
        if (direct !== undefined) return direct
        const key = place.address.toLocaleLowerCase()
        const cached = cache.get(key)
        if (cached !== undefined) return cached
        const remaining = config.geocodeIntervalMs - (Date.now() - lastGeocode)
        if (remaining > 0) await wait(remaining, exec.signal)
        const value = await geocode(config.geocoderBaseUrl, place.address, providerOptions(exec.signal))
        lastGeocode = Date.now()
        if (value !== undefined) cache.set(key, value)
        return value
      }
      const destinationCoordinate = destinationInput === undefined ? undefined : await resolve(destinationInput)
      const destination: MapDestination | undefined = destinationInput === undefined || destinationCoordinate === undefined
        ? undefined : { name: destinationInput.name, address: destinationInput.address, ...destinationCoordinate }
      const mapped: MappedHotel[] = []
      for (const hotel of hotels) {
        let coordinate: MapCoordinate | undefined
        try { coordinate = await resolve(hotel) } catch (error) {
          mapped.push({ name: hotel.name, address: hotel.address, diagnostic: error instanceof Error ? error.message : String(error) })
          continue
        }
        if (coordinate === undefined) { mapped.push({ name: hotel.name, address: hotel.address, diagnostic: 'address not found' }); continue }
        if (destination === undefined) { mapped.push({ name: hotel.name, address: hotel.address, coordinate }); continue }
        const resolvedCoordinate = coordinate
        const departure = args.departure_time ?? new Date().toISOString()
        const [driving, transit] = await Promise.all([
          safeRoute(() => drivingRoute(config.drivingBaseUrl, resolvedCoordinate, destination, providerOptions(exec.signal))),
          safeRoute(() => transitRoute(config.transitBaseUrl, resolvedCoordinate, destination, departure, providerOptions(exec.signal))),
        ])
        mapped.push({ name: hotel.name, address: hotel.address, coordinate, driving, transit })
      }
      const mapId = randomUUID() as TravelMapId
      const data: TravelMapShowData = {
        mapId, title: args.title?.trim() || 'Hotel map',
        ...destination === undefined ? {} : { destination }, hotels: mapped,
        attributions: [
          { label: '© OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' },
          { label: 'OSRM', url: 'https://project-osrm.org/' },
          { label: 'Transitous sources', url: 'https://transitous.org/sources/' },
        ],
      }
      exec.agent.session.append('travel-map/show', data)
      const resolvedHotels = mapped.filter(hotel => hotel.coordinate !== undefined).length
      return { mapId, resolvedHotels, unresolvedHotels: mapped.length - resolvedHotels, destinationResolved: destination !== undefined }
    },
    presentCall: args => ({ card: 'generic', title: 'Build hotel map', kind: 'search', rawInput: { hotels: args.hotels.length, destination: args.destination?.name } }),
  }))
}
