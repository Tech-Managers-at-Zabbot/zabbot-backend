import express from 'express';
import { getLessonsController, getLessonController, createLessonController, updateLessonController, getLessonWithContentsController, getLanguageLessonsController, getCourseLessonsController, updateLessonImageController,} from '../controllers/lesson.controller';
import { generalAuthFunction, rolePermit } from '../../../shared/middleware/authorization.middleware';
import multer from 'multer';


const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/', getLessonsController);
router.get('/:id', getLessonController);
router.post('/', generalAuthFunction, rolePermit(["admin"]), createLessonController);
router.put('/:id', generalAuthFunction, rolePermit(["admin"]), updateLessonController);
router.get('/lesson-with-contents/:lessonId', generalAuthFunction, getLessonWithContentsController)
router.get('/language-lessons/:languageId', generalAuthFunction, getLanguageLessonsController);
router.get('/course-lessons/:courseId', generalAuthFunction, getCourseLessonsController);
router.put(
  "/change-lesson-image/:lessonId",
  upload.array('files', 50),
  generalAuthFunction,
  rolePermit(["admin"]),
  updateLessonImageController
);

export default router;