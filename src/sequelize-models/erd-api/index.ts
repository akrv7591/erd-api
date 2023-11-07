import {Sequelize} from 'sequelize-typescript';
import config from "../../config/config";
import {User} from "./User.model";
import {Account} from "./Account.model";
import {EmailVerificationToken} from "./EmailVerificationToken.model";
import {RefreshToken} from "./RefreshToken.model";
import {ResetToken} from "./ResetToken.model";
import {Team} from "./Team.model";
import {UserTeam} from "./UserTeam.model";
import {Erd} from "./Erd.model";
import {UserErd} from "./UserErd.model";
import {Table} from "./Table.model";
import {Column} from "./Column.model";
import {Relation} from "./Relation.model";

export const erdSequelize = new Sequelize({
  ...config.db.erd,
  models: [
    User,
    Account,
    EmailVerificationToken,
    RefreshToken,
    ResetToken,
    Team,
    UserTeam,
    Erd,
    UserErd,
    Table,
    Column,
    Relation
  ]
});
