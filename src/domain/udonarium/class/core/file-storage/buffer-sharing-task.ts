import { EVENT_NAME } from '@/domain/udonarium/event/constants';
import { EventSystem } from '../system';
import { MessagePack } from '../system/util/message-pack';
import { ResettableTimeout } from '../system/util/resettable-timeout';
import { clearZeroTimeout, setZeroTimeout } from '../system/util/zero-timeout';

interface ChankData {
  index: number;
  length: number;
  chank: Uint8Array;
}

export class BufferSharingTask<T> {
  readonly identifier: string;
  readonly sendTo: string | undefined;

  private data: T | undefined;
  private uint8Array: Uint8Array | null = null;
  private chanks: Uint8Array[] = [];
  private chankSize: number = 32 * 1024;
  private chankReceiveCount: number = 0;
  private sendChankTimer: number | null = null;

  private sentChankIndex = 0;
  private bufferingChankRange: number = 4;
  private completedChankIndex = 0;

  private startTime = 0;
  private isCanceled = false;

  private onstart?: (() => void) | null;
  onprogress?: ((task: BufferSharingTask<T>, loded: number, total: number) => void) | null;
  onfinish?: ((task: BufferSharingTask<T>, data: T) => void) | null;
  ontimeout?: ((task: BufferSharingTask<T>) => void) | null;
  oncancel?: ((task: BufferSharingTask<T>) => void) | null;

  private timeoutTimer: ResettableTimeout | null = null;

  private constructor(identifier: string, sendTo?: string, data?: T) {
    this.identifier = identifier;
    this.sendTo = sendTo;
    this.data = data;
  }

  static createSendTask<T>(identifier: string, sendTo: string, data?: T): BufferSharingTask<T> {
    const task = new BufferSharingTask(identifier, sendTo, data);
    task.onstart = () => task.initializeSend();
    return task;
  }

  static createReceiveTask<T>(identifier: string): BufferSharingTask<T> {
    const task = new BufferSharingTask<T>(identifier);
    task.onstart = () => task.initializeReceive();
    return task;
  }

  start(data?: T) {
    if (!this.onstart) {
      console.warn('再起動する仕様など無い。');
      return;
    }
    this.data = data;
    this.onstart();
    this.onstart = null;
  }

  private progress(loded: number, total: number) {
    if (this.onprogress) this.onprogress(this, loded, total);
  }

  private finish() {
    if (this.isCanceled) return;
    this.isCanceled = true;
    if (this.onfinish && this.data) this.onfinish(this, this.data);
    this.dispose();
  }

  private timeout() {
    if (this.isCanceled) return;
    this.isCanceled = true;
    if (this.ontimeout) this.ontimeout(this);
    if (this.onfinish && this.data) this.onfinish(this, this.data);
    this.dispose();
  }

  cancel() {
    if (this.isCanceled) return;
    if (this.sendTo != null)
      EventSystem.call(EVENT_NAME.CANCEL_TASK_ + this.identifier, null, this.sendTo);
    this._cancel();
  }

  private _cancel() {
    if (this.isCanceled) return;
    this.isCanceled = true;
    if (this.oncancel) this.oncancel(this);
    if (this.onfinish && this.data) this.onfinish(this, this.data);
    this.dispose();
  }

  private dispose() {
    EventSystem.unregister(this);
    if (this.sendChankTimer) clearZeroTimeout(this.sendChankTimer);
    if (this.timeoutTimer) this.timeoutTimer.clear();
    this.sendChankTimer = null;
    this.timeoutTimer = null;
    this.onprogress = this.onfinish = this.ontimeout = this.oncancel = null;
  }

  private initializeSend() {
    this.uint8Array = MessagePack.encode(this.data);
    if (this.uint8Array == null) return;
    const total = Math.ceil(this.uint8Array.byteLength / this.chankSize);
    this.chanks = new Array(total);

    console.log('チャンク分割 ' + this.identifier, this.chanks.length);

    EventSystem.register(this)
      .on<number>(EVENT_NAME.FILE_MORE_CHANK_ + this.identifier, (event) => {
        if (this.sendTo !== event.sendFrom) return;
        this.completedChankIndex = event.data;
        if (this.sendChankTimer == null && this.sentChankIndex + 1 < this.chanks.length) {
          this.sendChank(this.sentChankIndex + 1);
        }
        this.resetTimeout();
      })
      .on(EVENT_NAME.DISCONNECT_PEER, (event) => {
        if (event.data.peerId !== this.sendTo) return;
        console.warn('送信キャンセル（Peer切断）', this, event.data.peerId);
        this._cancel();
      })
      .on(EVENT_NAME.CANCEL_TASK_ + this.identifier, (event) => {
        console.warn('送信キャンセル', this, event.sendFrom);
        this._cancel();
      });
    this.sentChankIndex = this.completedChankIndex = 0;
    this.startTime = performance.now();
    setZeroTimeout(() => this.sendChank(0));
  }

  private sendChank(index: number) {
    if (this.uint8Array == null) return;
    const chank = this.uint8Array.slice(index * this.chankSize, (index + 1) * this.chankSize);
    const data = { index: index, length: this.chanks.length, chank: chank };
    EventSystem.call(EVENT_NAME.FILE_SEND_CHANK_ + this.identifier, data, this.sendTo);
    this.sentChankIndex = index;
    this.sendChankTimer = null;
    if (this.chanks.length <= index + 1) {
      console.log('バッファ送信完了', this.identifier);
      this.outputTransferRate(this.uint8Array.byteLength);
      setZeroTimeout(() => this.finish());
    } else if (this.completedChankIndex + this.bufferingChankRange <= index) {
      this.resetTimeout();
    } else {
      this.sendChankTimer = setZeroTimeout(() => {
        this.sendChank(this.sentChankIndex + 1);
      });
    }
  }

  private initializeReceive() {
    this.resetTimeout();
    this.startTime = performance.now();
    this.chankReceiveCount = 0;
    EventSystem.register(this)
      .on<ChankData>(EVENT_NAME.FILE_SEND_CHANK_ + this.identifier, (event) => {
        if (this.chanks.length < 1) this.chanks = new Array(event.data.length);

        if (this.chanks[event.data.index] != null) {
          console.log(`already received. [${event.data.index}] <${this.identifier}>`);
          return;
        }
        this.chankReceiveCount++;
        this.chanks[event.data.index] = event.data.chank;
        this.progress(event.data.index, event.data.length);
        if (this.chanks.length <= this.chankReceiveCount) {
          this.finishReceive();
        } else {
          this.resetTimeout();
          EventSystem.call(
            EVENT_NAME.FILE_MORE_CHANK_ + this.identifier,
            event.data.index,
            event.sendFrom
          );
        }
      })
      .on(EVENT_NAME.DISCONNECT_PEER, (event) => {
        if (event.data.peerId !== this.sendTo) return;
        console.warn('受信キャンセル（Peer切断）', this, event.data.peerId);
        this._cancel();
      })
      .on(EVENT_NAME.CANCEL_TASK_ + this.identifier, (event) => {
        console.warn('受信キャンセル', this, event.sendFrom);
        this._cancel();
      });
  }

  private finishReceive() {
    console.log('バッファ受信完了', this.identifier);

    let sumLength = 0;
    for (const chank of this.chanks) {
      sumLength += chank.byteLength;
    }

    this.outputTransferRate(sumLength);
    const uint8Array = new Uint8Array(sumLength);
    let pos = 0;

    for (const chank of this.chanks) {
      uint8Array.set(chank, pos);
      pos += chank.byteLength;
    }

    this.data = MessagePack.decode(uint8Array) as T;
    this.finish();
  }

  private resetTimeout() {
    if (this.timeoutTimer == null)
      this.timeoutTimer = new ResettableTimeout(() => this.timeout(), 10 * 1000);
    this.timeoutTimer.reset();
  }

  private outputTransferRate(byteLength: number) {
    const time = performance.now() - this.startTime;
    const rate = byteLength / 1024 / 1024 / (time / 1000);
    console.log(
      `${(byteLength / 1024).toFixed(2)}KB ${(time / 1000).toFixed(2)}秒 転送速度: ${rate.toFixed(
        2
      )}MB/s`
    );
  }
}
