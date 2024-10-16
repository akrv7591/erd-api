import { Router} from "express";
import {LogToService} from "../../../services/logto";
import {LOG_TO_EVENTS} from "../../../enums/log-to";

const logToWebhookRouter = Router();

logToWebhookRouter.post("", async (req, res) => {
  console.log(req.body)
  switch (req.body.event) {
    case LOG_TO_EVENTS.USER_CREATED: {
      await LogToService.createUserOrganization(req.body)
    }
  }

  res.sendStatus(200)
})

export {
  logToWebhookRouter
}
