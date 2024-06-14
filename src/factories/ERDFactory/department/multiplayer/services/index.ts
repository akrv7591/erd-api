import {columnService} from "./column-service"
import {playerService} from "./player-service"
import {memoService} from "./memo-service";
import {entityService} from "./entity-service";
import {erdService} from "./erd-service";
import {nodeService} from "./node-service";
import {relationService} from "./relation-service";

export const MultiplayerServices = [
  playerService,
  columnService,
  memoService,
  entityService,
  erdService,
  nodeService,
  relationService,
]
