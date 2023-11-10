import express from "express";
import {tableList} from "./list";
import {tableCount} from "./count";
import columnRouter from "./column-router";
import relationRouter from "./relation-router";
import {upsertTable} from "./upsertTable";
import {validateSchemas} from "../../../../middleware/validateSchemas";
import {bulkTableValidations, tableValidations} from "../../../../validations/table.validations";
import {bulkUpdateTable} from "./bulkUpdateTable";
import {deleteTable} from "./deleteTable";

const tableRouter = express.Router({mergeParams: true})

tableRouter.use("/:tableId/column", columnRouter)
tableRouter.use("/:tableId/relation", relationRouter)
tableRouter.delete("/:tableId", deleteTable)
tableRouter.get("/count", tableCount)
tableRouter.put("/bulk", validateSchemas(bulkTableValidations), bulkUpdateTable)
tableRouter.get("", tableList)
tableRouter.put("", validateSchemas(tableValidations), upsertTable)

export default tableRouter
