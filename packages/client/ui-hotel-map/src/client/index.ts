import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { HotelMapPanel } from './HotelMapPanel.tsx'
import { hotelMapDefinition } from './hotel-map-definition.ts'
import { en, NS, type HotelMapKey, zh } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { hotelMap: HotelMapKey }
}

export const inject = ['conversationEvents', 'slots', 'locale']
/** Register the durable hotel-map Definition, copy, and keyed renderer. */
export function apply(ctx: ClientContext): void {
  ctx.conversationEvents.register(hotelMapDefinition)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-hotel-map: dictionaries')
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({ name: 'conversation.chat.node', key: 'hotel-map', locale: NS }, HotelMapPanel))
}
