import React from 'react';
import useUdonariumChat from '../hooks/useUdonariumChat';
import ChatRoom from './ChatRoom/ChatRoom';
import RoomList from './ChatRoom/RoomList';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const App: React.FC = () => {
  const viewModel = useUdonariumChat();

  return (
    <div className="App">
      {viewModel.room == null ? (
        <RoomList
          rooms={viewModel.rooms}
          connectRoom={viewModel.connectRoomHandler}
          userName={viewModel.userName}
          setUserName={viewModel.setUserName}
        />
      ) : (
        <ChatRoom
          roomName={viewModel.room.roomName}
          models={viewModel.messages}
          onSend={viewModel.sendMessage}
        />
      )}
    </div>
  );
};

export default App;
