import { REACTFLOW } from "../../../namespaces/broadcast/reactflow";
import { applyEdgeChanges, applyNodeChanges } from "../../../types/broadcast-data"
import { DataToUpdate as DiagramStore } from "../../../utils/BroadcastDataUtils";

export class ReactflowUtils {
  static updateNodes(updatedState: DiagramStore, data: REACTFLOW.NODE_CHANGE['value']) {
    updatedState.nodes = applyNodeChanges(data, updatedState.nodes)
  }

  static updateEdges(updatedState: DiagramStore, data: REACTFLOW.EDGE_CHANGE['value']) {
    updatedState.edges = applyEdgeChanges(data, updatedState.edges)
  }
}
