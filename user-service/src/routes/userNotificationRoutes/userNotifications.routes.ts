import joiValidations from "../../validations/joi/joi.validations";
import { userNotificationControllers } from "../../controllers";
import express, { Request, Response, NextFunction } from "express";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";

const router = express.Router();

router.put(
  "/change-user-notification",
  generalAuthFunction,
  userNotificationControllers.upsertUserNotificationController
);

router.get(
  "/get-user-notification",
  generalAuthFunction,
  userNotificationControllers.getUserNotificationSettingController
);

export default router;
