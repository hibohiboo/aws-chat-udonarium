import React from 'react';
import ChatRoom from './apps/ChatRoom';
import RoomList from './apps/ChatRoom/RoomList';
import useUdonariumChat from './hooks/useUdonariumChat';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const App: React.FC = () => {
  const viewModel = useUdonariumChat();

  return (
    <div className="App">
      {viewModel.room == null ? (
        <RoomList rooms={viewModel.rooms} connectRoom={viewModel.connectRoomHandler} />
      ) : (
        <ChatRoom roomName={viewModel.room.roomName} models={viewModel.messages} />
      )}
    </div>
  );
};

export default App;
