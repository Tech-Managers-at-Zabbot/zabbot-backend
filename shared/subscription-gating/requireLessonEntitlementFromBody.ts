import { Request, Response, NextFunction } from "express";
import { requireLessonEntitlement } from "./requireLessonEntitlement";

/**
 * Reuse the same ADMIN-first lesson authorization for progress mutations.
 * Mutating req.params is confined to this middleware's authenticated route.
 * The authenticated user ID is always resolved by generalAuthFunction.
 */
export function requireLessonEntitlementFromBody(
  req: Request, res: Response, next: NextFunction,
): Promise<void> {
  const lessonId = req.body?.lessonId;
  if (typeof lessonId !== "string") {
    res.status(400).json({ status: "error", code: "LESSON_ID_REQUIRED" });
    return Promise.resolve();
  }
  req.params.lessonId = lessonId;
  return requireLessonEntitlement(req, res, next);
}
