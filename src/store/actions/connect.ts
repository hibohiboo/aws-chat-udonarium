import { createAsyncThunk } from '@reduxjs/toolkit';
import { PeerUserContext } from '@/domain/peerUser/types';
import { PeerUser } from '@/domain/udonarium/class/peer-user';
import { createPeerUser, getUsers, initGameObject, initRooms } from '@/domain/udonarium/room';
import { setRooms } from '@/domain/udonarium/room/rooms';
import { RootState } from '..';
import { roomSlice } from '../slices/roomSlice';

const peerToContext = (u: PeerUser) => u.toContext() as PeerUserContext;
export const connect = createAsyncThunk<void, void, { state: RootState }>(
  'connect',
  async (req, thunkAPI) => {
    const updateGameObjectHandler = () => {
      const users = getUsers();
      const userContexts = users.map(peerToContext);
      console.log('userContexts', userContexts);
      // thunkAPI.dispatch(peerSlice.actions.setPeers(userContexts));
    };
    initGameObject();
    const user = createPeerUser(updateGameObjectHandler);
    const rooms = await initRooms();
    const userContext = peerToContext(user);
    thunkAPI.dispatch(
      roomSlice.actions.setRooms(
        rooms.map((room) => ({
          roomName: room.roomName,
          alias: room.alias,
          peerContexts: room.peerContexts.map((ctx) => ({
            peerId: ctx.peerId,
            roomId: ctx.roomId,
            digestUserId: ctx.digestUserId,
          })),
        }))
      )
    );
    setRooms(rooms);
    console.log('rooms', rooms);
    console.log('userContext', userContext);
  }
);
