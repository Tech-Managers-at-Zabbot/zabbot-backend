import { Request, Response, NextFunction } from "express";
import ContentFiles from "../entities/lesson-service-entities/contentFile/content-file";
import Contents from "../entities/lesson-service-entities/content/content";
import Lessons from "../entities/lesson-service-entities/lesson/lesson";
import Courses from "../entities/lesson-service-entities/course/course";
import { isFreePreviewLesson } from "./freePreview";
import { requirePremiumEntitlement } from "./requirePremiumEntitlement";

/**
 * Authorize a pronunciation feedback request using trusted database linkage.
 * The free-preview exception requires req.params.id to be an AUDIO
 * content_file belonging to the approved lesson and active parent Journey.
 * A client-provided isInLesson, audio URL, or content ID is NOT proof.
 *
 * Must follow generalAuthFunction. No route currently uses this middleware
 * without the default-off subscription gating flag.
 */
export async function requirePronunciationEntitlement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const referenceId = req.params.id;
    // Only a known audio belonging to the free lesson may bypass a paid gate.
    // Otherwise, the ordinary server-computed premium entitlement is required.
    if (typeof referenceId === "string" && req.body?.isInLesson === "true") {
      const audioFile = await ContentFiles.findByPk(referenceId, { raw: true });
      if (audioFile && audioFile.contentType === "audio") {
        const content = await Contents.findByPk(audioFile.contentId, { raw: true });
        if (content) {
          const lesson = await Lessons.findByPk(content.lessonId, { raw: true });
          const course = lesson
            ? await Courses.findByPk(lesson.courseId, { raw: true })
            : null;
          if (!lesson || !course || lesson.isActive !== true || course.isActive !== true) {
            res.status(403).json({ status: "error", code: "CURRICULUM_UNAVAILABLE" });
            return;
          }
          // Replace the untrusted client URL with the DB-owned reference.
          // The content file is the resource being authorized, never a
          // browser-supplied isInLessonUrl.
          req.body.isInLessonUrl = audioFile.filePath;
          req.body.isInLessonAudioId = audioFile.id;
          if (isFreePreviewLesson(lesson.id)) {
            next();
            return;
          }
          // Valid DB-linked premium lesson audio requires paid entitlement.
          // Reject arbitrary audio references, but do not reject legitimate
          // premium exercises simply because they are not the free preview.
          await requirePremiumEntitlement(req, res, next);
          return;
        }
      }
      // A claimed in-lesson exercise must have a real DB-linked audio file.
      // Paid access does not authorize choosing an arbitrary remote audio URL.
      res.status(400).json({ status: "error", code: "INVALID_LESSON_AUDIO" });
      return;
    }
    await requirePremiumEntitlement(req, res, next);
  } catch (error) {
    console.error("Pronunciation entitlement check failed", error);
    res.status(503).json({ status: "error", code: "ENTITLEMENT_UNAVAILABLE" });
  }
}
