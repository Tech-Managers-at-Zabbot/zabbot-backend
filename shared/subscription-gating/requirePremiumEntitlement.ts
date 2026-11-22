import { Request, Response, NextFunction } from "express";
import { getUserEntitlement } from "./getUserEntitlement";

/**
 * Phase 2 bulk premium-data guard.
 *
 * A bulk endpoint cannot safely grant a free-lesson exception because it may
 * include data from many paid lessons. Free content must use the explicitly
 * lesson-scoped endpoint and requireLessonEntitlement instead.
 *
 * Mount AFTER generalAuthFunction. This middleware is NOT wired outside a
 * default-off feature flag until the content route audit is complete.
 */
export async function requirePremiumEntitlement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = (req as Request & { user?: { userId?: string; role?: string } }).user;
    if (!user?.userId) {
      res.status(401).json({ status: "error", code: "LOGIN_REQUIRED" });
      return;
    }
    // Preserve authorized curriculum-management reads for ADMIN.
    if (user.role === "admin") {
      next();
      return;
    }
    const entitlement = await getUserEntitlement(user.userId);
    if (!entitlement.hasAccess) {
      res.status(403).json({ status: "error", code: "SUBSCRIPTION_REQUIRED" });
      return;
    }
    next();
  } catch (error) {
    console.error("Premium entitlement check unavailable", error);
    res.status(503).json({ status: "error", code: "ENTITLEMENT_UNAVAILABLE" });
  }
}
