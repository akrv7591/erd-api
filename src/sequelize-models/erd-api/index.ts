import {Sequelize, SequelizeOptions} from 'sequelize-typescript';
import config from "../../config/config";
import {User} from "./User.model";
import {Account} from "./Account.model";
import {EmailVerificationToken} from "./EmailVerificationToken.model";
import {RefreshToken} from "./RefreshToken.model";
import {ResetToken} from "./ResetToken.model";
import {Team} from "./Team.model";
import {UserTeam} from "./UserTeam.model";
import {Erd} from "./Erd.model";
import {Entity} from "./Entity.model";
import {Column} from "./Column.model";
import {Relation} from "./Relation.model";
import {TeamErd} from "./TeamErd.model";
import {Memo} from "./Memo.mode";

const logFunction: SequelizeOptions['logging'] = (sql, timing) => {
  console.log(sql);
}

export const erdSequelize = new Sequelize({
  ...config.db.erd,
  logging: config.db.logging ? logFunction : false,
  models: [
    User,
    Account,
    EmailVerificationToken,
    RefreshToken,
    ResetToken,
    Team,
    UserTeam,
    Erd,
    Entity,
    Column,
    Relation,
    TeamErd,
    Memo
  ]
});

export class ErdiagramlySequelize {
  static async initSequelize() {
    try {
      await erdSequelize.authenticate()

      if (config.db.sync) {
        await erdSequelize.sync({alter: true})
      }
    } catch (e) {
      console.error(e)
      throw new Error("DB CONNECTION FAILED")
    }
  }
}
