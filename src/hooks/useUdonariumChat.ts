import { sendChatMessageAction } from '@/store/actions/chat';
import { connectRoom } from '@/store/actions/connect';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { chatMessageModelSelector } from '@/store/selectors/chatMessageSelector';
import { userIdSelector } from '@/store/selectors/peerUserSelector';
import { connectedRoomSelector, roomsSelector } from '@/store/selectors/roomSelector';

const useUdonariumChat = () => {
  const dispatch = useAppDispatch();
  const rooms = useAppSelector(roomsSelector);
  const room = useAppSelector(connectedRoomSelector);
  const messages = useAppSelector(chatMessageModelSelector);
  const selfUserId = useAppSelector(userIdSelector);
  console.warn(messages);
  const connectRoomHandler = (alias: string) => {
    dispatch(connectRoom(alias));
  };
  const sendMessage = (text: string) => {
    if (!selfUserId) return;
    dispatch(sendChatMessageAction({ text, from: selfUserId }));
  };
  return { rooms, connectRoomHandler, room, messages, sendMessage };
};
export default useUdonariumChat;
