
export enum Key {
  playgrounds = "playgrounds",
  cleanUpQueue = "cleanUpQueue",
  finish = "finish",
  players = "players",
  subscribers = "subscribers",
  entities = "entities",
  nodes = "nodes",
  position = "position",
}


export enum PlayerEnum {
  join = "player:join",
  leave = "player:leave",
  connection = 'connection',
  disconnect = "disconnect",
  subscribe = "player:subscribe",
  unsubscribe = "player:unsubscribe",
  viewpointChange = "player:viewpointChange",
  mouseChange = "player:mouseChange",
}

export enum ErdEnum {
  patch = "erd:patch",
  put = "erd:put",
}

export enum NodeEnum {
  add = "node:add",
  patchPositions = "node:patchPositions",
  delete = "node:delete",
}

export enum EntityEnum {
  add = "entity:add",
  patch = "entity:patch",
  delete = "entity:delete",
}

export enum RelationEnum {
  add = "relation:add",
  delete = "relation:delete",
}

export enum ColumnEnum {
  add = "column:add",
  patch = "column:patch",
  delete = "column:delete",
}

export enum MemoEnum {
  add = "memo:add",
  put = "memo:put",
  patch = "memo:patch",
  delete = "memo:delete",
}

export enum CallbackDataStatus {
  OK="ok",
  FAILED="failed",
}
