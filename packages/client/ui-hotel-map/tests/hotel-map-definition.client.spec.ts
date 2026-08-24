import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { hotelMapDefinition } from '../src/client/hotel-map-definition.ts'
import type { ConversationEventInput } from '@deepseek-ai/dsh-client-runtime/client'
import type { TravelMapShowData } from '@deepseek-ai/dsh-tool-hotel-map/types'

const data: TravelMapShowData = {
  mapId: 'map-1' as TravelMapShowData['mapId'], title: 'Stockholm hotels',
  destination: { name: 'Central', address: 'Centralplan', latitude: 59.33, longitude: 18.06 },
  hotels: [{ name: 'One', address: 'Street 1', coordinate: { latitude: 59.34, longitude: 18.07 }, driving: { status: 'available', durationSeconds: 300, distanceMeters: 1800, geometry: [{ latitude: 59.34, longitude: 18.07 }, { latitude: 59.33, longitude: 18.06 }] }, transit: { status: 'unavailable' } }],
  attributions: [{ label: 'OSM', url: 'https://www.openstreetmap.org/copyright' }],
}

describe('hotel map Conversation Definition', () => {
  it('matches one complete event and projects the same durable payload', () => {
    const input = { event: { seq: 3, time: 1, type: 'travel-map/show', data }, view: undefined } as ConversationEventInput
    const match = hotelMapDefinition.match(input.event)
    expect(match).toEqual({ id: 'map-1', role: 'start' })
    const state = hotelMapDefinition.start({} as never, { ...input, role: 'start', location: { kind: 'unresolved' } }, {} as never)
    expect(state).toBe(data)
  })

  it('anchors MapLibre markers in the map coordinate layer', () => {
    const css = readFileSync(new URL('../src/client/HotelMapPanel.module.css', import.meta.url), 'utf8')
    expect(css).toMatch(/:global\(\.maplibregl-marker\)\s*\{[^}]*position:\s*absolute;[^}]*top:\s*0;[^}]*left:\s*0;/s)
  })
})
