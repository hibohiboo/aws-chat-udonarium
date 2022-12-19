import { connectRoom } from '@/store/actions/connect';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { chatMessageModelSelector } from '@/store/selectors/chatMessageSelector';
import { connectedRoomSelector, roomsSelector } from '@/store/selectors/roomSelector';

const useUdonariumChat = () => {
  const dispatch = useAppDispatch();
  const rooms = useAppSelector(roomsSelector);
  const room = useAppSelector(connectedRoomSelector);
  const messages = useAppSelector(chatMessageModelSelector);
  console.warn(messages);
  const connectRoomHandler = (alias: string) => {
    dispatch(connectRoom(alias));
  };
  return { rooms, connectRoomHandler, room, messages };
};
export default useUdonariumChat;
