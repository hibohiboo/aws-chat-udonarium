import React from 'react';
import ChatRoom from './apps/ChatRoom';
import RoomList from './apps/ChatRoom/RoomList';
import useUdonariumChat from './hooks/useUdonariumChat';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const App: React.FC = () => {
  const { rooms } = useUdonariumChat();

  return (
    <div className="App">
      <RoomList rooms={rooms} />
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
