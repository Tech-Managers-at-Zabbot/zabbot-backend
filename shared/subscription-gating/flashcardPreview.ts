import { Request, Response, NextFunction } from "express";
import { getUserEntitlement } from "./getUserEntitlement";

/**
 * A deliberately narrow exception for five curated STAGING flashcards.
 * Both the feature switch and the paid-content enforcement switch must be ON.
 * Exactly five distinct, valid database UUIDs must be configured. Never select
 * preview cards by array order or accept card IDs from the client as policy.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function configuredFlashcardPreviewIds(): string[] | null {
  if (process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE !== "true" ||
      process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_ENABLED !== "true") return null;

  const ids = (process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_IDS ?? "")
    .split(",").map(value => value.trim().toLowerCase()).filter(Boolean);

  if (ids.length !== 5 || new Set(ids).size !== 5 || !ids.every(id => UUID.test(id))) {
    return null; // Fail closed: missing/incomplete configuration never grants free access.
  }
  return ids;
}

export type FlashcardPreviewRequest = Request & { flashcardPreviewIds?: string[] };

/** Run after generalAuthFunction, only when subscription enforcement is ON. */
export async function requireFlashcardPremiumOrPreview(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const user = (request as Request & { user?: { userId?: string; role?: string } }).user;
  if (!user?.userId) {
    response.status(401).json({ status: "error", code: "LOGIN_REQUIRED" });
    return;
  }
  if (user.role === "admin") {
    next();
    return;
  }

  try {
    const entitlement = await getUserEntitlement(user.userId);
    if (entitlement.hasAccess) {
      next();
      return;
    }

    const previewIds = configuredFlashcardPreviewIds();
    if (!previewIds) {
      response.status(403).json({ status: "error", code: "SUBSCRIPTION_REQUIRED" });
      return;
    }

    // Enforce the same ID allowlist for direct GET /:id and bulk GET /.
    const requestedId = request.params.id;
    if (requestedId && !previewIds.includes(requestedId.toLowerCase())) {
      response.status(403).json({ status: "error", code: "SUBSCRIPTION_REQUIRED" });
      return;
    }

    (request as FlashcardPreviewRequest).flashcardPreviewIds = previewIds;
    next();
  } catch (error) {
    console.error("Flashcard entitlement check unavailable", error);
    response.status(503).json({ status: "error", code: "ENTITLEMENT_UNAVAILABLE" });
  }
}
