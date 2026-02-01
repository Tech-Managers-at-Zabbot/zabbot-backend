import express from "express";
import { generalAuthFunction } from "../../../shared/middleware/authorization.middleware";
import { leaderboardController } from "../controllers";

const router = express.Router();

router.post(
  "/update-user-leaderboard",
  generalAuthFunction,
  leaderboardController.updateUserLeaderboardController,
);
router.get(
  "/user-leaderboard",
  generalAuthFunction,
  leaderboardController.getUserLeaderboardPositionController,
);
router.get(
  "/all-leaderboard",
  generalAuthFunction,
  leaderboardController.getAllLeaderboardDataController,
);

export default router;