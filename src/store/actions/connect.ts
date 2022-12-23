import { createAsyncThunk } from '@reduxjs/toolkit';
import { chatEventToModel } from '@/domain/gameObject/chat/chatEventToContext';
import { ChatMessageEvent } from '@/domain/gameObject/chat/types';
import { AcceptGameObjectAlias } from '@/domain/gameObject/constants';
import { PeerRoom } from '@/domain/peerRoom/types';
import { PeerUserContext } from '@/domain/peerUser/types';
import { PeerCursor } from '@/domain/udonarium/class/peer-cursor';
import { connectRoomByRoomAlias } from '@/domain/udonarium/room';
import { initUdonarium } from '@/domain/udonarium/room/init';
import { getUsers } from '@/domain/udonarium/room/peerUser';
import { RootState } from '..';
import { chatMessageSlice } from '../slices/chatMessageSlice';
import { peerUserSlice } from '../slices/peerUserSlice';
import { roomSlice } from '../slices/roomSlice';

export const connect = createAsyncThunk<void, void, { state: RootState }>(
  'connect',
  async (req, thunkAPI) => {
    const updateGameObjectHandler = (alias: AcceptGameObjectAlias, event: unknown) => {
      console.log('alias', alias);
      if (alias === 'PeerCusor') {
        updatePeers(thunkAPI);
      } else if (alias === 'chat') {
        addChat(thunkAPI, event as ChatMessageEvent);
      }
    };
    const { user, rooms } = await initUdonarium(updateGameObjectHandler);
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
    updatePeers(thunkAPI);
  }
);
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
const updatePeers = (thunkAPI: { dispatch: any }) => {
  const users = getUsers();
  const userContexts = users.map(peerToContext);
  console.log('userContexts', userContexts);
  thunkAPI.dispatch(peerUserSlice.actions.setUserContexts(userContexts));
};
const addChat = (thunkAPI: { dispatch: any }, event: ChatMessageEvent) => {
  const message = chatEventToModel(event);
  if (!message) return;
  thunkAPI.dispatch(chatMessageSlice.actions.addMessage(message));
};
