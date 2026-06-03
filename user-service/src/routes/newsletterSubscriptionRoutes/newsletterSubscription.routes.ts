import express from "express";
import joiValidations from "../../validations/joi/joi.validations";
import { newsletterSubscriptionControllers } from "../../controllers";

const router = express.Router();

router.post(
  "/",
  joiValidations.inputValidator(joiValidations.newsletterSubscriptionSchema),
  newsletterSubscriptionControllers.createNewsletterSubscriptionController,
);

router.delete(
  "/",
  joiValidations.inputValidator(joiValidations.newsletterSubscriptionSchema),
  newsletterSubscriptionControllers.deleteNewsletterSubscriptionController,
);

export default router;
