import { BROADCAST } from "../namespaces/broadcast";
import {DataBroadcast, EdgeBase, EntityConfig, NodeType} from "../types/broadcast-data";
import {applyEdgeChanges, applyNodeChanges} from "../types/broadcast-data";

export type DataToUpdate = {
  nodes: NodeType[]
  edges: EdgeBase[]
  configs: EntityConfig[]
}

export class BroadcastDataUtils {
  static applyDataChanges(changes: DataBroadcast[], dataToUpdate: DataToUpdate) {
    changes.forEach((change) => {
      switch (change.type) {
        case BROADCAST.DATA.TYPE.NODE_DATA_UPDATE:
          dataToUpdate.nodes = dataToUpdate.nodes.map((node: NodeType) => {
            if (node.id !== change.value.id) {
              return node
            }

            node.data = change.value.data

            return node
          })
          break

        case BROADCAST.DATA.TYPE.REACTFLOW_NODE_CHANGE:
          dataToUpdate.nodes = applyNodeChanges<NodeType>(change.value, dataToUpdate.nodes)
          break

        case BROADCAST.DATA.TYPE.REACTFLOW_EDGE_CHANGE:
          dataToUpdate.edges = applyEdgeChanges(change.value, dataToUpdate.edges)
          break

        case BROADCAST.DATA.TYPE.ENTITY_CONFIG_CHANGE:
          const userConfig = dataToUpdate.configs.find(config => config.userId === change.value.userId)

          if (!userConfig) {
            dataToUpdate.configs.push(change.value)
          } else {
            dataToUpdate.configs = dataToUpdate.configs.map(config => {
              if (config.userId !== userConfig.userId) {
                return config
              }

              return change.value
            })
          }

      }
    })
    return dataToUpdate
  }
}
