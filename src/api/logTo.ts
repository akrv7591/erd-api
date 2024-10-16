import axios from "axios";
import config from "../config/config";
import {LogToService} from "../services/logto";

const logToApi = axios.create({
  baseURL: config.logTo.endpoint,
})

logToApi.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    config.headers.Authorization = LogToService.authorization
  }
  return config
})

logToApi.interceptors.response.use((response) => {
  return response
}, (error) => {
  return Promise.reject(error)
})


export {
  logToApi
}
