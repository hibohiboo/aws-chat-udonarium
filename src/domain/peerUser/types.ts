type UserIdentifier = string;
export type PeerUserContext = {
  identifier: UserIdentifier;
  aliasName: string;
  majorVersion: number;
  minorVersion: number;
  syncData: {
    userId: string;
    peerId: string;
    name: string;
  };
};
