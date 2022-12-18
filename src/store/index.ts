import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { roomSlice } from './slices/room';

export const store = configureStore({
  reducer: {
    room: roomSlice.reducer,
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
