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
    updateUserCourseController
} from '../controllers/course.controller';

const router = express.Router();

router.get('/', getCoursesController);
router.get('/:id', getCourseController);
router.get('/title/:title', getCourseByTitleController);
router.post('/', addCourseController);
router.put('/', updateCourseController);

router.get('/user', getUserCoursesController);
router.get('/user/:id', getUserCourseController);
router.post('/user', addUserCourseController);
router.put('/user', updateUserCourseController);

export default router;