import {GetRequest} from "../../../types/types";
import {LogToService} from "../../../services/logto";
import {axiosErrorHandler} from "../../../utils/errorHandler";

export const rolesList: GetRequest = async (req, res) => {
  try {
    const rolesList = await LogToService.fetchRoles()

    res.json(rolesList)
  } catch (e) {
    axiosErrorHandler(res, e)
  }
}
