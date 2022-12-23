import { EventObject } from '../udonarium/event/types';
import { Identifer } from '../udonarium/types';

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
