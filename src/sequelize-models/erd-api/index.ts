import {Sequelize, SequelizeOptions} from 'sequelize-typescript';
import config from "../../config/config";
import {UserModel} from "./User.model";
import {AccountModel} from "./Account.model";
import {EmailVerificationTokenModel} from "./EmailVerificationToken.model";
import {RefreshTokenModel} from "./RefreshToken.model";
import {ResetTokenModel} from "./ResetToken.model";
import {TeamModel} from "./Team.model";
import {UserTeamModel} from "./UserTeam.model";
import {ErdModel} from "./Erd.model";
import {EntityModel} from "./Entity.model";
import {ColumnModel} from "./Column.model";
import {RelationModel} from "./Relation.model";
import {TeamErdModel} from "./TeamErd.model";
import {MemoModel} from "./Memo.mode";
import {ProfileModel} from "./Profile.model";
import {StaticFileModel} from "./StaticFile";

const logFunction: SequelizeOptions['logging'] = (sql, timing) => {
  console.log(sql);
}

export const erdSequelize = new Sequelize({
  ...config.db.erd,
  logging: config.db.logging ? logFunction : false,
  models: [
    UserModel,
    AccountModel,
    EmailVerificationTokenModel,
    RefreshTokenModel,
    ResetTokenModel,
    TeamModel,
    UserTeamModel,
    ErdModel,
    EntityModel,
    ColumnModel,
    RelationModel,
    TeamErdModel,
    MemoModel,
    ProfileModel,
    StaticFileModel,
  ]
});

export class ErdiagramlySequelize {
  static async initSequelize() {
    try {
      await erdSequelize.authenticate()

      if (config.db.sync) {
        await erdSequelize.sync({alter: true})
      }

      // await MemoModel.sync({alter: true})

      console.log("\u2714 DB CONNECTION SUCCESS")

    } catch (e) {
      console.error(e)
      throw new Error("DB CONNECTION FAILED")
    }
  }
}
