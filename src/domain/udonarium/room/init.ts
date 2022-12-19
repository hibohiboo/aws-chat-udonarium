/* eslint-disable @typescript-eslint/no-unused-expressions */

import { ImageSharingSystem } from '../class/core/file-storage/image-sharing-system';
import { ImageStorage } from '../class/core/file-storage/image-storage';
import { ObjectFactory } from '../class/core/synchronize-object/object-factory';
import { ObjectSerializer } from '../class/core/synchronize-object/object-serializer';
import { ObjectStore } from '../class/core/synchronize-object/object-store';
import { ObjectSynchronizer } from '../class/core/synchronize-object/object-synchronizer';
import { EventSystem, Network } from '../class/core/system';
import { EVENT_NAME } from '../event/constants';
import { createPeerCursor } from './peerUser';
import { initRooms } from '.';

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
const createPeerUser = (updateCallback: () => void) => {
  const myUser = createPeerCursor();

  EventSystem.register('application init')
    .on(EVENT_NAME.UPDATE_GAME_OBJECT, (event) => {
      console.log(EVENT_NAME.UPDATE_GAME_OBJECT, event);
      updateCallback();
    })
    .on(EVENT_NAME.DELETE_GAME_OBJECT, (event) => {
      console.log(EVENT_NAME.DELETE_GAME_OBJECT, event);
    })
    .on(EVENT_NAME.OPEN_NETWORK, (event) => {
      console.log(EVENT_NAME.OPEN_NETWORK, event.data.peerId);
      myUser.peerId = Network.peerContext.peerId;
      myUser.userId = Network.peerContext.userId;
    })
    .on(EVENT_NAME.NETWORK_ERROR, (event) => {
      console.log(EVENT_NAME.NETWORK_ERROR, event.data.peerId);
      const { errorType } = event.data;
      const { errorMessage } = event.data;

      (async () => {
        // SKyWayエラーハンドリング
        const quietErrorTypes = ['peer-unavailable'];
        const reconnectErrorTypes = [
          'disconnected',
          'socket-error',
          'unavailable-id',
          'authentication',
          'server-error',
        ];

        if (quietErrorTypes.includes(errorType)) return;
        alert(`ネットワークエラー -> ${errorMessage}`);

        if (!reconnectErrorTypes.includes(errorType)) return;
        alert(`ネットワークエラー -> このウィンドウを閉じると再接続を試みます。`);
        Network.open();
      })();
    })
    .on(EVENT_NAME.CONNECT_PEER, (event) => {
      if (event.isSendFromSelf) {
        console.log('send from self peer', event);
      }
      console.log(EVENT_NAME.CONNECT_PEER, event);
    })
    .on(EVENT_NAME.DISCONNECT_PEER, (event) => {
      console.log(EVENT_NAME.DISCONNECT_PEER, event);
    });
  return myUser;
};
