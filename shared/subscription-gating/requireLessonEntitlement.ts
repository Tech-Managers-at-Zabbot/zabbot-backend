import { Request, Response, NextFunction } from "express";
import Courses from "../entities/lesson-service-entities/course/course";
import Lessons from "../entities/lesson-service-entities/lesson/lesson";
import { getUserEntitlement } from "./getUserEntitlement";
import { isFreePreviewLesson } from "./freePreview";

/**
 * Middleware intended for authenticated lesson-detail requests.
 * Must be mounted AFTER generalAuthFunction.
 *
 * IMPORTANT: This does not cover other data paths (course lesson list, content
 * list, quiz, user progress, embedded AI) and MUST NOT be enabled as a
 * production access-control solution until those paths are guarded or
 * appropriately reduced to metadata. No route is wired to this middleware yet.
 */
export async function requireLessonEntitlement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const lessonId = req.params.lessonId;
    const user = (req as Request & { user?: { userId?: string; role?: string } }).user;
    const userId = user?.userId;
    if (!userId) {
      res.status(401).json({ status: "error", code: "LOGIN_REQUIRED" });
      return;
    }
    if (!lessonId) {
      res.status(400).json({ status: "error", code: "LESSON_ID_REQUIRED" });
      return;
    }

    const lesson = await Lessons.findByPk(lessonId, { raw: true });
    if (!lesson) {
      res.status(404).json({ status: "error", code: "LESSON_NOT_FOUND" });
      return;
    }
    const course = await Courses.findByPk(lesson.courseId, { raw: true });
    if (!course) {
      res.status(404).json({ status: "error", code: "JOURNEY_NOT_FOUND" });
      return;
    }

    // ADMIN controls always win, even over paid or free-preview access.
    if (course.isActive !== true || lesson.isActive !== true) {
      res.status(403).json({ status: "error", code: "CURRICULUM_UNAVAILABLE" });
      return;
    }

    // Administrators may inspect and test active curriculum without purchasing a plan.
    // Disabled lessons and Journeys remain unavailable to everyone.
    if (user?.role === "admin") {
      next();
      return;
    }

    // Explicitly allowlisted free lesson; never grant the whole parent Journey.
    if (isFreePreviewLesson(lesson.id)) {
      next();
      return;
    }

    const entitlement = await getUserEntitlement(userId);
    if (!entitlement.hasAccess) {
      res.status(403).json({ status: "error", code: "SUBSCRIPTION_REQUIRED" });
      return;
    }
    next();
  } catch (error) {
    // Do not turn a database/entitlement outage into a free access grant.
    console.error("Subscription lesson-access check failed", error);
    res.status(503).json({ status: "error", code: "ENTITLEMENT_UNAVAILABLE" });
  }
}
