import express from "express";
import v1 from "./v1";
import dayjs from "dayjs";

const routes = express.Router()

routes.use((req, _, next) => {
  console.log(dayjs().toISOString(), req.url)
  next()
})
routes.use("/v1", v1)

export default routes
