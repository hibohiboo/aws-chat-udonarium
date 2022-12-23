import { UserId } from '@/domain/peerUser/types';
import { getChatMessageService } from './ChatMessageService';
import { DEFAULT_GAME_TYPE } from './constants';

export const sendChatMessage = (tabId: string, text: string, from: UserId) => {
  const service = getChatMessageService();
  const chatTab = service.chatTabs.find((tab) => tab.identifier === tabId);
  if (!chatTab) {
    console.log('SelectedTab is Deleted');
    return;
  }
  service.sendMessage(chatTab, text, DEFAULT_GAME_TYPE, from);
};
