import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageModel,
} from '@chatscope/chat-ui-kit-react';

const ChatRoom: React.FC<{ model: MessageModel; roomName: string }> = ({ model, roomName }) => (
  <div>
    <h2>{roomName}</h2>
    <div style={{ position: 'relative', height: '500px' }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            <Message model={model} />
          </MessageList>
          <MessageInput attachButton={false} placeholder="Enterで送信。Shift+Enterで改行" />
        </ChatContainer>
      </MainContainer>
    </div>
  </div>
);
export default ChatRoom;
