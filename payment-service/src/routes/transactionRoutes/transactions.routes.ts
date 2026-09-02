import express from "express";
import { transactionControllers } from "../../controllers";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";
import { JoiValidators } from "../../validations";

const router = express.Router();

router.post(
  "/create-transaction",
  generalAuthFunction,
  transactionControllers.createTransactionController
);

router.get(
  "/get-user-payment-history",
  JoiValidators.inputValidator(JoiValidators.createTransactionSchema),
  generalAuthFunction,
  transactionControllers.getUserTransactionsController
);

export default router;
