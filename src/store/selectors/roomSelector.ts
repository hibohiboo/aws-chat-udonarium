import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

const roomSelector = (state: RootState) => state.room;

export const roomsSelector = createSelector(roomSelector, (state) => {
  if (!state.list) return null;
  return state.list.map((room) => ({
    name: room.roomName,
    alias: room.alias,
    numberOfEntrants: room.peerContexts.length,
  }));
});
