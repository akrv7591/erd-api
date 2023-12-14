import express from "express";
import {relationList} from "./relationList";
import {addRelation} from "./addRelation";
import {validateSchemas} from "../../../../middleware/validateSchemas";
import {relationCreateValidations, relationDeleteValidations} from "../../../../validations/relation.validation";
import {deleteRelation} from "./deleteRelation";

const relationRouter = express.Router({mergeParams: true})

relationRouter.delete("/:relationId", validateSchemas(relationDeleteValidations), deleteRelation)
relationRouter.post("", validateSchemas(relationCreateValidations), addRelation)
relationRouter.get("", relationList)

export default relationRouter
