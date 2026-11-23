import { Request, Response, NextFunction } from "express";
import Contents from "../entities/lesson-service-entities/content/content";
import { requireLessonEntitlement } from "./requireLessonEntitlement";

/**
 * Resolve a single content record to its parent lesson before authorizing.
 * Expects generalAuthFunction to have authenticated the requester first.
 * No user-provided lesson ID is trusted for this content lookup.
 *
 * Only safe for GET /contents/:id and similar single-content endpoints.
 * Never use for content lists or file IDs without their own ownership mapping.
 */
export async function requireContentEntitlement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const content = await Contents.findByPk(req.params.id, { raw: true });
    if (!content) {
      res.status(404).json({ status: "error", code: "CONTENT_NOT_FOUND" });
      return;
    }
    // Populate the trusted parent ID read from the DB, not the request body.
    req.params.lessonId = content.lessonId;
    await requireLessonEntitlement(req, res, next);
  } catch (error) {
    console.error("Subscription content-access check failed", error);
    res.status(503).json({ status: "error", code: "ENTITLEMENT_UNAVAILABLE" });
  }
}
