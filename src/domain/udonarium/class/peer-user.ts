import { EVENT_NAME } from '../event/constants';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem, Network } from './core/system';

type UserId = string;
type PeerId = string;
type ObjectIdentifier = string;

@SyncObject('PeerUser')
export class PeerUser extends GameObject {
  static myUser: PeerUser | null = null;

  private static userIdMap: Map<UserId, ObjectIdentifier> = new Map();

  private static peerIdMap: Map<PeerId, ObjectIdentifier> = new Map();

  declare userId: UserId;

  declare peerId: PeerId;

  declare name: string;

  get isMine(): boolean {
    return PeerUser.myUser != null && PeerUser.myUser === this;
  }

  constructor(identifier?: string) {
    super(identifier);
    SyncVar()(this, 'userId');
    SyncVar()(this, 'peerId');
    SyncVar()(this, 'name');
    this.userId = '';
    this.peerId = '';
    this.name = '';
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    if (!this.isMine) {
      EventSystem.register(this).on(EVENT_NAME.DISCONNECT_PEER, (event) => {
        if (event.data.peerId !== this.peerId) return;
        setTimeout(() => {
          if (Network.peerIds.includes(this.peerId)) return;
          PeerUser.userIdMap.delete(this.userId);
          PeerUser.peerIdMap.delete(this.peerId);
          ObjectStore.instance.remove(this);
        }, 30000);
      });
    }
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
    PeerUser.userIdMap.delete(this.userId);
    PeerUser.peerIdMap.delete(this.peerId);
  }

  static findByUserId(userId: UserId): PeerUser | null {
    return this.find(PeerUser.userIdMap, userId, true);
  }

  static findByPeerId(peerId: PeerId): PeerUser | null {
    return this.find(PeerUser.peerIdMap, peerId, false);
  }

  private static find(map: Map<string, string>, key: string, isUserId: boolean): PeerUser | null {
    const identifier = map.get(key);
    if (identifier != null && ObjectStore.instance.get(identifier))
      return ObjectStore.instance.get<PeerUser>(identifier);
    const cursors = ObjectStore.instance.getObjects<PeerUser>(PeerUser);
    for (const cursor of cursors) {
      const id = isUserId ? cursor.userId : cursor.peerId;
      if (id === key) {
        map.set(id, cursor.identifier);
        return cursor;
      }
    }
    return null;
  }

  static createMyUser(identifier?: string): PeerUser {
    if (PeerUser.myUser) {
      console.warn('It is already created.');
      return PeerUser.myUser;
    }
    PeerUser.myUser = new PeerUser(identifier);
    PeerUser.myUser.userId = '';
    PeerUser.myUser.peerId = Network.peerId;

    PeerUser.myUser.initialize();
    return PeerUser.myUser;
  }

  // override
  apply(context: any) {
    // ObjectContext
    const { userId } = context.syncData;
    const { peerId } = context.syncData;
    if (userId !== this.userId) {
      PeerUser.userIdMap.set(userId, this.identifier);
      PeerUser.userIdMap.delete(this.userId);
    }
    if (peerId !== this.peerId) {
      PeerUser.peerIdMap.set(peerId, this.identifier);
      PeerUser.peerIdMap.delete(this.peerId);
    }
    console.log('PeerUser apply', context);
    super.apply(context);
  }

  isPeerAUdon(): boolean {
    return /u.*d.*o.*n/gi.exec(this.peerId) != null;
  }
}
