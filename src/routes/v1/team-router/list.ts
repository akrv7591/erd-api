import {GetRequest} from "../../../types/types";
import {axiosErrorHandler} from "../../../utils/errorHandler";
import {logToApi} from "../../../api/logTo";

export const list: GetRequest = async (req, res) => {

  try {
    const data = await logToApi.get(`/api/organizations`).then(res => res.data)

    res.json(data)

  } catch (e) {
    axiosErrorHandler(res, e)
  }
}
