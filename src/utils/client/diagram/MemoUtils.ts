import { DataToUpdate as DiagramStore } from "../../../utils/BroadcastDataUtils";
import { NODE_TYPES } from "../../../enums/node-type";
import { BROADCAST } from "../../../namespaces/broadcast";
import { NODE } from "../../../namespaces/broadcast/node";

type StateUpdate<T extends BROADCAST.DATA> = (updatedState: DiagramStore, changes: T) => Partial<DiagramStore>

export class MemoUtils {
  static updateContent: StateUpdate<NODE.MEMO.CONTENT_UPDATE> = (updatedState, {value}) => {
    updatedState.nodes = updatedState.nodes.map((node) => {
      if (node.type !== NODE_TYPES.MEMO) {
        return node;
      }

      if (node.id !== value.memoId) {
        return node;
      }

      return {
        ...node,
        data: {
          ...node.data,
          content: value.content,
        },
      };

    });

    return updatedState
  }
}
