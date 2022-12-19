import { PeerCursor } from '@/domain/udonarium/class/peer-cursor';
import { ChatMessageContext, ChatMessageEvent } from './types';

export const chatEventToModel = (event: ChatMessageEvent): ChatMessageContext | null => {
  const from = PeerCursor.findByUserId(event.data.syncData.attributes.originFrom);
  if (!from) {
    return null;
  }
  return {
    message: event.data.syncData.value,
    sender: from.name,
    isSelf: event.isSendFromSelf,
  };
};
