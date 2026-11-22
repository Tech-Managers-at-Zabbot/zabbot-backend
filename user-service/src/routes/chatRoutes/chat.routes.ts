import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
import { QueryTypes } from "sequelize";
import { yorubaSystemPrompt } from "./yorubaPrompt";
import { lessonPracticeChat } from "./lessonPracticeChat";
import { users_service_db } from "../../../../config/databases";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";
import { requirePremiumEntitlement } from "../../../../shared/subscription-gating/requirePremiumEntitlement";

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
// Creation and AI generation are premium actions. History/usage reads remain
// available to let users view existing conversations after expiry.
// Never enable globally until all Phase 2 API paths and UI have been tested.
const enforceChat = process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE === "true";

// Dedicated lesson practice uses DB-verified content context and the same quota.
if (enforceChat) router.post("/lesson-practice", lessonPracticeChat);

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


const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// Create an empty conversation owned by the verified subscriber.
router.post("/conversations", ...(enforceChat ? [requirePremiumEntitlement] : []), async (req: Request, res: Response): Promise<void> => {
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
        ORDER BY created_at ASC,
                 CASE WHEN role = 'user' THEN 0 ELSE 1 END ASC,
                 id ASC
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

// The only billable chat path: verify ownership, atomically reserve quota,
// call OpenAI from the server, persist the exchange, or refund failed attempts.
// Never let the browser claim or refund usage independently.
router.post("/conversations/:conversationId/send", ...(enforceChat ? [requirePremiumEntitlement] : []), async (req: Request, res: Response): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const conversationId = req.params.conversationId;
  const message: unknown = req.body?.message;
  if (!isUuid(conversationId) || typeof message !== "string" ||
      message.trim().length === 0 || message.length > 4000) {
    res.status(400).json({ error: "Valid conversation ID and a message of at most 4000 characters are required" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({ error: "Chat service is not configured" });
    return;
  }

  let reservedDate: string | null = null;
  let completed = false;
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

    // A single PostgreSQL upsert serializes concurrent claims via row locking.
    // The limit check occurs inside the update, not in a separate SELECT.
    const reservation = await users_service_db.query<{
      usage_date: string;
      used_count: number;
    }>(
      `INSERT INTO public.chat_daily_usage
         (user_id, usage_date, used_count, created_at, updated_at)
       VALUES (:userId, (NOW() AT TIME ZONE 'UTC')::date, 1, NOW(), NOW())
       ON CONFLICT (user_id, usage_date) DO UPDATE
          SET used_count = chat_daily_usage.used_count + 1,
              updated_at = NOW()
        WHERE chat_daily_usage.used_count < :dailyLimit
       RETURNING usage_date::text AS usage_date, used_count`,
      {
        replacements: { userId, dailyLimit: DAILY_LIMIT },
        type: QueryTypes.SELECT,
      }
    );

    if (!reservation.length) {
      res.status(429).json({
        error: "Daily chat limit reached",
        used: DAILY_LIMIT,
        remaining: 0,
        limit: DAILY_LIMIT,
        resetTimezone: "UTC",
      });
      return;
    }
    reservedDate = reservation[0].usage_date;

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: yorubaSystemPrompt },
          { role: "user", content: message.trim() },
        ],
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!upstream.ok) {
      console.error("Chat provider request failed:", upstream.status);
      throw new Error("Chat provider unavailable");
    }
    const responseData: any = await upstream.json();
    const reply = responseData?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error("Chat provider returned an empty reply");
    }

    await users_service_db.transaction(async (transaction) => {
      // Ownership is checked again inside the write, including cases where a
      // conversation was deleted while OpenAI was responding.
      const ownedForWrite = await users_service_db.query<{ id: string }>(
        `SELECT id FROM public.chat_conversations
          WHERE id = :conversationId AND user_id = :userId FOR UPDATE`,
        {
          replacements: { conversationId, userId },
          type: QueryTypes.SELECT,
          transaction,
        }
      );
      if (ownedForWrite.length === 0) {
        throw new Error("Conversation was deleted while sending");
      }

      await users_service_db.query(
        `INSERT INTO public.chat_messages (id, conversation_id, role, content)
         VALUES (:userMessageId, :conversationId, 'user', :message),
                (:assistantMessageId, :conversationId, 'assistant', :reply)`,
        {
          replacements: {
            userMessageId: randomUUID(),
            assistantMessageId: randomUUID(),
            conversationId,
            message: message.trim(),
            reply,
          },
          transaction,
        }
      );
      await users_service_db.query(
        `UPDATE public.chat_conversations SET updated_at = NOW()
          WHERE id = :conversationId AND user_id = :userId`,
        { replacements: { conversationId, userId }, transaction }
      );
    });

    completed = true;
    const used = Number(reservation[0].used_count);
    res.setHeader("Cache-Control", "no-store");
    res.json({
      reply,
      used,
      remaining: Math.max(0, DAILY_LIMIT - used),
      limit: DAILY_LIMIT,
      resetTimezone: "UTC",
    });
  } catch (error) {
    console.error("Failed to send chat message:", error);
    res.status(502).json({ error: "Unable to complete chat message. Please try again." });
  } finally {
    // Use the date from the reservation so a request crossing midnight does
    // not accidentally refund a different day's allowance.
    if (reservedDate && !completed) {
      try {
        await users_service_db.query(
          `UPDATE public.chat_daily_usage
              SET used_count = GREATEST(0, used_count - 1),
                  updated_at = NOW()
            WHERE user_id = :userId AND usage_date = CAST(:reservedDate AS date)`,
          { replacements: { userId, reservedDate } }
        );
      } catch (refundError) {
        console.error("Failed to refund incomplete chat request:", refundError);
      }
    }
  }
});

export default router;
