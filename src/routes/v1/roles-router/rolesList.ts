import {GetRequest} from "../../../types/types";
import {LogToService} from "../../../services/logto";
import {internalErrorHandler} from "../../../utils/errorHandler";

export const rolesList: GetRequest = async (req, res) => {
  try {
    const rolesList = await LogToService.fetchRoles()

    res.json(rolesList)
  } catch (e) {
    internalErrorHandler(res, e)
  }
}
