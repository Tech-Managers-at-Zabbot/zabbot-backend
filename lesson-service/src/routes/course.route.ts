import express from 'express';

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
    removeUserCourseController
} from '../controllers/course.controller';

const router = express.Router();

router.get('/', getCoursesController);
router.get('/:id', getCourseController);
router.get('/title/:title', getCourseByTitleController);
router.post('/', addCourseController);
router.put('/:id', updateCourseController);

router.get('/users', getUserCoursesController);
router.get('/users/:id', getUserCourseController);
router.post('/:courseId/users/:userId', addUserCourseController);
router.put('/users/:id', updateUserCourseController);
router.delete('/users/:id', removeUserCourseController);

export default router;