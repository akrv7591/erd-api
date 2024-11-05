
export enum NODE_TYPES {
  ENTITY = "entity",
  MEMO = "memo"
}

export enum DATA_BROADCAST_TYPE {
  NODE_DATA_UPDATE = "node:data-update",
  REACTFLOW_NODE_CHANGE = "reactflow:node-changes",
  REACTFLOW_EDGE_CHANGE = "reactflow:edge-changes",
  CLIENT_CURSOR_CHANGE = "client:cursor-change",
}
