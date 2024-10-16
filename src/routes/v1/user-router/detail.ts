import {axiosErrorHandler} from "../../../utils/errorHandler";
import {logToApi} from "../../../api/logTo";
import {GetRequest} from "../../../types/types";

interface UserDetailRequestParams {
  userId: string
}

export const detail: GetRequest<UserDetailRequestParams> = async (req, res) => {
  const {userId} = req.params;

  try {

    const response = await logToApi.get(`/api/users/${userId}`)

    res.json(response.data)

  } catch (error) {
    axiosErrorHandler(res, error)
  }
}
