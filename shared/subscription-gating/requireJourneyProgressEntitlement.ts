import { Request, Response, NextFunction } from "express";
import Courses from "../entities/lesson-service-entities/course/course";
import Lessons from "../entities/lesson-service-entities/lesson/lesson";
import { FREE_PREVIEW_JOURNEY_ID, FREE_PREVIEW_LESSON_ID } from "./freePreview";
import { getUserEntitlement } from "./getUserEntitlement";

/**
 * Guard Journey progress writes. Existing frontend treats a lesson-completion
 * update as a Journey-progress write; the free preview must keep that flow.
 * Verify the actual lesson belongs to the requested ADMIN-active Journey.
 */
export async function requireJourneyProgressEntitlement(
  req: Request, res: Response, next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId;
    if (!userId) {
      res.status(401).json({ code: "LOGIN_REQUIRED" }); return;
    }
    const courseId = req.params.courseId;
    const lessonId = req.body?.lastLessonId;
    if (typeof courseId !== "string" || typeof lessonId !== "string") {
      res.status(400).json({ code: "LESSON_ID_REQUIRED" }); return;
    }
    const [course, lesson] = await Promise.all([
      Courses.findByPk(courseId, { raw: true }),
      Lessons.findByPk(lessonId, { raw: true }),
    ]);
    if (!course || !lesson || lesson.courseId !== courseId) {
      res.status(404).json({ code: "CURRICULUM_NOT_FOUND" }); return;
    }
    if (course.isActive !== true || lesson.isActive !== true) {
      res.status(403).json({ code: "CURRICULUM_UNAVAILABLE" }); return;
    }
    if (courseId === FREE_PREVIEW_JOURNEY_ID && lessonId === FREE_PREVIEW_LESSON_ID) {
      next(); return;
    }
    const entitlement = await getUserEntitlement(userId);
    if (!entitlement.hasAccess) {
      res.status(403).json({ code: "SUBSCRIPTION_REQUIRED" }); return;
    }
    next();
  } catch {
    res.status(503).json({ code: "ENTITLEMENT_UNAVAILABLE" });
  }
}
