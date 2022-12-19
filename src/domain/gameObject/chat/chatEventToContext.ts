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
  if (event.data.syncData.attributes.originFrom) {
    const name = getUserName(event.data.syncData.attributes.originFrom);
    return {
      message: event.data.syncData.value,
      sender: `${name} : ${event.data.syncData.attributes.from}:  ${event.data.syncData.attributes.originFrom}`,
      isSelf: event.isSendFromSelf,
    };
  }
  const sender = getUserName(event.data.syncData.attributes.from);

  return {
    message: event.data.syncData.value,
    sender: `${sender}: ${event.data.syncData.attributes.from}`,
    isSelf: event.isSendFromSelf,
  };
};
