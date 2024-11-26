import { DataToUpdate as DiagramStore } from "../../../utils/BroadcastDataUtils";
import { NODE_TYPES } from "../../../enums/node-type";
import { BROADCAST } from "../../../namespaces/broadcast";
import { EntityData } from "../../../types/broadcast-data";
import { NODE } from "../../../namespaces/broadcast/node";

type StateUpdate<T extends BROADCAST.DATA> = (updatedState: DiagramStore, changes: T) => Partial<DiagramStore>

export class EntityUtils {
  // New util functions for entity
  static updateData(
    updatedState: Partial<DiagramStore>,
    state: DiagramStore,
    entityId: string,
    data: Partial<EntityData> | ((data: EntityData) => Partial<EntityData>),
  ) {
    if (!updatedState.nodes) {
      updatedState.nodes = state.nodes;
    }

    updatedState.nodes = updatedState.nodes.map((node) => {
      if (node.type !== NODE_TYPES.ENTITY) {
        return node;
      }
      if (node.id !== entityId) {
        return node;
      }

      return {
        ...node,
        data: {
          ...node.data,
          ...(typeof data === "function" ? data(node.data) : data),
        },
      };
    });
  }

  static updateConfig: StateUpdate<NODE.ENTITY.CONFIG_UPDATE> = (updatedState, data) => {

    if (updatedState.configs.find((c) => c.userId === data.value.userId)) {
      updatedState.configs = updatedState.configs.map((c) => {
        if (c.userId !== data.value.userId) {
          return c;
        }
        return data.value;
      });
    }

    updatedState.configs = [...updatedState.configs, data.value];

    return updatedState
  }

  static updateName: StateUpdate<NODE.ENTITY.NAME_UPDATE> = (updatedState, {value}) => {
    updatedState.nodes = updatedState.nodes.map((node) => {
      if (node.type !== NODE_TYPES.ENTITY) {
        return node;
      }

      if (node.id !== value.id) {
        return node;
      }

      return {
        ...node,
        data: {
          ...node.data,
          name: value.name,
        },
      };

    });

    return updatedState
  }

  static updateColor: StateUpdate<NODE.ENTITY.COLOR_UPDATE> = (updatedState, {value}) =>{

    updatedState.nodes = updatedState.nodes.map((node) => {
      if (node.type !== NODE_TYPES.ENTITY) {
        return node;
      }

      if (node.id !== value.id) {
        return node;
      }

      return {
        ...node,
        data: {
          ...node.data,
          color: value.color,
        },
      };
    });

    return updatedState
  }

  static addColumn: StateUpdate<NODE.ENTITY.COLUMN_ADD> = (updatedState, {value: columns}) => {
    updatedState.nodes = updatedState.nodes.map((node) => {
      if (node.type !== NODE_TYPES.ENTITY) {
        return node;
      }

      const entityColumns = columns.filter(column => column.entityId === node.id)

      if (!entityColumns.length) {
        return node
      }

      return {
        ...node,
        data: {
          ...node.data,
          columns: [...node.data.columns, ...entityColumns],
        },
      };
    });

    return updatedState
  }

  static updateColumn: StateUpdate<NODE.ENTITY.COLUMN_UPDATE> = (updatedState, {value}) => {
    updatedState.nodes = updatedState.nodes.map((node) => {
      if (node.type !== NODE_TYPES.ENTITY) {
        return node;
      }
      if (node.id !== value.entityId) {
        return node
      }

      return {
        ...node,
        data: {
          ...node.data,
          columns: node.data.columns.map((column) => {
            const change = value.changes.find(change => change.id === column.id)

            if (!change) {
              return column
            }

            return {
              ...column,
              [change.key]: change.value,
            };
          }),
        },
      };
    });

    return updatedState
  }

  static deleteColumn: StateUpdate<NODE.ENTITY.COLUMN_DELETE> = (updatedState, {value}) => {
    updatedState.nodes = updatedState.nodes.map((node) => {
      if (node.type !== NODE_TYPES.ENTITY) {
        return node;
      }

      if (node.id !== value.entityId) {
        return node
      }

      return {
        ...node,
        data: {
          ...node.data,
          columns: node.data.columns.filter(column => !value.ids.includes(column.id))
        },
      };
    });

    return updatedState
  }

  static updateColumnOrder: StateUpdate<NODE.ENTITY.COLUMN_ORDER_UPDATE> = (updatedState, { value }) => {
    updatedState.nodes = updatedState.nodes.map(node => {
      if (node.type !== NODE_TYPES.ENTITY) {
        return node
      }

      if (node.id !== value.entityId) {
        return node
      }

      const tempObj = Object.fromEntries(node.data.columns.map(column => ([column.id, column])))


      return {
        ...node,
        data: {
          ...node.data,
          columns: value.ids.map(id => tempObj[id])
        }
      }
    }) as any

    return updatedState
  }
}
