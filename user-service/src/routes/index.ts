import express from "express";
import authRoutes from "./authRoutes/auth.routes";
import userRoutes from "./userRoutes/user.routes";
import userNotificationRoutes from "./userNotificationRoutes/userNotifications.routes";
import newsletterSubscriptionRoutes from "./newsletterSubscriptionRoutes/newsletterSubscription.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/user-notifications", userNotificationRoutes);
router.use("/newsletter-subscriptions", newsletterSubscriptionRoutes);

export default router;
