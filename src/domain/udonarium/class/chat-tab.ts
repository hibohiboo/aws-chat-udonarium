import { EVENT_NAME } from '../event/constants';
import { ChatMessage, ChatMessageContext } from './chat-message';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { InnerXml, ObjectSerializer } from './core/synchronize-object/object-serializer';
import { EventSystem } from './core/system';

@SyncObject('chat-tab')
export class ChatTab extends ObjectNode implements InnerXml {
  declare name: string;
  constructor(identifier?: string) {
    super(identifier);
    SyncVar()(this, 'name');
    this.name = 'タブ';
  }
  get chatMessages(): ChatMessage[] {
    return <ChatMessage[]>this.children;
  }

  private _unreadLength: number = 0;
  get unreadLength(): number {
    return this._unreadLength;
  }
  get hasUnread(): boolean {
    return 0 < this.unreadLength;
  }

  get latestTimeStamp(): number {
    const lastIndex = this.chatMessages.length - 1;
    return lastIndex < 0 ? 0 : this.chatMessages[lastIndex].timestamp;
  }

  // ObjectNode Lifecycle
  onChildAdded(child: ObjectNode) {
    super.onChildAdded(child);
    if (child.parent === this && child instanceof ChatMessage && child.isDisplayable) {
      this._unreadLength++;
      EventSystem.trigger('MESSAGE_ADDED', {
        tabIdentifier: this.identifier,
        messageIdentifier: child.identifier,
      });
    }
  }

  addMessage(message: ChatMessageContext): ChatMessage {
    message.tabIdentifier = this.identifier;

    const chat = new ChatMessage();
    for (const key in message) {
      if (key === 'identifier') continue;
      if (key === 'tabIdentifier') continue;
      if (key === 'text') {
        chat.value = message[key];
        continue;
      }
      const msg = message[key as keyof typeof message];
      if (msg == null || msg === '') continue;
      chat.setAttribute(key, msg);
    }
    chat.initialize();
    EventSystem.trigger(EVENT_NAME.SEND_MESSAGE, {
      tabIdentifier: this.identifier,
      messageIdentifier: chat.identifier,
    });
    this.appendChild(chat);
    return chat;
  }

  markForRead() {
    this._unreadLength = 0;
  }

  innerXml(): string {
    let xml = '';
    for (const child of this.children) {
      if (child instanceof ChatMessage && !child.isDisplayable) continue;
      xml += ObjectSerializer.instance.toXml(child);
    }
    return xml;
  }

  parseInnerXml(element: Element) {
    return super.parseInnerXml(element);
  }
}
