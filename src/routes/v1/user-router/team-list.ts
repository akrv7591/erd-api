import {RequestHandler} from "express";
import {axiosErrorHandler} from "../../../utils/errorHandler";
import {logToApi} from "../../../api/logTo";

const filterFn = (userId: string) => (team: any) => !(team.customData.isPersonal && team.customData.owner === userId)

export const teamList: RequestHandler = async (req, res) => {
  const {sub: userId} = req.authorization;

  try {

    const response = await logToApi.get(`/api/users/${userId}/organizations`)

    res.json(response.data.filter(filterFn(userId)))

  } catch (error) {

    axiosErrorHandler(res, error)
  }
}
