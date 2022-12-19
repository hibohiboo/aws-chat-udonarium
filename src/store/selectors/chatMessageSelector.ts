import { createSelector } from '@reduxjs/toolkit';
import { ChatMessageModel } from '@/domain/gameObject/chat/types';
import { RootState } from '..';

const chatMessageSelector = (state: RootState) => state.chatMessage;

export const chatMessagesSelector = createSelector(
  chatMessageSelector,
  (state): ChatMessageModel[] => {
    const lastNumber = state.list.length - 1;

    // メッセージが1つだけの場合
    if (lastNumber === 0) {
      return state.list.map((chat) => ({
        message: chat.message,
        sender: chat.sender,
        position: 'single',
        type: 'text',
      }));
    }
    return state.list.map((chat, index) => ({
      message: chat.message,
      sender: chat.sender,
      position: index === 0 ? 'first' : index === lastNumber ? 'last' : 'normal',
      type: 'text',
    }));
  }
);
