import express from "express";
import {columnList} from "./columnList";
import {bulkUpdateColumn} from "./bulkUpdateColumn";
import {validateSchemas} from "../../../../../middleware/validateSchemas";
import {columnBulkValidator, columnUpsertValidation} from "../../../../../validations/column.validator";
import {upsertColumn} from "./upsertColumn";
import {deleteColumn} from "./deleteColumn";

const columnRouter = express.Router({mergeParams: true})

columnRouter.put("/bulk", validateSchemas(columnBulkValidator), bulkUpdateColumn)
columnRouter.delete("/:columnId", deleteColumn)
columnRouter.put("", validateSchemas(columnUpsertValidation), upsertColumn)
columnRouter.get("", columnList)

export default columnRouter
