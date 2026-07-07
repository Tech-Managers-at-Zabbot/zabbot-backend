import usersRepositories from "../../repositories/userRepositories/users.repositories";
import { errorUtilities, responseUtilities } from "../../../../shared/utilities";
import { StatusCodes } from "../../../../shared/statusCodes/statusCodes.responses";
import { GeneralResponses } from "../../responses/generalResponses/general.responses";

const toDateString = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);

export const logStreak = async (userId: string): Promise<void> => {
  const user = await usersRepositories.getOne({ id: userId }, [
    "id",
    "currentStreak",
    "longestStreak",
    "lastStreakDate",
    "timeZone",
  ]);

  if (!user) return;

  const timeZone = (user as any).timeZone || "UTC";
  const now = new Date();
  const todayStr = toDateString(now, timeZone);

  if ((user as any).lastStreakDate) {
    const lastStr = toDateString(new Date((user as any).lastStreakDate), timeZone);
    if (lastStr === todayStr) return;

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toDateString(yesterday, timeZone);

    const newStreak = lastStr === yesterdayStr ? (user as any).currentStreak + 1 : 1;
    const longestStreak = Math.max((user as any).longestStreak ?? 0, newStreak);

    await usersRepositories.updateOne({ id: userId }, { currentStreak: newStreak, longestStreak, lastStreakDate: now });
  } else {
    await usersRepositories.updateOne({ id: userId }, { currentStreak: 1, longestStreak: Math.max((user as any).longestStreak ?? 0, 1), lastStreakDate: now });
  }
};

const logStreakService = errorUtilities.withServiceErrorHandling(
  async (userId: string) => {
    await logStreak(userId);

    const user = await usersRepositories.getOne({ id: userId }, [
      "currentStreak",
      "longestStreak",
      "lastStreakDate",
    ]);

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      GeneralResponses.PROCESS_SUCCESSFUL,
      user
    );
  }
);

export default { logStreakService };
