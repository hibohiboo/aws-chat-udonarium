import { AcceptGameObjectAlias, acceptGameObjectAliases } from './constants';

export const checkAcceptObject = (aliasName: string): aliasName is AcceptGameObjectAlias => {
  return (acceptGameObjectAliases as any as string[]).includes(aliasName);
};
