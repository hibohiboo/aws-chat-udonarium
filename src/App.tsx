import ChatRoom from './apps/ChatRoom';
import useUdonariumChat from './hooks/useUdonariumChat';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
function App() {
  const { rooms } = useUdonariumChat();
  return (
    <div className="App">
      <ul>
        {rooms.map((room) => (
          <li key={room.alias}>
            <span>{room.name}</span>
            <span>{room.numberOfEntrants}</span>
          </li>
        ))}
      </ul>
      <ChatRoom
        model={{
          message: 'はろー',
          sender: 'hoge',
          direction: 'incoming',
          position: 'normal',
          type: 'text',
        }}
      />
    </div>
  );
}

export default App;
