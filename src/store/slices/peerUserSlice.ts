import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PeerUser, PeerUserContext } from '@/domain/peerUser/types';
import { changeUserName } from '@/domain/udonarium/room/peerUser';

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
  extraReducers: (builder) => {
    builder.addCase(inputUserName.fulfilled, (state, action) => {
      state.self = state.self == null ? null : { ...state.self, name: action.payload };
    });
  },
});
export const inputUserName = createAsyncThunk<string, string>('inputUserName', async (req) => {
  changeUserName(req);
  return req;
});
