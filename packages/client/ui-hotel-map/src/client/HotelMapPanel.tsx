import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap, type Marker } from 'maplibre-gl'
import type { MapRoute, MappedHotel } from '@deepseek-ai/dsh-tool-hotel-map/types'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { HotelMapKey } from './locales.ts'
import css from './HotelMapPanel.module.css'

type Props = PropsRuntime<'conversation.chat.node', 'hotel-map'> & PropsLocale<'hotelMap'>
type Mode = 'driving' | 'transit'

function routeFor(hotel: MappedHotel, mode: Mode): MapRoute | undefined { return mode === 'driving' ? hotel.driving : hotel.transit }

function routeText(route: MapRoute | undefined, t: Props['t']): string {
  if (route === undefined || route.status === 'unavailable') return t('route.unavailable')
  if (route.status === 'failed') return t('route.failed')
  const parts: string[] = []
  if (route.durationSeconds !== undefined) parts.push(t('duration.minutes', { minutes: Math.round(route.durationSeconds / 60) }))
  if (route.distanceMeters !== undefined) parts.push(t('distance.km', { km: (route.distanceMeters / 1000).toFixed(1) }))
  return parts.join(' · ')
}

const EMPTY_ROUTE = { type: 'FeatureCollection', features: [] } as const

/** Render durable hotel markers and one selected route without replay-time provider calls. */
export function HotelMapPanel({ node, t }: Props) {
  const mappedIndexes = useMemo(
    () => node.data.hotels.flatMap((hotel, index) => hotel.coordinate === undefined ? [] : [index]),
    [node.data.hotels],
  )
  const [selected, setSelected] = useState(mappedIndexes[0] ?? 0)
  const [mode, setMode] = useState<Mode>('driving')
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap>()
  const markers = useRef<Marker[]>([])
  const activeHotel = node.data.hotels[selected]
  const activeRoute = activeHotel === undefined ? undefined : routeFor(activeHotel, mode)

  useEffect(() => {
    if (container.current === null) return
    const value = new maplibregl.Map({
      container: container.current,
      style: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 } }, layers: [{ id: 'osm', type: 'raster', source: 'osm' }] },
      center: [0, 0], zoom: 1, attributionControl: false,
    })
    map.current = value
    const bounds = new maplibregl.LngLatBounds()
    node.data.hotels.forEach((hotel, index) => {
      if (hotel.coordinate === undefined) return
      const element = document.createElement('button')
      element.type = 'button'; element.className = css.marker ?? ''; element.textContent = String(index + 1)
      element.setAttribute('aria-label', hotel.name); element.dataset.hotelIndex = String(index)
      element.addEventListener('click', () => { setSelected(index) })
      markers.current.push(new maplibregl.Marker({ element })
        .setLngLat([hotel.coordinate.longitude, hotel.coordinate.latitude]).addTo(value))
      bounds.extend([hotel.coordinate.longitude, hotel.coordinate.latitude])
    })
    if (node.data.destination !== undefined) {
      const element = document.createElement('div'); element.className = css.destination ?? ''; element.title = node.data.destination.name
      markers.current.push(new maplibregl.Marker({ element })
        .setLngLat([node.data.destination.longitude, node.data.destination.latitude]).addTo(value))
      bounds.extend([node.data.destination.longitude, node.data.destination.latitude])
    }
    value.on('load', () => {
      value.addSource('selected-route', { type: 'geojson', data: EMPTY_ROUTE })
      value.addLayer({ id: 'selected-route', type: 'line', source: 'selected-route', paint: { 'line-color': '#e8590c', 'line-width': 5, 'line-opacity': 0.85 } })
      if (!bounds.isEmpty()) value.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 })
    })
    return () => { markers.current = []; value.remove(); map.current = undefined }
  }, [node.data])

  useEffect(() => {
    for (const marker of markers.current) {
      const index = marker.getElement().dataset.hotelIndex
      if (index !== undefined) marker.getElement().dataset.active = String(Number(index) === selected)
    }
    const source = map.current?.getSource('selected-route') as GeoJSONSource | undefined
    const geometry = activeRoute?.status === 'available' ? activeRoute.geometry : undefined
    source?.setData(geometry === undefined ? EMPTY_ROUTE : { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: geometry.map(point => [point.longitude, point.latitude]) } })
  }, [activeRoute, selected])

  return <section className={css.root} data-hotel-map>
    <header className={css.header}><span className={css.title}>{node.data.title}</span>
      {node.data.destination !== undefined && <div className={css.modes}>
        {(['driving', 'transit'] as const).map(value => <button key={value} type="button" className={css.mode} data-active={mode === value} onClick={() => { setMode(value) }}>{t(`mode.${value}` as HotelMapKey)}</button>)}
      </div>}</header>
    <div className={css.body}><div className={css.list}>{node.data.hotels.map((hotel, index) => <button key={`${hotel.name}:${hotel.address}`} type="button" className={css.hotel} data-active={selected === index} onClick={() => { setSelected(index) }} aria-label={t('hotel.select', { name: hotel.name })}>
      <span className={css.index}>{index + 1}</span><span><span className={css.name}>{hotel.name}</span><span className={css.address}>{hotel.address}</span>{hotel.coordinate === undefined ? <span className={css.diagnostic}>{hotel.diagnostic ?? t('address.unresolved')}</span> : node.data.destination !== undefined && <span className={css.route}>{routeText(routeFor(hotel, mode), t)}</span>}</span>
    </button>)}</div><div ref={container} className={css.map} /></div>
    <footer className={css.attribution}>{node.data.attributions.map(item => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.label}</a>)}</footer>
  </section>
}
