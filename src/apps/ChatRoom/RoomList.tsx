import { ArrowButton, Loader } from '@chatscope/chat-ui-kit-react';
import { Rooms } from '@/store/selectors/roomSelector';

const centerStyle = { maxWidth: '500px', margin: '0 auto' } as const;
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

const RoomList: React.FC<{
  rooms: Rooms;
  userName: string;
  connectRoom: (alias: string) => void;
  setUserName: (text: string) => void;
}> = ({ rooms, connectRoom, userName, setUserName }) => {
  if (!rooms) return <Loader />;
  if (rooms.length === 0) {
    return <EmptyRooms />;
  }

  return (
    <div>
      <Header />
      <InputArea name={userName} setUserName={setUserName} />
      <ul style={{ listStyle: 'none', ...centerStyle }}>
        <li style={{ textAlign: 'center', fontWeight: 'bold' }}>
          <span style={rowStyle.roomId}>ID</span>
          <span style={rowStyle.roomName}>部屋名</span>
          <span style={rowStyle.hasPassword}>🔒️</span>
          <span style={rowStyle.numberOfEntrants}>👥</span>
          <span style={rowStyle.connect}>ルーム</span>
        </li>
        {rooms.map((room) => (
          <li key={room.alias} style={{ textAlign: 'center', lineHeight: '2' }}>
            <span style={rowStyle.roomId}>{room.id}</span>
            <span style={rowStyle.roomName}>{room.name}</span>
            <span style={rowStyle.hasPassword}>{`${room.hasPassword ? '🔒️' : ''}`}</span>
            <span style={rowStyle.numberOfEntrants}>{room.numberOfEntrants}</span>
            <span style={rowStyle.connect}>
              <ArrowButton
                border
                direction="right"
                onClick={() => {
                  connectRoom(room.alias);
                }}
              >
                入室
              </ArrowButton>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
const EmptyRooms: React.FC = () => (
  <div style={{ ...centerStyle }}>
    <Header />
    <div style={{ margin: '0 auto' }}>
      入室可能な部屋はありません。
      <input type="button" onClick={() => window.location.reload()} value="再読み込み" />
    </div>
  </div>
);
const UdonLink: React.FC<{ url: string; label: string }> = (prop) => (
  <li>
    <a href={prop.url} target="_blank" rel="noreferrer">
      {prop.label}
    </a>
  </li>
);

const Header: React.FC = () => (
  <div style={{ ...centerStyle }}>
    <p>下記のユドナリウムとチャットできます。</p>
    <ul style={{ listStyle: 'none', display: 'flex', gap: '0 2rem' }}>
      {[
        {
          url: 'https://d3snr6xc5uvnuy.cloudfront.net/cartagraph-udonarium/udonarium/',
          label: 'ユドナリウム',
        },
        {
          url: 'https://d3snr6xc5uvnuy.cloudfront.net/cartagraph-udonarium-lily/udonarium_lily/',
          label: 'Lily',
        },
        {
          url: 'https://d3snr6xc5uvnuy.cloudfront.net/cartagraph-udonarium-with-fly/udonarium/',
          label: 'WithFly',
        },
        {
          url: 'https://d3snr6xc5uvnuy.cloudfront.net/rooper-udonarium/udonarium/',
          label: 'RoopeR',
        },
      ].map((props) => (
        <UdonLink {...props} key={props.url} />
      ))}
    </ul>
    <p>
      現在、メインタブのみチャットできます。<br></br>
      パスワード付きの部屋への入室は未実装です。<br></br>ダイスコマンドは未実装です
    </p>
  </div>
);

const InputArea: React.FC<{ name: string; setUserName: (text: string) => void }> = (props) => (
  <div style={{ ...centerStyle }}>
    <p>
      名前: <input value={props.name} onChange={(e) => props.setUserName(e.target.value)} />
    </p>
  </div>
);

export default RoomList;
