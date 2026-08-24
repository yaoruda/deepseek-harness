/** Dictionary namespace owned by the hotel-map renderer. */
export const NS = 'hotelMap'
/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  'mode.driving': '驾车', 'mode.transit': '公交', 'destination': '目的地',
  'route.unavailable': '暂无路线数据', 'route.failed': '路线查询失败',
  'address.unresolved': '地址无法定位', 'duration.minutes': '{minutes} 分钟',
  'distance.km': '{km} 公里', 'hotel.select': '查看 {name}',
}
/** Key domain of the hotel-map namespace. */
export type HotelMapKey = keyof typeof zh
/** English dictionary, key-identical to the Chinese source. */
export const en: Record<HotelMapKey, string> = {
  'mode.driving': 'Driving', 'mode.transit': 'Transit', 'destination': 'Destination',
  'route.unavailable': 'Route unavailable', 'route.failed': 'Route lookup failed',
  'address.unresolved': 'Address could not be located', 'duration.minutes': '{minutes} min',
  'distance.km': '{km} km', 'hotel.select': 'View {name}',
}
