import { createAsyncThunk } from '@reduxjs/toolkit';
import { PeerRoom } from '@/domain/peerRoom/types';
import { PeerUserContext } from '@/domain/peerUser/types';
import { PeerCursor } from '@/domain/udonarium/class/peer-cursor';
import {
  connectRoomByRoomAlias,
  createPeerUser,
  initGameObject,
  initRooms,
} from '@/domain/udonarium/room';
import { getUsers } from '@/domain/udonarium/room/peerUser';
import { RootState } from '..';
import { peerUserSlice } from '../slices/peerUserSlice';
import { roomSlice } from '../slices/roomSlice';

const peerToContext = (u: PeerCursor) => u.toContext() as PeerUserContext;
const peerRoomToContext = (room: PeerRoom) => ({
  roomName: room.roomName,
  alias: room.alias,
  peerContexts: room.peerContexts.map((ctx) => ({
    peerId: ctx.peerId,
    roomId: ctx.roomId,
    digestUserId: ctx.digestUserId,
    digestPassword: ctx.digestPassword,
  })),
});
export const connect = createAsyncThunk<void, void, { state: RootState }>(
  'connect',
  async (req, thunkAPI) => {
    const updateGameObjectHandler = () => {
      const users = getUsers();
      const userContexts = users.map(peerToContext);
      console.log('userContexts', userContexts);
      thunkAPI.dispatch(peerUserSlice.actions.setUserContexts(userContexts));
    };
    initGameObject();
    const user = createPeerUser(updateGameObjectHandler);
    const rooms = await initRooms();
    const userContext = peerToContext(user);
    thunkAPI.dispatch(roomSlice.actions.setRooms(rooms.map(peerRoomToContext)));
    thunkAPI.dispatch(
      peerUserSlice.actions.setSelf({
        userId: userContext.syncData.userId,
        name: userContext.syncData.name,
      })
    );

    console.log('rooms', rooms);
    console.log('userContext', userContext);
  }
);
export const connectRoom = createAsyncThunk<void, string, { state: RootState }>(
  'connectRoom',
  async (req, thunkAPI) => {
    console.log('alias', req);
    const room = await connectRoomByRoomAlias(req);
    console.log('room', room);
    if (!room) {
      console.warn('ルームが見つかりません');
      return;
    }
    thunkAPI.dispatch(roomSlice.actions.setConnected(peerRoomToContext(room)));
  }
);
