import type { MapCoordinate, MapRoute } from './types.ts'

interface ProviderOptions {
  readonly signal: AbortSignal
  readonly timeoutMs: number
  readonly userAgent: string
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function finite(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

async function json(url: URL, options: ProviderOptions): Promise<unknown> {
  const timeout = AbortSignal.timeout(options.timeoutMs)
  const signal = AbortSignal.any([options.signal, timeout])
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': options.userAgent }, signal })
  if (!response.ok) throw new Error(`provider HTTP ${response.status}`)
  return response.json() as Promise<unknown>
}

/**
 * Resolve one address through a Nominatim-compatible endpoint.
 * @param baseUrl - provider root URL.
 * @param address - human-readable address to resolve.
 * @param options - cancellation, timeout, and request identity.
 * @returns the first finite coordinate, or undefined when none is available.
 */
export async function geocode(
  baseUrl: string,
  address: string,
  options: ProviderOptions,
): Promise<MapCoordinate | undefined> {
  const url = new URL('search', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('q', address)
  const body = await json(url, options)
  if (!Array.isArray(body) || body.length === 0) return undefined
  const first = record(body[0])
  const latitude = Number(text(first?.lat))
  const longitude = Number(text(first?.lon))
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : undefined
}

function coordinateArray(value: unknown): MapCoordinate[] | undefined {
  if (!Array.isArray(value)) return undefined
  const result: MapCoordinate[] = []
  for (const point of value) {
    if (!Array.isArray(point) || point.length < 2) return undefined
    const longitude = finite(point[0])
    const latitude = finite(point[1])
    if (longitude === undefined || latitude === undefined) return undefined
    result.push({ latitude, longitude })
  }
  return result.length >= 2 ? result : undefined
}

/**
 * Query one OSRM-compatible driving route.
 * @param baseUrl - provider root URL.
 * @param from - route origin.
 * @param to - route destination.
 * @param options - cancellation, timeout, and request identity.
 * @returns normalized availability, geometry, duration, and distance.
 */
export async function drivingRoute(
  baseUrl: string,
  from: MapCoordinate,
  to: MapCoordinate,
  options: ProviderOptions,
): Promise<MapRoute> {
  const path = `route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}`
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)
  url.searchParams.set('overview', 'full')
  url.searchParams.set('geometries', 'geojson')
  const body = record(await json(url, options))
  const routes = body?.routes
  if (!Array.isArray(routes) || routes.length === 0) return { status: 'unavailable' }
  const route = record(routes[0])
  const geometry = coordinateArray(record(route?.geometry)?.coordinates)
  const durationSeconds = finite(route?.duration)
  const distanceMeters = finite(route?.distance)
  if (geometry === undefined || durationSeconds === undefined || distanceMeters === undefined) {
    throw new Error('OSRM returned an invalid route')
  }
  return { status: 'available', durationSeconds, distanceMeters, geometry }
}

function decodePolyline(encoded: string, precision: number): MapCoordinate[] {
  const factor = 10 ** precision
  const result: MapCoordinate[] = []
  let index = 0
  let latitude = 0
  let longitude = 0
  const next = (): number => {
    let shift = 0
    let value = 0
    while (index < encoded.length) {
      const byte = encoded.charCodeAt(index++) - 63
      value |= (byte & 0x1f) << shift
      shift += 5
      if (byte < 0x20) return (value & 1) !== 0 ? ~(value >> 1) : value >> 1
    }
    throw new Error('invalid encoded route geometry')
  }
  while (index < encoded.length) {
    latitude += next()
    longitude += next()
    result.push({ latitude: latitude / factor, longitude: longitude / factor })
  }
  return result
}

/**
 * Query one Transitous MOTIS v6 public-transport itinerary.
 * @param baseUrl - provider root URL.
 * @param from - route origin.
 * @param to - route destination.
 * @param departureTime - ISO 8601 departure timestamp.
 * @param options - cancellation, timeout, and request identity.
 * @returns the normalized first itinerary or an unavailable result.
 */
export async function transitRoute(
  baseUrl: string,
  from: MapCoordinate,
  to: MapCoordinate,
  departureTime: string,
  options: ProviderOptions,
): Promise<MapRoute> {
  const url = new URL('api/v6/plan', baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)
  url.searchParams.set('fromPlace', `${from.latitude},${from.longitude}`)
  url.searchParams.set('toPlace', `${to.latitude},${to.longitude}`)
  url.searchParams.set('time', departureTime)
  const body = record(await json(url, options))
  const itineraries = body?.itineraries
  if (!Array.isArray(itineraries) || itineraries.length === 0) return { status: 'unavailable' }
  const itinerary = record(itineraries[0])
  const durationSeconds = finite(itinerary?.duration)
  const legs = itinerary?.legs
  if (durationSeconds === undefined || !Array.isArray(legs)) throw new Error('Transitous returned an invalid itinerary')
  const geometry: MapCoordinate[] = []
  let distanceMeters = 0
  for (const rawLeg of legs) {
    const leg = record(rawLeg)
    const legGeometry = record(leg?.legGeometry)
    const points = text(legGeometry?.points)
    const precision = finite(legGeometry?.precision)
    if (points !== undefined && precision !== undefined) geometry.push(...decodePolyline(points, precision))
    distanceMeters += finite(leg?.distance) ?? 0
  }
  return {
    status: 'available',
    durationSeconds,
    ...distanceMeters > 0 ? { distanceMeters } : {},
    ...geometry.length >= 2 ? { geometry } : {},
  }
}
