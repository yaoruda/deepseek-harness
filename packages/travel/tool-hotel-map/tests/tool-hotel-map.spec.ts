import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { CallId } from '@deepseek-ai/dsh-llm'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import { KNOWN_SESSION_EVENT_TYPES, Session, SessionId } from '@deepseek-ai/dsh-session'
import type { Agent } from '@deepseek-ai/dsh-agent'
import * as HotelMap from '../src/index.ts'

afterEach(() => { vi.unstubAllGlobals() })

function agentWithSession(): Agent & { session: Session } {
  const session = Session.create(SessionId('hotel-map-test'))
  return { id: session.id, session } as unknown as Agent & { session: Session }
}

describe('hotel_map tool', () => {
  it('publishes its required event in the persistence vocabulary', () => {
    expect(KNOWN_SESSION_EVENT_TYPES.has('travel-map/show')).toBe(true)
  })

  it('appends one complete replay event after both route providers settle', async () => {
    const fetch = vi.fn((input: URL | RequestInfo) => {
      const url = String(input)
      if (url.includes('/route/v1/driving/')) return Promise.resolve(new Response(JSON.stringify({ routes: [{ duration: 300, distance: 1800, geometry: { coordinates: [[18.07, 59.34], [18.06, 59.33]] } }] })))
      if (url.includes('/api/v6/plan')) return Promise.resolve(new Response(JSON.stringify({ itineraries: [] })))
      throw new Error(`unexpected URL ${url}`)
    })
    vi.stubGlobal('fetch', fetch)
    const ctx = new Context()
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRuntime)
    await ctx.plugin(HotelMap, {
      geocoderBaseUrl: 'https://geo.example/', drivingBaseUrl: 'https://route.example/', transitBaseUrl: 'https://transit.example/',
      userAgent: 'hotel-map-test/1', requestTimeoutMs: 1000, geocodeIntervalMs: 1000, maxHotels: 5,
    })
    const agent = agentWithSession()
    const result = await ctx.tools.execute({
      signal: new AbortController().signal, callId: CallId('map-call'), name: 'hotel_map', agent,
      arguments: {
        title: 'Stockholm',
        hotels: [{ name: 'One', address: 'Street 1', latitude: 59.34, longitude: 18.07 }],
        destination: { name: 'Central', address: 'Centralplan', latitude: 59.33, longitude: 18.06 },
        departure_time: '2026-08-20T10:00:00Z',
      },
    })
    expect(result.isError).toBe(false)
    const event = agent.session.events.findLast(item => item.type === 'travel-map/show')
    expect(event?.data).toMatchObject({
      title: 'Stockholm', destination: { name: 'Central' },
      hotels: [{ name: 'One', driving: { status: 'available', durationSeconds: 300 }, transit: { status: 'unavailable' } }],
    })
    expect(agent.session.events.filter(item => item.type === 'travel-map/show')).toHaveLength(1)
  })
})
