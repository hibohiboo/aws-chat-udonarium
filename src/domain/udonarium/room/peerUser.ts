import { ImageFile } from '../class/core/file-storage/image-file';
import { ImageStorage } from '../class/core/file-storage/image-storage';
import { ObjectStore } from '../class/core/synchronize-object/object-store';
import { PeerCursor } from '../class/peer-cursor';

let peerUser: PeerCursor | null = null;

export const setPeerUser = (_peer: PeerCursor) => {
  peerUser = _peer;
};
export const getPeerUser = () => {
  if (!peerUser) throw Error('接続を行っていない状態でのユーザ取得は禁止です');
  return peerUser;
};
export const createPeerCursor = () => {
  const fileContext = ImageFile.createEmpty('none_icon').toContext();
  fileContext.url = './assets/images/ic_account_circle_black_24dp_2x.png';
  const noneIconImage = ImageStorage.instance.add(fileContext);
  const myCursor = PeerCursor.createMyCursor();
  myCursor.name = 'プレイヤー';
  myCursor.imageIdentifier = noneIconImage.identifier;
  setPeerUser(myCursor);
  return myCursor;
};
export const getUsers = () => {
  return ObjectStore.instance.getObjects<PeerCursor>(PeerCursor);
};
export const changeUserName = (name: string) => {
  const cusor = getPeerUser();
  cusor.name = name;
};
