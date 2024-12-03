import { EdgeChange, EdgeType, NodeChange, NodeType} from "../../types/broadcast-data";

export namespace REACTFLOW {
  export enum TYPE {
    NODE_CHANGE = "reactflow:node-changes",
    EDGE_CHANGE = "reactflow:edge-changes",
  }

  export type NODE_CHANGE = {
    type: TYPE.NODE_CHANGE;
    value: NodeChange<NodeType>[]
  }

  export type EDGE_CHANGE = {
    type: TYPE.EDGE_CHANGE
    value: EdgeChange<EdgeType>[]
  }

  export type DATA = NODE_CHANGE | EDGE_CHANGE
}