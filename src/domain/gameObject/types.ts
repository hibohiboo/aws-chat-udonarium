import { EventObject } from '../udonarium/event/types';

export type Identifer = string; // UUID
type GameObject<AliasName, T> = {
  aliasName: AliasName;
  identifier: Identifer;
  majorVersion: number;
  minorVersion: number;
  syncData: T;
};
export type UpdateGameObjectEvent<AliasName, T> = EventObject<
  'UPDATE_GAME_OBJECT',
  GameObject<AliasName, T>
>;
