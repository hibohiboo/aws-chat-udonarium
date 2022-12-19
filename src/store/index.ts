import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { peerUserSlice } from './slices/peerUserSlice';
import { roomSlice } from './slices/roomSlice';

export const store = configureStore({
  reducer: {
    room: roomSlice.reducer,
    peerUser: peerUserSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
