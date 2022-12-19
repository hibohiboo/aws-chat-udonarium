export const EVENT_NAME = {
  OPEN_NETWORK: 'OPEN_NETWORK',
  CLOSE_NETWORK: 'CLOSE_NETWORK',
  CONNECT_PEER: 'CONNECT_PEER',
  DISCONNECT_PEER: 'DISCONNECT_PEER',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UPDATE_GAME_OBJECT: 'UPDATE_GAME_OBJECT',
  DELETE_GAME_OBJECT: 'DELETE_GAME_OBJECT',
  REQUEST_GAME_OBJECT: 'REQUEST_GAME_OBJECT',
  SYNCHRONIZE_GAME_OBJECT: 'SYNCHRONIZE_GAME_OBJECT',
  // 画像連携
  XML_LOADED: 'XML_LOADED',
  SYNCHRONIZE_FILE_LIST: 'SYNCHRONIZE_FILE_LIST',
  REQUEST_FILE_RESOURE: 'REQUEST_FILE_RESOURE',
  UPDATE_FILE_RESOURE: 'UPDATE_FILE_RESOURE',
  START_FILE_TRANSMISSION: 'START_FILE_TRANSMISSION',
  CANCEL_TASK_: 'CANCEL_TASK_',
  FILE_SEND_CHANK_: 'FILE_SEND_CHANK_',
  FILE_MORE_CHANK_: 'FILE_MORE_CHANK_',

  // ↑ ユドナリウム core
} as const;

export type EventName = typeof EVENT_NAME[keyof typeof EVENT_NAME];
