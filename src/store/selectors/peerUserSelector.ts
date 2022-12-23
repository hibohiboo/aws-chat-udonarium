import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

const peerUserSelector = (state: RootState) => state.peerUser;

export const selfIdSelector = createSelector(peerUserSelector, (state) => {
  return state.self?.id;
});

export const selfNameSelector = createSelector(peerUserSelector, (state) => {
  if (!state.self) return '';
  return state.self.name;
});
