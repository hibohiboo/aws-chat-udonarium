import { Loader } from '@chatscope/chat-ui-kit-react';
import { Rooms } from '@/store/selectors/roomSelector';
const rowStyle = {
  roomId: { display: 'inline-block', width: '50px' },
  roomName: {
    display: 'inline-block',
    width: '150px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    verticalAlign: 'top', // overflow: hiddenだとvertical-align:baseline が要素ボックスの垂直位置を参照してしまうためずれる
  },
  hasPassword: { display: 'inline-block', width: '30px' },
  numberOfEntrants: { display: 'inline-block', width: '30px' },
} as const;
const RoomList: React.FC<{ rooms: Rooms }> = ({ rooms }) => {
  if (!rooms) return <Loader />;
  return (
    <ul style={{ listStyle: 'none', width: '300px' }}>
      <li style={{ textAlign: 'center', fontWeight: 'bold' }}>
        <span style={rowStyle.roomId}>ID</span>
        <span style={rowStyle.roomName}>部屋名</span>
        <span style={rowStyle.hasPassword}>🔒️</span>
        <span style={rowStyle.numberOfEntrants}>👥</span>
      </li>
      {rooms.map((room) => (
        <li key={room.alias} style={{ textAlign: 'center' }}>
          <span style={rowStyle.roomId}>{room.id}</span>
          <span style={rowStyle.roomName}>{room.name}</span>
          <span style={rowStyle.hasPassword}>{`${room.hasPassword ? '🔒️' : ''}`}</span>
          <span style={rowStyle.numberOfEntrants}>{room.numberOfEntrants}</span>
        </li>
      ))}
    </ul>
  );
};
export default RoomList;
