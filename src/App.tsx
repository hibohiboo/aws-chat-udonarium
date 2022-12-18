import React from 'react';
import { Loader } from '@chatscope/chat-ui-kit-react';
import ChatRoom from './apps/ChatRoom';
import useUdonariumChat from './hooks/useUdonariumChat';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const App: React.FC = () => {
  const { rooms } = useUdonariumChat();

  if (!rooms) return <Loader />;

  return (
    <div className="App">
      <ul style={{ listStyle: 'none', width: '300px' }}>
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
};

export default App;
