"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authorization_middleware_1 = require("../../../shared/middleware/authorization.middleware");
const course_controller_1 = require("../controllers/course.controller");
const router = express_1.default.Router();
router.get('/:languageId', course_controller_1.getCoursesController);
router.get('/:id', course_controller_1.getCourseController);
router.get('/title/:title', course_controller_1.getCourseByTitleController);
router.post('/', authorization_middleware_1.generalAuthFunction, (0, authorization_middleware_1.rolePermit)(["admin"]), course_controller_1.addCourseController);
router.put('/:id', authorization_middleware_1.generalAuthFunction, (0, authorization_middleware_1.rolePermit)(["admin"]), course_controller_1.updateCourseController);
router.get('/users', authorization_middleware_1.generalAuthFunction, course_controller_1.getUserCoursesController);
router.get('/users/:id', authorization_middleware_1.generalAuthFunction, course_controller_1.getUserCourseController);
router.post('/:courseId/users/:userId', authorization_middleware_1.generalAuthFunction, course_controller_1.addUserCourseController);
router.put('/users/:id', authorization_middleware_1.generalAuthFunction, course_controller_1.updateUserCourseController);
router.delete('/users/:id', authorization_middleware_1.generalAuthFunction, course_controller_1.removeUserCourseController);
router.post('/course-with-lesson/:languageId', course_controller_1.createCourseWithLessonsController);
//generalAuthFunction, rolePermit(["admin"]),
exports.default = router;
