import express from 'express';
import { generalAuthFunction, rolePermit } from '../../../shared/middleware/authorization.middleware';

import {
    getCoursesController,
    getCourseController,
    getCourseByTitleController,
    addCourseController,
    updateCourseController,
    getUserCoursesController,
    getUserCourseController,
    addUserCourseController,
    updateUserCourseController,
    removeUserCourseController,
    createCourseWithLessonsController
} from '../controllers/course.controller';

const router = express.Router();

router.get('/:languageId', getCoursesController);
router.get('/:id', getCourseController);
router.get('/title/:title', getCourseByTitleController);
router.post('/', generalAuthFunction, rolePermit(["admin"]), addCourseController);
router.put('/:id', generalAuthFunction, rolePermit(["admin"]), updateCourseController);

router.get('/users', generalAuthFunction, getUserCoursesController);
router.get('/users/:id', generalAuthFunction, getUserCourseController);
router.post('/:courseId/users/:userId', generalAuthFunction, addUserCourseController);
router.put('/users/:id', generalAuthFunction, updateUserCourseController);
router.delete('/users/:id', generalAuthFunction, removeUserCourseController);
router.post('/course-with-lesson/:languageId', generalAuthFunction, rolePermit(["admin"]), createCourseWithLessonsController)

export default router;