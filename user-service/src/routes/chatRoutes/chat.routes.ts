import express, { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import { users_service_db } from "../../../../config/databases";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";

const router = express.Router();
const DAILY_LIMIT = 30;

type AuthenticatedRequest = Request & {
  user?: { userId?: string };
};

const getAuthenticatedUserId = (req: Request): string | null => {
  const userId = (req as AuthenticatedRequest).user?.userId;
  return typeof userId === "string" && userId.length > 0 ? userId : null;
};

// These endpoints read only from STAGING's existing chat tables.
// Authentication is verified by the shared backend middleware; the
// subscriber ID is never taken from query parameters or request bodies.
router.use(generalAuthFunction as any);

router.get("/usage", async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const records = await users_service_db.query<{ used_count: number }>(
      `SELECT used_count
         FROM public.chat_daily_usage
        WHERE user_id = :userId
          AND usage_date = (NOW() AT TIME ZONE 'UTC')::date`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    );

    const usedCount = Number(records[0]?.used_count ?? 0);
    res.setHeader("Cache-Control", "no-store");
    res.json({
      used: usedCount,
      remaining: Math.max(0, DAILY_LIMIT - usedCount),
      limit: DAILY_LIMIT,
      resetTimezone: "UTC",
    });
  } catch (error) {
    console.error("Failed to retrieve chat daily usage:", error);
    res.status(500).json({ error: "Unable to retrieve chat usage" });
  }
});

router.get("/conversations", async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const conversations = await users_service_db.query<{
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, title, created_at, updated_at
         FROM public.chat_conversations
        WHERE user_id = :userId
        ORDER BY updated_at DESC, id DESC`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    );

    res.setHeader("Cache-Control", "no-store");
    res.json({ conversations });
  } catch (error) {
    console.error("Failed to retrieve chat conversations:", error);
    res.status(500).json({ error: "Unable to retrieve conversations" });
  }
});

export default router;
