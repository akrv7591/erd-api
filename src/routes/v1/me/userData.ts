import { logToApi } from "../../../api/logTo";
import { GetRequest } from "../../../types/types";
import { GetUserResponse } from "../../../types/user";
import { axiosErrorHandler } from "../../../utils/errorHandler";

export const userData: GetRequest = async (request, response) => {
  try {
    const {sub: userId} = request.authorization
    const {data} = await logToApi.get<GetUserResponse>(`/api/users/${userId}`)

    return response.json(data)
  } catch(error) {
    axiosErrorHandler(response, error)
  }
}
