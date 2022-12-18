import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageModel,
} from '@chatscope/chat-ui-kit-react';

const ChatRoom: React.FC<{ model: MessageModel }> = ({ model }) => (
  <div style={{ position: 'relative', height: '500px' }}>
    <MainContainer>
      <ChatContainer>
        <MessageList>
          <Message model={model} />
        </MessageList>
        <MessageInput placeholder="Type message here" />
      </ChatContainer>
    </MainContainer>
  </div>
);
export default ChatRoom;
