import { createSelector } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { ChatMessageModel } from '@/domain/gameObject/chat/types';
import { RootState } from '..';
import { chatMessagesAdapter } from '../slices/chatMessageSlice';

const chatMessageSelector = (state: RootState) => state.chatMessage;
const adapterSelectors = chatMessagesAdapter.getSelectors();

export const chatMessagesSelector = createSelector(chatMessageSelector, adapterSelectors.selectAll);

const mainTabChatSelector = createSelector(chatMessagesSelector, (list) => {
  return list.filter((chat) => chat.tab === 'MainTab');
});

export const chatMessageModelSelector = createSelector(
  mainTabChatSelector,
  (list): ChatMessageModel[] => {
    const lastNumber = list.length - 1;
    const getPosition = getPositionFactory(lastNumber);
    return list.map((chat, index) => ({
      message: chat.message,
      sender: chat.sender,
      position: getPosition(index),
      type: 'text',
      sentTime: format(chat.timestamp, 'yyyy-MM-dd HH:mm:ss'),
    }));
  }
);
const getPositionFactory = (lastNumber: number) => {
  // メッセージが1つだけの場合
  if (lastNumber === 0) return (): 'single' => 'single';

  // メッセージが複数の場合
  return (index: number) => {
    if (index === 0) return 'first';
    if (index === lastNumber) return 'last';
    return 'normal';
  };
};
