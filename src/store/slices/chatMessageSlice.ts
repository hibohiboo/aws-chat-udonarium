import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessageContext } from '@/domain/gameObject/chat/types';

export const chatMessagesAdapter = createEntityAdapter<ChatMessageContext>({
  selectId: (chat) => chat.id,
  sortComparer: (a, b) => a.timestamp - b.timestamp,
});

export const chatMessageSlice = createSlice({
  name: 'chatMessage',
  initialState: chatMessagesAdapter.getInitialState(),
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessageContext>) {
      chatMessagesAdapter.upsertOne(state, action.payload);
    },
  },
});
