import {IErd} from "../sequelize-models/erd-api/Erd.model";
import {IEntity} from "../sequelize-models/erd-api/Entity.model";
import {IColumn} from "../sequelize-models/erd-api/Column.model";
import {IUser} from "../sequelize-models/erd-api/User.model";
import {IRelation} from "../sequelize-models/erd-api/Relation.model";

interface IPlaygroundEntity extends Omit<IEntity, 'columns' | 'name' | 'color'>{
  data: {
    name: string
    color: string
    columns: IColumn[]
  }
}

export interface IPlayground extends Omit<IErd, 'users' | 'entities' | 'relations'> {
  entities: IPlaygroundEntity[]
  players: Omit<IUser, 'password'>[]
  relations: IRelation[]
}
