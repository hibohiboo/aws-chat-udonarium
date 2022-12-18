import { PeerContext } from '../udonarium/class/core/system/network/peer-context';

export type Room = {
  alias: string;
  roomName: string;
  peerContexts: PeerContext[];
};
