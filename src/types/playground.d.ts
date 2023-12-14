import {IErd} from "../sequelize-models/erd-api/Erd.model";
import {ITable} from "../sequelize-models/erd-api/Table.model";
import {IColumn} from "../sequelize-models/erd-api/Column.model";
import {IUser} from "../sequelize-models/erd-api/User.model";
import {IRelation} from "../sequelize-models/erd-api/Relation.model";

interface IPlaygroundTable extends Omit<ITable, 'columns' | 'name' | 'color'>{
  data: {
    name: string
    color: string
    columns: IColumn[]
  }
}

export interface IPlayground extends Omit<IErd, 'users' | 'tables' | 'relations'> {
  tables: IPlaygroundTable[]
  players: Omit<IUser, 'password'>[]
  relations: IRelation[]
}
