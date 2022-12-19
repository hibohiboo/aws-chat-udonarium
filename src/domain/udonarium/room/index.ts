/* eslint-disable @typescript-eslint/no-unused-expressions */

import { PeerRoom } from '@/domain/peerRoom/types';
import { ObjectFactory } from '../class/core/synchronize-object/object-factory';
import { ObjectSerializer } from '../class/core/synchronize-object/object-serializer';
import { ObjectStore } from '../class/core/synchronize-object/object-store';
import { ObjectSynchronizer } from '../class/core/synchronize-object/object-synchronizer';
import { EventSystem, Network } from '../class/core/system';
import { PeerContext } from '../class/core/system/network/peer-context';
import { PeerCursor } from '../class/peer-cursor';
import { EVENT_NAME } from '../event/constants';
import { createPeerCursor } from './peerUser';

const skywayKey = import.meta.env.VITE_PUBLIC_SKYWAY_KEY;

const initNetwork = () =>
  new Promise<string>((resolve) => {
    EventSystem.register('lobby').on(EVENT_NAME.OPEN_NETWORK, () => {
      resolve(Network.peerId);
    });
    Network.setApiKey(skywayKey);
    Network.open();
  });

const getRooms = async () => {
  const rooms = [];
  const peersOfroom: { [room: string]: PeerContext[] } = {};
  const peerIds = await Network.listAllPeers();

  for (const peerId of peerIds) {
    const context = PeerContext.parse(peerId);
    if (context.isRoom) {
      const alias = context.roomId + context.roomName;
      if (!(alias in peersOfroom)) {
        peersOfroom[alias] = [];
      }
      peersOfroom[alias].push(context);
    }
  }
  for (const alias in peersOfroom) {
    rooms.push({
      alias,
      roomName: peersOfroom[alias][0].roomName,
      peerContexts: peersOfroom[alias],
    });
  }
  rooms.sort((a, b) => {
    if (a.alias < b.alias) return -1;
    if (a.alias > b.alias) return 1;
    return 0;
  });
  return rooms;
};

const initAndGetRooms = async () => {
  await initNetwork();

  // 初回では接続できないことがあるので、何回かリトライする
  for (let i = 0, maxRetries = 5; i < maxRetries; i++) {
    const rooms = await getRooms();
    if (rooms.length !== 0) return rooms;
    await new Promise((r) => setTimeout(r, 200));
  }
  return [];
};

export const createRoom = async (roomName: string, roomPassword = '') => {
  const userId = Network.peerContext ? Network.peerContext.userId : PeerContext.generateId();
  Network.open(userId, PeerContext.generateId('***'), roomName, roomPassword);
};
export const createPeerUser = (updateCallback: () => void) => {
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
      console.log('OPEN_NETWORK', event.data.peerId);
      myUser.peerId = Network.peerContext.peerId;
      myUser.userId = Network.peerContext.userId;
    })
    .on(EVENT_NAME.NETWORK_ERROR, (event) => {
      console.log('NETWORK_ERROR', event.data.peerId);
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

const resetNetwork = () => {
  if (Network.peerContexts.length < 1) {
    Network.open();
    if (PeerCursor.myCursor == null) return;
    PeerCursor.myCursor.peerId = Network.peerId;
  }
};
export const getUserId = () => {
  if (Network.peerContext) {
    console.log('peercontext id');
    return Network.peerContext.userId;
  }
  console.log('generated user id');
  return PeerContext.generateId();
};
const openRoom = (roomId: string, loomName: string, pass: string = '') => {
  const userId = getUserId();
  Network.open(userId, roomId, loomName, pass);
  if (PeerCursor.myCursor == null) return;
  PeerCursor.myCursor.peerId = Network.peerId;
};
const listenPeerEvent = (triedPeer: string[], peerContexts: PeerContext[]) => {
  EventSystem.register(triedPeer)
    .on(EVENT_NAME.CONNECT_PEER, (event) => {
      console.log('接続成功！', event.data.peerId);
      triedPeer.push(event.data.peerId);
      console.log(`接続成功 ${triedPeer.length}/${peerContexts.length}`);
      if (peerContexts.length <= triedPeer.length) {
        resetNetwork();
        EventSystem.unregister(triedPeer);
      }
    })
    .on(EVENT_NAME.DISCONNECT_PEER, (event) => {
      console.warn('接続失敗', event.data.peerId);
      triedPeer.push(event.data.peerId);
      console.warn(`接続失敗 ${triedPeer.length}/${peerContexts.length}`);
      if (peerContexts.length <= triedPeer.length) {
        resetNetwork();
        EventSystem.unregister(triedPeer);
      }
    });
};
export const connectRooms = (peerContexts: PeerContext[]) => {
  const triedPeer: string[] = [];
  EventSystem.register(triedPeer).on(EVENT_NAME.OPEN_NETWORK, (event) => {
    console.log('LobbyComponent OPEN_PEER', event.data.peerId);
    EventSystem.unregister(triedPeer);

    for (const context of peerContexts) {
      Network.connect(context.peerId);
    }

    listenPeerEvent(triedPeer, peerContexts);
  });
};

export const initGameObject = () => {
  ObjectFactory.instance;
  ObjectSerializer.instance;
  ObjectStore.instance;
  ObjectSynchronizer.instance.initialize();
};

export const initRooms = async (): Promise<PeerRoom[]> => {
  const rooms = await initAndGetRooms();
  return rooms;
};
export const connectRoomByRoomAlias = async (alias: string) => {
  const rooms = await getRooms();
  const room = rooms.find((room) => room.alias === alias);
  if (!room) return null;
  const [first] = room.peerContexts;
  if (!first) return null;
  openRoom(first.roomId, room.roomName);

  connectRooms(room.peerContexts);
  return room;
};
