import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MAIN_TAB_IDENTIFIER } from '@/domain/gameObject/chat/constants';
import { ChatMessageContext } from '@/domain/gameObject/chat/types';

export const chatMessagesAdapter = createEntityAdapter<ChatMessageContext>({
  selectId: (chat) => chat.id,
  sortComparer: (a, b) => a.timestamp - b.timestamp,
});

export const chatMessageSlice = createSlice({
  name: 'chatMessage',
  initialState: chatMessagesAdapter.getInitialState({
    selectedTab: MAIN_TAB_IDENTIFIER,
  }),
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessageContext>) {
      chatMessagesAdapter.upsertOne(state, action.payload);
    },
  },
});
