import { afterEach, describe, expect, it, vi } from 'vitest'
import { drivingRoute, geocode, transitRoute } from '../src/providers.ts'

afterEach(() => { vi.unstubAllGlobals() })

const options = { signal: new AbortController().signal, timeoutMs: 1000, userAgent: 'hotel-map-test/1' }

function response(value: unknown): Response { return new Response(JSON.stringify(value), { status: 200 }) }

describe('free map providers', () => {
  it('normalizes Nominatim coordinates and identifies the client', async () => {
    const fetch = vi.fn((_input: URL | RequestInfo, _init?: RequestInit) => Promise.resolve(response([{ lat: '59.3', lon: '18.1' }])))
    vi.stubGlobal('fetch', fetch)
    await expect(geocode('https://geo.example/', 'Hotel One', options)).resolves.toEqual({ latitude: 59.3, longitude: 18.1 })
    expect(fetch.mock.calls[0]?.[1]).toMatchObject({ headers: { 'User-Agent': 'hotel-map-test/1' } })
  })

  it('normalizes OSRM distance, duration, and GeoJSON geometry', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(response({ routes: [{ duration: 90, distance: 1200, geometry: { coordinates: [[18.1, 59.3], [18.2, 59.4]] } }] }))))
    await expect(drivingRoute('https://route.example/', { latitude: 59.3, longitude: 18.1 }, { latitude: 59.4, longitude: 18.2 }, options)).resolves.toEqual({
      status: 'available', durationSeconds: 90, distanceMeters: 1200,
      geometry: [{ latitude: 59.3, longitude: 18.1 }, { latitude: 59.4, longitude: 18.2 }],
    })
  })

  it('decodes Transitous leg geometry and degrades an empty itinerary', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(response({ itineraries: [{ duration: 600, legs: [{ distance: 700, legGeometry: { points: '_p~iF~ps|U_ulLnnqC_mqNvxq`@', precision: 5 } }] }] }))
      .mockResolvedValueOnce(response({ itineraries: [] }))
    vi.stubGlobal('fetch', fetch)
    const from = { latitude: 38.5, longitude: -120.2 }
    const to = { latitude: 43.252, longitude: -126.453 }
    await expect(transitRoute('https://transit.example/', from, to, '2026-08-20T10:00:00Z', options)).resolves.toMatchObject({
      status: 'available', durationSeconds: 600, distanceMeters: 700,
      geometry: [{ latitude: 38.5, longitude: -120.2 }, { latitude: 40.7, longitude: -120.95 }, { latitude: 43.252, longitude: -126.453 }],
    })
    await expect(transitRoute('https://transit.example/', from, to, '2026-08-20T10:00:00Z', options)).resolves.toEqual({ status: 'unavailable' })
  })
})
