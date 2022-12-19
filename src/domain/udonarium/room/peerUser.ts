import { PeerUser } from '@/domain/peerUser/types';

let peerUser: PeerUser | null = null;

export const setPeerUser = (_peer: PeerUser) => {
  peerUser = _peer;
};
export const getPeerUser = () => {
  if (!peerUser) throw Error('接続を行っていない状態でのユーザ取得は禁止です');
  return peerUser;
};
