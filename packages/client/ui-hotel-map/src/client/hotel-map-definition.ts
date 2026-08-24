import type { ChatConversationViewNode, ConversationNodeDefinition } from '@deepseek-ai/dsh-client-runtime/client'
import type { TravelMapShowData } from '@deepseek-ai/dsh-tool-hotel-map/types'

declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
  interface ChatNodeDataMap { 'hotel-map': TravelMapShowData }
}

/** Fold one complete travel-map event into one replayable Chat node. */
export const hotelMapDefinition: ConversationNodeDefinition<TravelMapShowData> = {
  kind: 'hotel-map', target: 'chat',
  match: event => event.type === 'travel-map/show'
    ? { id: String(event.data.mapId), role: 'start' }
    : null,
  start: (_context, match) => {
    if (match.event.type !== 'travel-map/show') throw new Error('hotel-map start requires travel-map/show')
    return match.event.data
  },
  update: context => context.state,
  buildViewNode: (context): ChatConversationViewNode | null => context.start === undefined ? null : ({
    key: context.key, kind: 'hotel-map', id: context.id, target: 'chat',
    anchorSeq: context.start.event.seq, location: context.start.location,
    visibility: 'visible', data: context.state,
  }),
}
