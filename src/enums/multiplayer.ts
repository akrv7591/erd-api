
export enum Key {
  playground = "playground",
  subscribe = "subscribe",
  table = "table",
}


export enum Player {
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
  delete = "erd:delete",
}

export enum EntityEnum {
  add = "entity:add",
  update = "entity:update",
  delete = "entity:delete",
  set = "entity:set",
}

export enum Relation {
  add = "relation:add",
  delete = "relation:delete",
}

export enum Column {
  add = "column:add",
  update = "column:update",
  delete = "column:delete",
}

export enum CallbackDataStatus {
  OK="ok",
  FAILED="failed",
}
