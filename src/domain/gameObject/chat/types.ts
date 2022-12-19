import { UserId } from '@/domain/peerUser/types';
import { UpdateGameObjectEvent } from '../types';

export type ChatMessageEvent = UpdateGameObjectEvent<'chat', ChatSyncData>;

type TabIdentifer = string; // 例) MainTab
type Message = string;
type ChatSyncData = {
  attributes: {
    from: UserId | 'System-BCDice';
    name: string;
    originFrom?: UserId; // ダイスボットを振った時にダイスを振ったユーザが入る
    tag: string; // 例) sytem dicebot
    timestamp: number;
  };
  majorIndex: number;
  minorIndex: number;
  parentIdentifier: TabIdentifer;
  value: Message;
};
type FromUserName = string;
export type ChatMessageContext = {
  message: Message;
  sender: FromUserName;
  isSelf: boolean;
};
export type ChatMessageModel = {
  message: Message;
  sender: FromUserName;
  // direction: 'incoming' | 'outgoing'; ... チャットの名前が表示されなくなる
  position: 'normal' | 'first' | 'last' | 'single';
  type: 'text';
};
