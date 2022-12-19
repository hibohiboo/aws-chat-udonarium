type UserIdentifier = string; // UUID 例："7607ba4e-53ae-463e-b9f9-b0b915cfb0b0"
export type PeerId = string; // 例: "YzSjjbtgz4xMkigmuDAO9qY0tPI4Z3Jmbab8u2WJTCF"
export type UserId = string; // 例: "eH6OPG4F" ... connection の openに利用

export type PeerUserContext = {
  identifier: UserIdentifier;
  aliasName: string;
  majorVersion: number;
  minorVersion: number;
  syncData: {
    userId: UserId;
    peerId: PeerId;
    name: string;
  };
};
export type PeerUser = {
  userId: UserId;
  name: string;
};
