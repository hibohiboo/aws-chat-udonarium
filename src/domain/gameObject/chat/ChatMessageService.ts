import { ChatMessage, ChatMessageContext } from '@/domain/udonarium/class/chat-message';
import { ChatTab } from '@/domain/udonarium/class/chat-tab';
import { ChatTabList } from '@/domain/udonarium/class/chat-tab-list';
import { ObjectStore } from '@/domain/udonarium/class/core/synchronize-object/object-store';
import { Network } from '@/domain/udonarium/class/core/system';
import { PeerCursor } from '@/domain/udonarium/class/peer-cursor';

const HOURS = 60 * 60 * 1000;
let service: ChatMessageService | null = null;
export const getChatMessageService = (): ChatMessageService => {
  if (!service) {
    service = new ChatMessageService();
  }
  return service;
};

class ChatMessageService {
  private intervalTimer: NodeJS.Timer | null = null;
  private timeOffset: number = Date.now();
  private performanceOffset: number = performance.now();
  private ntpApiUrls: string[] = ['https://worldtimeapi.org/api/ip'];

  gameType: string = '';

  get chatTabs(): ChatTab[] {
    return ChatTabList.instance.chatTabs;
  }

  sendMessage(
    chatTab: ChatTab,
    text: string,
    gameType: string,
    sendFrom: string,
    sendTo?: string
  ): ChatMessage {
    const chatMessage: ChatMessageContext = {
      from: Network.peerContext.userId,
      to: findId(sendTo),
      name: makeMessageName(sendFrom, sendTo),
      imageIdentifier: findImageIdentifier(sendFrom),
      timestamp: this.calcTimeStamp(chatTab),
      tag: gameType,
      text: text,
    };

    return chatTab.addMessage(chatMessage);
  }
  getTime(): number {
    return Math.floor(this.timeOffset + (performance.now() - this.performanceOffset));
  }
  calibrateTimeOffset() {
    if (this.intervalTimer != null) {
      console.log('calibrateTimeOffset was canceled.');
      return;
    }
    const index = Math.floor(Math.random() * this.ntpApiUrls.length);
    const ntpApiUrl = this.ntpApiUrls[index];
    const sendTime = performance.now();
    fetch(ntpApiUrl)
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok.');
      })
      .then((jsonObj) => {
        const endTime = performance.now();
        const latency = (endTime - sendTime) / 2;
        const timeobj = jsonObj;
        const st: number = new Date(timeobj.utc_datetime).getTime();
        const fixedTime = st + latency;
        this.timeOffset = fixedTime;
        this.performanceOffset = endTime;
        console.debug('latency: ' + latency + 'ms');
        console.debug('st: ' + st + '');
        console.debug('timeOffset: ' + this.timeOffset);
        console.debug('performanceOffset: ' + this.performanceOffset);
        this.setIntervalTimer();
      })
      .catch((error) => {
        console.warn('There has been a problem with your fetch operation: ', error.message);
        this.setIntervalTimer();
      });
    this.setIntervalTimer();
  }

  private setIntervalTimer() {
    if (this.intervalTimer != null) clearTimeout(this.intervalTimer);
    this.intervalTimer = setTimeout(() => {
      this.intervalTimer = null;
      this.calibrateTimeOffset();
    }, 6 * HOURS);
  }

  private calcTimeStamp(chatTab: ChatTab): number {
    const now = this.getTime();
    const latest = chatTab.latestTimeStamp;
    return now <= latest ? latest + 1 : now;
  }
}

const findId = (identifier: string | undefined): string | undefined => {
  if (!identifier) return undefined;
  const object = ObjectStore.instance.get(identifier);
  // TODO: GameCharacterへのメッセージ
  // if (object instanceof GameCharacter) {
  //   return object.identifier;
  // } else

  if (object instanceof PeerCursor) {
    return object.userId;
  }
  return undefined;
};

const makeMessageName = (sendFrom: string, sendTo?: string): string => {
  const sendFromName = findObjectName(sendFrom);
  if (sendTo == null || sendTo.length < 1) return sendFromName;

  const sendToName = findObjectName(sendTo);
  return `${sendFromName} > ${sendToName}`;
};

const findObjectName = (identifier: string): string => {
  const object = ObjectStore.instance.get(identifier);
  // TODO: GameCharacterの名前
  // if (object instanceof GameCharacter) {
  //   return object.name;
  // } else
  if (object instanceof PeerCursor) {
    return object.name;
  }
  return identifier;
};

const findImageIdentifier = (identifier: string): string => {
  const object = ObjectStore.instance.get(identifier);
  // TODO: GameCharacter
  // if (object instanceof GameCharacter) {
  //   return object.imageFile ? object.imageFile.identifier : '';
  // } else
  if (object instanceof PeerCursor) {
    return object.imageIdentifier;
  }
  return identifier;
};
