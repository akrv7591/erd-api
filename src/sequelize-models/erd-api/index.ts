import {Sequelize, SequelizeOptions} from 'sequelize-typescript';
import config from "../../config/config";
import {Erd} from "./Erd";
import {StaticFile} from "./StaticFile";

const logFunction: SequelizeOptions['logging'] = (sql, timing) => {
  console.log(sql);
}

export const erdSequelize = new Sequelize({
  ...config.db.erd,
  logging: config.db.logging ? logFunction : false,
  models: [
    Erd,
    StaticFile
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

      console.log("🎉 DB CONNECTION SUCCESS")

    } catch (e) {
      console.error(e)
      throw new Error("DB CONNECTION FAILED")
    }
  }
}
