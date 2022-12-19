import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessageContext } from '@/domain/gameObject/chat/types';

// コンパイラが ts4023のエラーを const store = configureStore で出すので解決のためにexport
export interface ChatMessageState {
  list: ChatMessageContext[];
}

const initialState: ChatMessageState = {
  list: [],
};

export const chatMessageSlice = createSlice({
  name: 'chatMessage',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessageContext>) {
      state.list.push(action.payload);
    },
  },
});
