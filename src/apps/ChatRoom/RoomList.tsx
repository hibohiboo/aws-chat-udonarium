import { ArrowButton, Loader } from '@chatscope/chat-ui-kit-react';
import { Rooms } from '@/store/selectors/roomSelector';
const rowStyle = {
  roomId: { display: 'inline-block', width: '50px' },
  roomName: {
    display: 'inline-block',
    width: '150px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    verticalAlign: 'middle', // overflow: hiddenだとvertical-align:baseline が要素ボックスの垂直位置を参照してしまうためずれる
  },
  hasPassword: { display: 'inline-block', width: '30px' },
  numberOfEntrants: { display: 'inline-block', width: '30px' },
  connect: { display: 'inline-block', width: '120px', verticalAlign: 'baseline' },
} as const;
const RoomList: React.FC<{ rooms: Rooms }> = ({ rooms }) => {
  if (!rooms) return <Loader />;
  if (rooms.length === 0) {
    return <div style={{ margin: '0 auto' }}>入室可能な部屋はありません。</div>;
  }

  return (
    <ul style={{ listStyle: 'none', width: '500px', margin: '0 auto' }}>
      <li style={{ textAlign: 'center', fontWeight: 'bold' }}>
        <span style={rowStyle.roomId}>ID</span>
        <span style={rowStyle.roomName}>部屋名</span>
        <span style={rowStyle.hasPassword}>🔒️</span>
        <span style={rowStyle.numberOfEntrants}>👥</span>
        <span style={rowStyle.connect}>ルーム入室</span>
      </li>
      {rooms.map((room) => (
        <li key={room.alias} style={{ textAlign: 'center', lineHeight: '2' }}>
          <span style={rowStyle.roomId}>{room.id}</span>
          <span style={rowStyle.roomName}>{room.name}</span>
          <span style={rowStyle.hasPassword}>{`${room.hasPassword ? '🔒️' : ''}`}</span>
          <span style={rowStyle.numberOfEntrants}>{room.numberOfEntrants}</span>
          <span style={rowStyle.connect}>
            <ArrowButton border direction="right">
              接続
            </ArrowButton>
          </span>
        </li>
      ))}
    </ul>
  );
};
export default RoomList;
