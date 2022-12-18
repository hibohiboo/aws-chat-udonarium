import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

const roomSelector = (state: RootState) => state.room;

export const roomsSelector = createSelector(roomSelector, (state) => {
  if (!state.list) return null;
  const [firstRoom] = state.list;
  if (!firstRoom) return [];

  return state.list.flatMap((room) => {
    const [firstUser] = room.peerContexts;
    if (!firstUser) return []; // 空配列を返すとflatMapでfilterと同様の挙動になる

    return [
      {
        id: firstUser.roomId,
        hasPassword: !!firstUser.digestPassword,
        name: room.roomName,
        numberOfEntrants: room.peerContexts.length,
        alias: room.alias, // `${roomId}${roomName}`
      },
    ];
  });
});
