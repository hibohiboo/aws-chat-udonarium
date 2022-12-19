/* eslint-disable @typescript-eslint/no-unused-expressions */

import { ImageSharingSystem } from '../class/core/file-storage/image-sharing-system';
import { ImageStorage } from '../class/core/file-storage/image-storage';
import { ObjectFactory } from '../class/core/synchronize-object/object-factory';
import { ObjectSerializer } from '../class/core/synchronize-object/object-serializer';
import { ObjectStore } from '../class/core/synchronize-object/object-store';
import { ObjectSynchronizer } from '../class/core/synchronize-object/object-synchronizer';
import { createPeerUser, initRooms } from '.';

const initGameObject = () => {
  ImageSharingSystem.instance.initialize();
  ImageStorage.instance;
  ObjectFactory.instance;
  ObjectSerializer.instance;
  ObjectStore.instance;
  ObjectSynchronizer.instance.initialize();
};

export const initUdonarium = async (updateGameObjectHandler: () => void) => {
  initGameObject();
  const user = createPeerUser(updateGameObjectHandler);
  const rooms = await initRooms();
  return { user, rooms };
};
