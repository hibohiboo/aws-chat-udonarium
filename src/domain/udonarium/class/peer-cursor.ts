import { EVENT_NAME } from '../event/constants';
import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem, Network } from './core/system';

type UserId = string;
type PeerId = string;
type ObjectIdentifier = string;

@SyncObject('PeerCursor')
export class PeerCursor extends GameObject {
  declare userId: UserId;
  declare peerId: PeerId;
  declare name: string;
  declare imageIdentifier: string;
  constructor(identifier?: string) {
    super(identifier);
    SyncVar()(this, 'userId');
    this.userId = '';
    SyncVar()(this, 'peerId');
    this.peerId = '';
    SyncVar()(this, 'name');
    this.name = '';
    SyncVar()(this, 'imageIdentifier');
    this.imageIdentifier = '';
  }

  static myCursor: PeerCursor | null = null;
  private static userIdMap: Map<UserId, ObjectIdentifier> = new Map();
  private static peerIdMap: Map<PeerId, ObjectIdentifier> = new Map();

  get isMine(): boolean {
    if (!PeerCursor.myCursor) return false;
    return PeerCursor.myCursor && PeerCursor.myCursor === this;
  }
  get image(): ImageFile | null {
    return ImageStorage.instance.get(this.imageIdentifier);
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    if (!this.isMine) {
      EventSystem.register(this).on(EVENT_NAME.DISCONNECT_PEER, (event) => {
        if (event.data.peerId !== this.peerId) return;
        setTimeout(() => {
          if (Network.peerIds.includes(this.peerId)) return;
          PeerCursor.userIdMap.delete(this.userId);
          PeerCursor.peerIdMap.delete(this.peerId);
          ObjectStore.instance.remove(this);
        }, 30000);
      });
    }
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
    PeerCursor.userIdMap.delete(this.userId);
    PeerCursor.peerIdMap.delete(this.peerId);
  }

  static findByUserId(userId: UserId): PeerCursor | null {
    return this.find(PeerCursor.userIdMap, userId, true);
  }

  static findByPeerId(peerId: PeerId): PeerCursor | null {
    return this.find(PeerCursor.peerIdMap, peerId, false);
  }

  private static find(map: Map<string, string>, key: string, isUserId: boolean): PeerCursor | null {
    let identifier = map.get(key);
    if (identifier != null && ObjectStore.instance.get(identifier))
      return ObjectStore.instance.get<PeerCursor>(identifier);
    let cursors = ObjectStore.instance.getObjects<PeerCursor>(PeerCursor);
    for (let cursor of cursors) {
      let id = isUserId ? cursor.userId : cursor.peerId;
      if (id === key) {
        map.set(id, cursor.identifier);
        return cursor;
      }
    }
    return null;
  }

  static createMyCursor(): PeerCursor {
    if (PeerCursor.myCursor) {
      console.warn('It is already created.');
      return PeerCursor.myCursor;
    }
    PeerCursor.myCursor = new PeerCursor();
    PeerCursor.myCursor.peerId = Network.peerId;
    PeerCursor.myCursor.initialize();
    return PeerCursor.myCursor;
  }

  // override
  apply(context: ObjectContext) {
    let userId = context.syncData['userId'];
    let peerId = context.syncData['peerId'];
    if (userId !== this.userId) {
      PeerCursor.userIdMap.set(userId, this.identifier);
      PeerCursor.userIdMap.delete(this.userId);
    }
    if (peerId !== this.peerId) {
      PeerCursor.peerIdMap.set(peerId, this.identifier);
      PeerCursor.peerIdMap.delete(this.peerId);
    }
    super.apply(context);
  }

  isPeerAUdon(): boolean {
    return /u.*d.*o.*n/gi.exec(this.peerId) != null;
  }
}
