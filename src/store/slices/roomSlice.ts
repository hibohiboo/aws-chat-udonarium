import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Room } from '@/domain/peerRoom/types';

// コンパイラが ts4023のエラーを const store = configureStore で出すので解決のためにexport
export interface RoomsState {
  list: Room[] | null;
  connectedRoom: Room | null;
}

const initialState: RoomsState = {
  list: [],
  connectedRoom: null,
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRooms(state, action: PayloadAction<Room[]>) {
      state.list = action.payload;
    },
    setConnected(state, action: PayloadAction<Room>) {
      state.connectedRoom = action.payload;
    },
  },
});
