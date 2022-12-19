import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageModel,
} from '@chatscope/chat-ui-kit-react';

const ChatRoom: React.FC<{ models: MessageModel[]; roomName: string }> = ({ models, roomName }) => (
  <div>
    <h2>{roomName}</h2>
    <div style={{ position: 'relative', height: '500px' }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {models.map((model, index) => (
              <Message model={model} key={index}>
                <Message.Header sender={model.sender} />
              </Message>
            ))}
          </MessageList>
          <MessageInput attachButton={false} placeholder="Enterで送信。Shift+Enterで改行" />
        </ChatContainer>
      </MainContainer>
    </div>
  </div>
);
export default ChatRoom;
