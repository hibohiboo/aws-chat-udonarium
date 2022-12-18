import { PeerRoom } from '@/domain/peerRoom/types';

let rooms: PeerRoom[] = [];

export const setRooms = (_rooms: PeerRoom[]) => {
  rooms = _rooms;
};
export const getRooms = () => rooms;
