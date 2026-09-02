"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./authRoutes/auth.routes"));
const user_routes_1 = __importDefault(require("./userRoutes/user.routes"));
const userNotifications_routes_1 = __importDefault(require("./userNotificationRoutes/userNotifications.routes"));
const newsletterSubscription_routes_1 = __importDefault(require("./newsletterSubscriptionRoutes/newsletterSubscription.routes"));
const router = express_1.default.Router();
router.use("/auth", auth_routes_1.default);
router.use("/users", user_routes_1.default);
router.use("/user-notifications", userNotifications_routes_1.default);
router.use("/newsletter-subscriptions", newsletterSubscription_routes_1.default);
exports.default = router;
