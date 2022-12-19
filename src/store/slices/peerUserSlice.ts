import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PeerUser, PeerUserContext } from '@/domain/peerUser/types';

// コンパイラが ts4023のエラーを const store = configureStore で出すので解決のためにexport
export interface PeerUserState {
  self: PeerUser | null;
  userContexts: PeerUserContext[]; // selfも含んだ接続一覧
}

const initialState: PeerUserState = {
  self: null,
  userContexts: [],
};

export const peerUserSlice = createSlice({
  name: 'peerUser',
  initialState,
  reducers: {
    setSelf(state, action: PayloadAction<PeerUser>) {
      state.self = action.payload;
    },
    setUserContexts(state, action: PayloadAction<PeerUserContext[]>) {
      state.userContexts = action.payload;
    },
  },
});
