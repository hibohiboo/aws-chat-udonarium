import { PeerContext } from '../udonarium/class/core/system/network/peer-context';

export type PeerRoom = {
  alias: string;
  roomName: string;
  peerContexts: PeerContext[];
};
export type Room = {
  alias: string;
  roomName: string;
  peerContexts: { peerId: string; roomId: string; digestUserId: string }[];
};
