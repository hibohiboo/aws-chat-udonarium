import { EventSystem as _EventSystem } from './event/event-system';
// import { Network as _Network } from './network/network';

export { Event } from './event/event';
export { Listener } from './event/listener';

// TODO: SkyWay復活させないときにはコメントアウト
export const EventSystem = _EventSystem.instance;
export const Network = {} as any; // _Network.instance;
