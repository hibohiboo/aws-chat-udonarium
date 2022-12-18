import { useAppSelector } from '@/store/hooks';
import { roomsSelector } from '@/store/selectors/roomSelector';

const useUdonariumChat = () => {
  const rooms = useAppSelector(roomsSelector);
  return { rooms };
};
export default useUdonariumChat;
