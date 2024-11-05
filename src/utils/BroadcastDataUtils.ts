import {DataBroadcast, NodeBase} from "../types/broadcast-data";
import {DATA_BROADCAST_TYPE} from "../constants/reactflow";
import {applyEdgeChanges, applyNodeChanges} from "../types/broadcast-data";

export class BroadcastDataUtils {
  static applyDataChanges(changes: DataBroadcast[], dataToUpdate: any) {
    changes.forEach((change) => {
      switch (change.type) {
        case DATA_BROADCAST_TYPE.NODE_DATA_UPDATE:
          dataToUpdate.nodes = dataToUpdate.nodes.map((node: NodeBase) => {
            if (node.id !== change.value.id) {
              return node
            }

            node.data = change.value.data

            return node
          })
          break

        case DATA_BROADCAST_TYPE.REACTFLOW_NODE_CHANGE:
          dataToUpdate.nodes = applyNodeChanges(change.value, dataToUpdate.nodes)
          break

        case DATA_BROADCAST_TYPE.REACTFLOW_EDGE_CHANGE:
          dataToUpdate.edges = applyEdgeChanges(change.value, dataToUpdate.edges)
          break

      }
    })
    return dataToUpdate
  }
}
