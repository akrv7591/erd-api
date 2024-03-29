import {IErdModel} from "../sequelize-models/erd-api/Erd.model";
import {IEntityModel} from "../sequelize-models/erd-api/Entity.model";
import {IColumnModel} from "../sequelize-models/erd-api/Column.model";
import {IUserModel} from "../sequelize-models/erd-api/User.model";
import {IRelationModel} from "../sequelize-models/erd-api/Relation.model";

interface IPlaygroundEntity extends Omit<IEntityModel, 'columns' | 'name' | 'color'>{
  data: {
    name: string
    color: string
    columns: IColumnModel[]
  }
}

export interface IPlayground extends Omit<IErdModel, 'users' | 'entities' | 'relations'> {
  entities: IPlaygroundEntity[]
  players: Omit<IUserModel, 'password'>[]
  relations: IRelationModel[]
}
