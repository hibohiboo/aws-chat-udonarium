import { PeerId } from '@/domain/peerUser/types';

export type EventObject<EventName, T> = {
  data: T;
  eventName: EventName;
  isSendFromSelf: boolean;
  sendFrom: PeerId;
};
