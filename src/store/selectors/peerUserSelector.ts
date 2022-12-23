import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

const peerUserSelector = (state: RootState) => state.peerUser;

export const userIdSelector = createSelector(peerUserSelector, (state) => {
  return state.self?.userId;
});
