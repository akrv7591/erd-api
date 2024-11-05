import express from "express";
import v1 from "./v1";
// import dayjs from "dayjs";

const routes = express.Router()

routes.use((req, res, next) => {
  // console.log(`${dayjs().toISOString()} ${req.method.toUpperCase()}: ${req.url}`)
  next()
})
routes.get("/health-check", (_, res) => {
  console.log("HEALTH CHECK")
  res.status(200).json({message: "OK"})
})


routes.use("/v1", v1)

export default routes
