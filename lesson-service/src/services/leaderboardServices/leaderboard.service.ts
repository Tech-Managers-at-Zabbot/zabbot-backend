import {
  errorUtilities,
  responseUtilities,
} from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { CourseResponses } from "../../responses/responses";
import { v4 } from "uuid";
import Users from "../../../../shared/entities/user-service-entities/users/users.entities";
import UserLeaderboard from "../../../../shared/entities/user-service-entities/leaderboard/leaderboard.entities";
import { Op } from "sequelize";
import sequelize from "sequelize";

interface UpdateLeaderboardParams {
  userId: string;
  scoreToAdd: number;
  quizCompleted?: boolean;
  quizCorrect?: boolean;
  dailyWordsListened?: number;
}

// -------------------------------
// Shared UTC boundary helper
// All services MUST use this so that lastUpdatedDate / lastUpdatedWeek
// are always written and compared against the same values.
// Week starts on Monday.
// -------------------------------
function getUTCBoundaries() {
  const now = new Date();

  const dayStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0,
    ),
  );

  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, … 6=Sat
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + mondayOffset,
      0, 0, 0, 0,
    ),
  );

  return { now, dayStart, weekStart };
}

export const updateUserLeaderBoardScoresService =
  errorUtilities.withServiceErrorHandling(async (params: UpdateLeaderboardParams) => {
    const { userId, scoreToAdd, quizCompleted, quizCorrect, dailyWordsListened } = params;

    // 1️⃣ Fetch user
    const user = await Users.findByPk(userId);
    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NotFound);
    }

    // 2️⃣ Sanitize input
    const safeScoreToAdd = Number(scoreToAdd) || 0;
    const safeDailyWords = Number(dailyWordsListened) || 0;
    const { now, dayStart, weekStart } = getUTCBoundaries();

    if (!UserLeaderboard.sequelize) {
      throw errorUtilities.createError(
        "Database connection not available",
        StatusCodes.InternalServerError
      );
    }

    // 3️⃣ Transaction for atomic update
    await UserLeaderboard.sequelize.transaction(async (t) => {
      // Lock row for update to prevent race conditions
      const leaderboard = await UserLeaderboard.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!leaderboard) {
        throw errorUtilities.createError("Leaderboard record not found", StatusCodes.NotFound);
      }

      // 4️⃣ Prepare reset if needed
      const resetData: Partial<typeof leaderboard> = {};

      const storedDayStart = leaderboard.lastUpdatedDate
        ? new Date(leaderboard.lastUpdatedDate).getTime()
        : 0;

      const storedWeekStart = leaderboard.lastUpdatedWeek
        ? new Date(leaderboard.lastUpdatedWeek).getTime()
        : 0;

      if (storedDayStart < dayStart.getTime()) {
        resetData.dailyScore = 0;
        resetData.dailyWordsListened = 0;
        resetData.lastUpdatedDate = dayStart;
      }

      if (storedWeekStart < weekStart.getTime()) {
        resetData.weeklyScore = 0;
        resetData.lastUpdatedWeek = weekStart;
      }

      // Always update lastUpdated for tracking
      resetData.lastUpdated = now;

      // 5️⃣ Apply reset and increment atomically
      if (Object.keys(resetData).length > 0) {
        await leaderboard.update(resetData, { transaction: t });
      }

      // 6️⃣ Increment scores
      await leaderboard.increment(
        {
          dailyScore: safeScoreToAdd,
          weeklyScore: safeScoreToAdd,
          allTimeScore: safeScoreToAdd,
          quizzesCompleted: quizCompleted ? 1 : 0,
          quizzesCorrect: quizCorrect ? 1 : 0,
          dailyWordsListened: safeDailyWords,
        },
        { transaction: t }
      );

      // 7️⃣ Sync username/avatar
      await leaderboard.update(
        {
          username: `${user.firstName} ${user.lastName}`,
          avatar: user.profilePicture,
          lastUpdated: now, // refresh lastUpdated
        },
        { transaction: t }
      );
    });
        return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL)
  });

const getUserLeaderboardPositionService =
  errorUtilities.withServiceErrorHandling(async (userId: string) => {
    const { now, dayStart, weekStart } = getUTCBoundaries();

    const userLeaderboard = await UserLeaderboard.findOne({ where: { userId } });
    if (!userLeaderboard) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.NotFound,
        "User not found on leaderboard",
        null,
      );
    }

    const updatedData: any = {};
    let updated = false;

    const storedDayStart = userLeaderboard.lastUpdatedDate
      ? new Date(userLeaderboard.lastUpdatedDate).getTime()
      : 0;

    const storedWeekStart = userLeaderboard.lastUpdatedWeek
      ? new Date(userLeaderboard.lastUpdatedWeek).getTime()
      : 0;

    if (storedDayStart < dayStart.getTime()) {
      updatedData.dailyScore = 0;
      updatedData.dailyWordsListened = 0;
      updatedData.lastUpdatedDate = dayStart;
      updated = true;
    }

    if (storedWeekStart < weekStart.getTime()) {
      updatedData.weeklyScore = 0;
      updatedData.lastUpdatedWeek = weekStart;
      updated = true;
    }

    if (updated) {
      updatedData.lastUpdated = now;
      await UserLeaderboard.update(updatedData, { where: { userId } });
    }

    const newUserLeaderboard: any = await UserLeaderboard.findOne({ where: { userId } });

    // Calculate ranks
    const dailyRank =
      (await UserLeaderboard.count({
        where: { dailyScore: { [Op.gt]: newUserLeaderboard.dailyScore } },
      })) + 1;

    const weeklyRank =
      (await UserLeaderboard.count({
        where: { weeklyScore: { [Op.gt]: newUserLeaderboard.weeklyScore } },
      })) + 1;

    const allTimeRank =
      (await UserLeaderboard.count({
        where: { allTimeScore: { [Op.gt]: newUserLeaderboard.allTimeScore } },
      })) + 1;

    await UserLeaderboard.update(
      { dailyRank, weeklyRank, allTimeRank },
      { where: { userId } },
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      {
        userId,
        dailyRank,
        weeklyRank,
        allTimeRank,
        dailyScore: newUserLeaderboard.dailyScore,
        weeklyScore: newUserLeaderboard.weeklyScore,
        allTimeScore: newUserLeaderboard.allTimeScore,
        quizzesCompleted: newUserLeaderboard.quizzesCompleted,
        quizzesCorrect: newUserLeaderboard.quizzesCorrect,
      },
    );
  });

const getAllLeaderboardDataService = errorUtilities.withServiceErrorHandling(
  async (period: "daily" | "weekly" | "allTime", limit: number = 50) => {
    const { now, dayStart, weekStart } = getUTCBoundaries();

    // Reset stale daily/weekly scores using the same UTC boundaries
    await UserLeaderboard.update(
      { dailyScore: 0, dailyWordsListened: 0, lastUpdatedDate: dayStart, lastUpdated: now },
      { where: { lastUpdatedDate: { [Op.lt]: dayStart } } },
    );

    await UserLeaderboard.update(
      { weeklyScore: 0, lastUpdatedWeek: weekStart, lastUpdated: now },
      { where: { lastUpdatedWeek: { [Op.lt]: weekStart } } },
    );

    const scoreField =
      period === "daily"
        ? "dailyScore"
        : period === "weekly"
        ? "weeklyScore"
        : "allTimeScore";

    const leaderboard = await UserLeaderboard.findAll({
      order: [[scoreField, "DESC"]],
      limit,
      raw: true,
      attributes: ["id", "userId", "username", "avatar", "dailyScore", "weeklyScore", "allTimeScore"],
    });

    const formattedLeaderboard = leaderboard.map((entry, index) => {
      const rank = index + 1;
      const points =
        period === "daily"
          ? entry.dailyScore
          : period === "weekly"
          ? entry.weeklyScore
          : entry.allTimeScore;
      return {
        id: entry.id,
        rank,
        name: entry.username || "Anonymous",
        avatar:
          entry.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId}`,
        points,
        ...(rank === 1 && { color: "bg-[#fef9a7]" }),
        ...(rank === 2 && { color: "bg-[#d6dde8]" }),
        ...(rank === 3 && { color: "bg-[#F5C9A8]" }),
      };
    });

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      CourseResponses.PROCESS_SUCCESSFUL,
      {
        period,
        leaderboard: formattedLeaderboard,
        totalUsers: leaderboard.length,
      },
    );
  },
);


export default {
  updateUserLeaderBoardScoresService,
  getUserLeaderboardPositionService,
  getAllLeaderboardDataService,
};