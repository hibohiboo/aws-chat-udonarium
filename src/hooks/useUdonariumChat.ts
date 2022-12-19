import { connectRoom } from '@/store/actions/connect';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { connectedRoomSelector, roomsSelector } from '@/store/selectors/roomSelector';

const useUdonariumChat = () => {
  const dispatch = useAppDispatch();
  const rooms = useAppSelector(roomsSelector);
  const room = useAppSelector(connectedRoomSelector);
  const connectRoomHandler = (alias: string) => {
    dispatch(connectRoom(alias));
  };
  return { rooms, connectRoomHandler, room };
};
export default useUdonariumChat;
