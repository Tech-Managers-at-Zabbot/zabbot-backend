import express from "express";
import { subscriptionControllers } from "../../controllers";
import { generalAuthFunction, rolePermit } from "../../../../shared/middleware/authorization.middleware";
import { JoiValidators } from "../../validations";
import { getUserEntitlement } from "../../../../shared/subscription-gating/getUserEntitlement";

const router = express.Router();

router.post(
  "/create-subscription-plan",
  JoiValidators.inputValidator(JoiValidators.createSubscriptionPlanSchema),
  generalAuthFunction,
  rolePermit(["admin"]),
  subscriptionControllers.createSubscriptionController
);

router.get(
  "/user-subscription",
  generalAuthFunction,
  subscriptionControllers.getUserSubscriptionController
);

// Phase 2 read-only visibility endpoint. Does NOT enforce subscription access.
router.get("/entitlement", generalAuthFunction, async (request: any, response) => {
  const userId = request.user?.userId;
  if (!userId) {
    return response.status(401).json({
      status: "error",
      code: "LOGIN_REQUIRED",
    });
  }

  try {
    const entitlement = await getUserEntitlement(userId);
    response.setHeader("Cache-Control", "no-store");
    return response.status(200).json({
      status: "success",
      data: entitlement,
    });
  } catch (_error) {
    // Never turn a failed entitlement lookup into access being granted.
    return response.status(503).json({
      status: "error",
      code: "ENTITLEMENT_UNAVAILABLE",
    });
  }
});

export default router;
