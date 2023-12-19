import {ITable, Table} from "../sequelize-models/erd-api/Table.model";
import {IColumn} from "../sequelize-models/erd-api/Column.model";
import {IRelation} from "../sequelize-models/erd-api/Relation.model";

export const KEYS = {
  erd: "erd"
}

export enum MULTIPLAYER_SOCKET {
  ADD_PLAYER = "ADD_PLAYER",
  REMOVE_PLAYER = "REMOVE_PLAYER",
  SUBSCRIBE_TO_PLAYER = "SUBSCRIBE_TO_PLAYER",
  UNSUBSCRIBE_TO_PLAYER = "UNSUBSCRIBE_TO_PLAYER",
  ON_USER_VIEWPORT_CHANGE = "ON_USER_VIEWPORT_CHANGE",
  ON_USER_MOUSE_CHANGE = "ON_USER_MOUSE_CHANGE",
  ADD_TABLE = "ONA_ADD_TABLE",
  UPDATE_TABLE = "UPDATE_TABLE",
  DELETE_TABLE = "DELETE_TABLE",
  SUBSCRIBE_TO_TABLE_DATE = "SUBSCRIBE_TO_TABLE_DATE",
  ADD_TABLE_COLUMN = "ADD_TABLE_COLUMN",
  UPDATED_TABLE_COLUMN = "UPDATED_TABLE_COLUMN",
  DELETE_TABLE_COLUMN = "DELETE_TABLE_COLUMN",
  SET_TABLE_DATA = "SET_TABLE_DATA",
  ADD_RELATION = "ADD_RELATION",
  DELETE_RELATION = "DELETE_RELATION"
}

export interface IMultiplayerListeners {
  // User
  joinRoom: (erdId: string, userId: string, callback: Function, onError: Function) => Promise<void>
  leaveRoom: (erdId: string, userId: string, callback: Function, onError: Function) => Promise<void>

  // Table
  addTable: (tableData: any, callback: Function, onError: Function) => Promise<void>
  updateTable: (tableData: ITable, callback: Function, onError: Function) => Promise<void>
  deleteTable: (tableData: string, callback: Function, onError: Function) => Promise<void>

  subscribeToTableData: (tableId: string, callback: Function, onError: Function) => Promise<void>

  // Table column
  addTableColumn: (tableId: string, columnData: IColumn, callback: Function, onError: Function) => Promise<void>
  updateTableColumn: (tableId: string, columnData: IColumn, callback: Function, onError: Function) => Promise<void>
  deleteTableColumn: (tableId: string, columnId: string, callback: Function, onError: Function) => Promise<void>

  // Table data
  setTableData: (tableId: string, key: keyof Table, value: string, callback: Function, onError: Function) => Promise<void>

  // Relations
  addRelation: (relation: IRelation, callback: Function, onError: Function) => Promise<void>
  deleteRelation: (relation: string, callback: Function, onError: Function) => Promise<void>

}
