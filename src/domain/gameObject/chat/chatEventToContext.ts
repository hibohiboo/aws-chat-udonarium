import { PeerCursor } from '@/domain/udonarium/class/peer-cursor';
import { ChatMessageContext, ChatMessageEvent } from './types';

const getUserName = (userId: string) => {
  const from = PeerCursor.findByUserId(userId);
  if (!from) {
    console.warn('user not found.', userId);
    return '';
  }
  return from.name;
};

export const chatEventToModel = (event: ChatMessageEvent): ChatMessageContext | null => {
  const base = {
    id: event.data.identifier,
    message: event.data.syncData.value,
    isSelf: event.isSendFromSelf,
    timestamp: event.data.syncData.attributes.timestamp,
    tab: event.data.syncData.parentIdentifier,
  };
  if (event.data.syncData.attributes.originFrom) {
    const name = getUserName(event.data.syncData.attributes.originFrom);
    return {
      ...base,
      sender: `${name} : ${event.data.syncData.attributes.from}:  ${event.data.syncData.attributes.originFrom}`,
      isSelf: event.isSendFromSelf,
    };
  }
  const sender = getUserName(event.data.syncData.attributes.from);

  return {
    ...base,
    sender: `${sender}: ${event.data.syncData.attributes.from}`,
  };
};
