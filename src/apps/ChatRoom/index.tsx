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
        <MessageInput attachButton={false} placeholder="Enterで送信。Shift+Enterで改行" />
      </ChatContainer>
    </MainContainer>
  </div>
);
export default ChatRoom;
