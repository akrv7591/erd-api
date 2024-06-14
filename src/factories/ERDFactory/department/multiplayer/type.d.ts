import {
  CallbackDataStatus,
  ColumnEnum, EntityEnum, ErdEnum, MemoEnum, NodeEnum,
  PlayerEnum, RelationEnum, WorkerEnum,
} from "../../../../enums/multiplayer";
import type {Socket} from "socket.io";
import type {ICColumnModel, IColumnModel} from "../../../../sequelize-models/erd-api/Column.model";
import type {MemoNode} from "../../../../sequelize-models/erd-api/Memo.mode";
import {EntityNode} from "../../../../sequelize-models/erd-api/Entity.model";
import {MultiplayerWorker} from "./MultiplayerWorker";
import {IErdModel} from "../../../../sequelize-models/erd-api/Erd.model";
import {ICRelationModel} from "../../../../sequelize-models/erd-api/Relation.model";
import {NODE_TYPES} from "../../../../enums/node-type";

export type MultiplayerConfig = {
  playgroundId: string
  playerId: string
  playgroundKey: string
  playgroundNodesPattern: string
  playerRoom: string
}

export type NodeData = {
  [NODE_TYPES.MEMO]: {
    content: string,
    color: string
  },
  [NODE_TYPES.ENTITY]: {
    name: string,
    color: string,
    columns: IColumnModel[]
  }
}

export type NodeType<T extends NODE_TYPES> = {
  id: string,
  type: NODE_TYPES[T]
  position: {
    x: number,
    y: number
  },
  data: NodeData[T]
}

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
}

export type MousePosition = {
  x: number
  y: number
}

export type SocketCallback = (status: CallbackDataStatus) => void
export type SocketDataHandler<T> = (data: T, callback: SocketCallback) => void

// Worker - listener and emmiter types
type WorkerJoinListenerData = { id: string }
type WorkerJoinEmmitData = WorkerJoinListenerData

type WorkerLeaveListenerData = { id: string }
type WorkerLeaveEmmitData = WorkerLeaveListenerData

type WorkerDataListenerData = any
type WorkerDataEmmitData = WorkerDataListenerData


// Player service - listener and emmiter types
type PlayerSubscribeListenerData     = { playerId: string }
type PlayerSubscribeEmmitData        = PlayerSubscribeListenerData

type PlayerUnSubscribeListenerData   = { playerId: string }
type PlayerUnSubscribeEmmitData      = PlayerUnSubscribeListenerData

type PlayerViewportListenerData      = { playerId: string, viewpoint: Viewport | null }
type PlayerViewpointEmmitData        = PlayerViewportListenerData

type PlayerMouseChangeListenerData   = { playerId: string, cursorPosition: MousePosition | null }
type PlayerMouseChangeEmmitData      = PlayerMouseChangeListenerData


// Column service - listener and emmiter types
type ColumnAddListenerData           = { column: ICColumnModel }
type ColumnAddEmmitData              = { column: IColumnModel }

type ColumnPatchListenerData         = { entityId: string, columnId: string, key: string, value: string | number }
type ColumnPatchEmitData             = ColumnPatchListenerData

type ColumnDeleteListenerData        = { entityId: string, columnId: string[] }
type ColumnDeleteEmitData            = ColumnDeleteListenerData

// Memo service - listener and emmiter types

type MemoAddListenerData             = { memo: MemoNode }
type MemoAddEmmitData                = { node: NodeType<NODE_TYPES.MEMO> }

type MemoPatchListenerData           = { memoId: string, key: string, value: any }
type MemoPatchEmmitData              = MemoPatchListenerData

type MemoDeleteListenerData          = { memoId: string[] }
type MemoDeleteEmmitData             = MemoDeleteListenerData


// Entity service - listener and emmiter types
type EntityAddListenerData           = { entity: EntityNode }
type EntityAddEmmitData              = { node: NodeType<NODE_TYPES.ENTITY> }

type EntityPatchListenerData         = { entityId: string, key: string, value: any }
type EntityPatchEmmitData            = EntityPatchListenerData

type EntityDeleteListenerData        = { entityId: string[] }
type EntityDeleteEmmitData           = EntityDeleteListenerData

// Erd service - listener and emmiter types
type ErdPutListenerData             = Omit<IErdModel, 'team'| 'entities' | 'memos' | 'relations'>
type ErdPutEmmitData                = ErdPutListenerData

type ErdPatchListenerData           = { key: keyof ErdPutListenerData, value: any }
type ErdPatchEmmitData              = ErdPatchListenerData

// Node service - listener and emmiter types
type NodePatchPositionListenerData  = { nodeId: string, type: NODE_TYPES, position: {x: string, y: string} }[]
type NodePatchPositionEmmitData     = NodePatchPositionListenerData

type NodeDeleteEmitData             = { nodeId: string[] }

// Relation service - listener and emmiter types
type RelationAddListenerData        = { relation: Omit<ICRelationModel, 'erd'> }
type RelationAddEmmitData           = RelationAddListenerData

type RelationDeleteListenerData     = { relationId: string[] }
type RelationDeleteEmmitData        = RelationDeleteListenerData

type ClientToServerEvents = {

  // Player service events
  [PlayerEnum.subscribe]       : SocketDataHandler<PlayerSubscribeListenerData>
  [PlayerEnum.unsubscribe]     : SocketDataHandler<PlayerUnSubscribeListenerData>
  [PlayerEnum.viewportChange]  : SocketDataHandler<PlayerViewportListenerData>
  [PlayerEnum.mouseChange]     : SocketDataHandler<PlayerMouseChangeListenerData>

  // Column service events
  [ColumnEnum.add]             : SocketDataHandler<ColumnAddListenerData>
  [ColumnEnum.patch]           : SocketDataHandler<ColumnPatchListenerData>
  [ColumnEnum.delete]          : SocketDataHandler<ColumnDeleteListenerData>

  // Memo service events
  [MemoEnum.add]               : SocketDataHandler<MemoAddListenerData>
  [MemoEnum.patch]             : SocketDataHandler<MemoPatchListenerData>
  [MemoEnum.delete]            : SocketDataHandler<MemoDeleteListenerData>

  // Entity service events
  [EntityEnum.add]             : SocketDataHandler<EntityAddListenerData>
  [EntityEnum.patch]           : SocketDataHandler<EntityPatchListenerData>
  [EntityEnum.delete]          : SocketDataHandler<EntityDeleteListenerData>

  // Erd service events
  [ErdEnum.put]                : SocketDataHandler<ErdPutListenerData>
  [ErdEnum.patch]              : SocketDataHandler<ErdPatchListenerData>

  // Node service events
  [NodeEnum.patchPositions]     : SocketDataHandler<NodePatchPositionListenerData>

  // Relation service events
  [RelationEnum.add]           : SocketDataHandler<RelationAddListenerData>
  [RelationEnum.delete]        : SocketDataHandler<RelationDeleteListenerData>
}

type ServerToClientEvents = {

  // Worker events to client
  [WorkerEnum.join]            : SocketDataHandler<WorkerJoinEmmitData>
  [WorkerEnum.leave]           : SocketDataHandler<WorkerLeaveEmmitData>
  [WorkerEnum.data]            : SocketDataHandler<WorkerDataEmmitData>

  // Player service server to client events
  [PlayerEnum.subscribe]       : SocketDataHandler<PlayerSubscribeEmmitData>
  [PlayerEnum.unsubscribe]     : SocketDataHandler<PlayerUnSubscribeEmmitData>
  [PlayerEnum.viewportChange]  : SocketDataHandler<PlayerViewpointEmmitData>
  [PlayerEnum.mouseChange]     : SocketDataHandler<PlayerMouseChangeEmmitData>

  // Column service server to client events
  [ColumnEnum.add]             : SocketDataHandler<ColumnAddEmmitData>
  [ColumnEnum.patch]           : SocketDataHandler<ColumnPatchEmitData>
  [ColumnEnum.delete]          : SocketDataHandler<ColumnDeleteEmitData>

  // Memo service server to client events
  [MemoEnum.add]               : SocketDataHandler<MemoAddEmmitData>
  [MemoEnum.patch]             : SocketDataHandler<MemoPatchEmmitData>
  // [MemoEnum.delete]            : SocketDataHandler<MemoDeleteEmmitData>

  // Entity service server to client events
  [EntityEnum.patch]           : SocketDataHandler<EntityPatchEmmitData>

  //Erd service server to client events
  [ErdEnum.put]                : SocketDataHandler<ErdPutEmmitData>
  [ErdEnum.patch]              : SocketDataHandler<ErdPatchEmmitData>

  // Node service server to client events
  [NodeEnum.add]               : SocketDataHandler<EntityAddEmmitData | MemoAddEmmitData>
  [NodeEnum.patchPositions]    : SocketDataHandler<NodePatchPositionEmmitData>
  [NodeEnum.delete]            : SocketDataHandler<NodeDeleteEmitData>

  // Relation service server to client events
  [RelationEnum.add]           : SocketDataHandler<RelationAddEmmitData>
  [RelationEnum.delete]        : SocketDataHandler<RelationDeleteEmmitData>
}

export type MultiplayerSocket  = Socket<ClientToServerEvents, ServerToClientEvents>
export type MultiplayerService = (socket: MultiplayerSocket, config: MultiplayerConfig, emmitHandler: MultiplayerWorker['emmitHandler']) => void
