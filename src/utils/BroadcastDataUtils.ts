import { BROADCAST } from "../namespaces/broadcast";
import { EdgeBase, EntityConfig, NodeType} from "../types/broadcast-data";
import { REACTFLOW } from "../namespaces/broadcast/reactflow";
import { NODE } from "../namespaces/broadcast/node";
import { EntityUtils } from "./client/diagram/EntityUtils";
import { ReactflowUtils } from "./client/diagram/ReactflowUtils";
import { MemoUtils } from "./client/diagram/MemoUtils";


export type DataToUpdate = {
  nodes: NodeType[]
  edges: EdgeBase[]
  configs: EntityConfig[]
}

export class BroadcastDataUtils {
  static applyDataChanges(changes: BROADCAST.DATA[], updatedState: DataToUpdate) {
    changes.forEach((change) => {
      const { type, value } = change;
      switch (type) {
        // Reactflow
        case REACTFLOW.TYPE.NODE_CHANGE:
          ReactflowUtils.updateNodes(updatedState, value);
          break;
        case REACTFLOW.TYPE.EDGE_CHANGE:
          ReactflowUtils.updateEdges(updatedState, value);
          break;

        // Entity
        case NODE.ENTITY.TYPE.CONFIG_UPDATE:
          EntityUtils.updateConfig(updatedState, change);
          break;
        case NODE.ENTITY.TYPE.NAME_UPDATE:
          EntityUtils.updateName(updatedState, change);
          break;
        case NODE.ENTITY.TYPE.COLOR_UPDATE:
          EntityUtils.updateColor(updatedState, change);
          break;
        case NODE.ENTITY.TYPE.COLUMN_ADD:
          EntityUtils.addColumn(updatedState, change);
          break;
        case NODE.ENTITY.TYPE.COLUMN_UPDATE:
          EntityUtils.updateColumn(updatedState, change);
          break;
        case NODE.ENTITY.TYPE.COLUMN_DELETE:
          EntityUtils.deleteColumn(updatedState, change);
          break;
        case NODE.ENTITY.TYPE.COLUMN_ORDER_UPDATE:
          EntityUtils.updateColumnOrder(updatedState, change);
          break;
        case NODE.MEMO.TYPE.CONTENT_UPDATE:
          MemoUtils.updateContent(updatedState, change);
      }
    })

    return updatedState
  }
}
