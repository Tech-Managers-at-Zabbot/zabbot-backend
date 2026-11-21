import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
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

// All endpoints require a verified subscriber JWT.
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

// Atomically claim one daily allowance slot. This route is not called by the
// frontend yet. The chat sender must invoke it before contacting OpenAI.
// A failed or interrupted OpenAI call needs an authorized server-side
// reconciliation path before this feature can replace the browser counter.
router.post("/usage/claim", async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const records = await users_service_db.query<{ used_count: number }>(
      `INSERT INTO public.chat_daily_usage
         (user_id, usage_date, used_count, created_at, updated_at)
       VALUES (:userId, (NOW() AT TIME ZONE 'UTC')::date, 1, NOW(), NOW())
       ON CONFLICT (user_id, usage_date) DO UPDATE
       SET used_count = chat_daily_usage.used_count + 1,
           updated_at = NOW()
       WHERE chat_daily_usage.used_count < :dailyLimit
       RETURNING used_count`,
      {
        replacements: { userId, dailyLimit: DAILY_LIMIT },
        type: QueryTypes.SELECT,
      }
    );

    res.setHeader("Cache-Control", "no-store");
    if (records.length === 0) {
      res.status(429).json({
        error: "Daily chat limit reached",
        used: DAILY_LIMIT,
        remaining: 0,
        limit: DAILY_LIMIT,
        resetTimezone: "UTC",
      });
      return;
    }

    const used = Number(records[0].used_count);
    res.json({
      used,
      remaining: Math.max(0, DAILY_LIMIT - used),
      limit: DAILY_LIMIT,
      resetTimezone: "UTC",
    });
  } catch (error) {
    console.error("Failed to claim chat usage:", error);
    res.status(500).json({ error: "Unable to claim chat usage" });
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


const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// Create an empty conversation owned by the verified subscriber.
router.post("/conversations", async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const title = req.body?.title === undefined ? "New Chat" : req.body.title;
  if (typeof title !== "string" || title.trim().length === 0 || title.trim().length > 255) {
    res.status(400).json({ error: "Title must be between 1 and 255 characters" });
    return;
  }

  try {
    const records = await users_service_db.query<{
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
    }>(
      `INSERT INTO public.chat_conversations (id, user_id, title)
       VALUES (:id, :userId, :title)
       RETURNING id, title, created_at, updated_at`,
      {
        replacements: { id: randomUUID(), userId, title: title.trim() },
        type: QueryTypes.SELECT,
      }
    );

    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({ conversation: records[0] });
  } catch (error) {
    console.error("Failed to create chat conversation:", error);
    res.status(500).json({ error: "Unable to create conversation" });
  }
});

// Read messages only when the conversation belongs to the verified user.
router.get("/conversations/:conversationId/messages", async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const conversationId = req.params.conversationId;
  if (!isUuid(conversationId)) {
    res.status(400).json({ error: "Invalid conversation ID" });
    return;
  }

  try {
    const owned = await users_service_db.query<{ id: string }>(
      `SELECT id FROM public.chat_conversations
        WHERE id = :conversationId AND user_id = :userId`,
      { replacements: { conversationId, userId }, type: QueryTypes.SELECT }
    );
    if (owned.length === 0) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const messages = await users_service_db.query<{
      id: string;
      role: string;
      content: string;
      created_at: string;
    }>(
      `SELECT id, role, content, created_at FROM public.chat_messages
        WHERE conversation_id = :conversationId
        ORDER BY created_at ASC, id ASC
        LIMIT 500`,
      { replacements: { conversationId }, type: QueryTypes.SELECT }
    );
    res.setHeader("Cache-Control", "no-store");
    res.json({ messages });
  } catch (error) {
    console.error("Failed to retrieve chat messages:", error);
    res.status(500).json({ error: "Unable to retrieve messages" });
  }
});

// Rename only the authenticated subscriber's conversation.
router.patch("/conversations/:conversationId", async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const conversationId = req.params.conversationId;
  const title = req.body?.title;
  if (!isUuid(conversationId) || typeof title !== "string" ||
      title.trim().length === 0 || title.trim().length > 255) {
    res.status(400).json({ error: "Valid conversation ID and title are required" });
    return;
  }

  try {
    const records = await users_service_db.query<{
      id: string;
      title: string;
      updated_at: string;
    }>(
      `UPDATE public.chat_conversations SET title = :title, updated_at = NOW()
        WHERE id = :conversationId AND user_id = :userId
        RETURNING id, title, updated_at`,
      {
        replacements: { conversationId, userId, title: title.trim() },
        type: QueryTypes.SELECT,
      }
    );
    if (records.length === 0) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    res.json({ conversation: records[0] });
  } catch (error) {
    console.error("Failed to rename chat conversation:", error);
    res.status(500).json({ error: "Unable to rename conversation" });
  }
});

// Deleting the conversation cascades to its messages via the database FK.
router.delete("/conversations/:conversationId", async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const conversationId = req.params.conversationId;
  if (!isUuid(conversationId)) {
    res.status(400).json({ error: "Invalid conversation ID" });
    return;
  }

  try {
    const records = await users_service_db.query<{ id: string }>(
      `DELETE FROM public.chat_conversations
        WHERE id = :conversationId AND user_id = :userId
        RETURNING id`,
      { replacements: { conversationId, userId }, type: QueryTypes.SELECT }
    );
    if (records.length === 0) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.status(204).end();
  } catch (error) {
    console.error("Failed to delete chat conversation:", error);
    res.status(500).json({ error: "Unable to delete conversation" });
  }
});

export default router;
