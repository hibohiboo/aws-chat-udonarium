import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { Network } from './core/system';

export interface ChatMessageContext {
  identifier?: string;
  tabIdentifier?: string;
  originFrom?: string;
  from?: string;
  to?: string;
  name?: string;
  text?: string;
  timestamp?: number;
  tag?: string;
  dicebot?: string;
  imageIdentifier?: string;
}

@SyncObject('chat')
export class ChatMessage extends ObjectNode implements ChatMessageContext {
  declare originFrom: string | undefined;
  declare from: string | undefined;
  declare to: string | undefined;
  declare name: string | undefined;
  declare tag: string | undefined;
  declare dicebot: string | undefined;
  declare imageIdentifier: string | undefined;
  constructor(identifier?: string) {
    super(identifier);
    SyncVar()(this, 'originFrom');
    this.originFrom = undefined;
    SyncVar()(this, 'from');
    this.from = undefined;
    SyncVar()(this, 'to');
    this.to = undefined;
    SyncVar()(this, 'name');
    this.name = undefined;
    SyncVar()(this, 'tag');
    this.tag = undefined;
    SyncVar()(this, 'dicebot');
    this.dicebot = undefined;
    SyncVar()(this, 'imageIdentifier');
    this.imageIdentifier = undefined;
  }

  get tabIdentifier(): string | undefined {
    return this.parent?.identifier;
  }
  get text(): string {
    return <string>this.value;
  }
  get timestamp(): number {
    const timestamp = this.getAttribute('timestamp');
    const num = timestamp ? +timestamp : 0;
    return Number.isNaN(num) ? 1 : num;
  }
  private _to?: string;
  private _sendTo: string[] = [];
  get sendTo(): string[] {
    if (this._to !== this.to) {
      this._to = this.to;
      this._sendTo =
        this.to != null && 0 < this.to.trim().length ? this.to.trim().split(/\s+/) : [];
    }
    return this._sendTo;
  }
  private _tag?: string;
  private _tags: string[] = [];
  get tags(): string[] {
    if (this._tag !== this.tag) {
      this._tag = this.tag;
      this._tags =
        this.tag != null && 0 < this.tag.trim().length ? this.tag.trim().split(/\s+/) : [];
    }
    return this._tags;
  }
  get image(): ImageFile | null {
    if (!this.imageIdentifier) return null;
    return ImageStorage.instance.get(this.imageIdentifier);
  }
  get index(): number {
    return this.minorIndex + this.timestamp;
  }
  get isDirect(): boolean {
    return 0 < this.sendTo.length ? true : false;
  }
  get isSendFromSelf(): boolean {
    return (
      this.from === Network.peerContext.userId || this.originFrom === Network.peerContext.userId
    );
  }
  get isRelatedToMe(): boolean {
    return -1 < this.sendTo.indexOf(Network.peerContext.userId) || this.isSendFromSelf
      ? true
      : false;
  }
  get isDisplayable(): boolean {
    return this.isDirect ? this.isRelatedToMe : true;
  }
  get isSystem(): boolean {
    return -1 < this.tags.indexOf('system') ? true : false;
  }
  get isDicebot(): boolean {
    return this.isSystem && this.from === 'System-BCDice' ? true : false;
  }
  get isSecret(): boolean {
    return -1 < this.tags.indexOf('secret') ? true : false;
  }
}
