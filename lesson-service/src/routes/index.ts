import express from 'express';
import lessonRouter from './lesson.route';
import languageRouter from './language.route';
import dailyWordRouter from './dailyWord.route';
import contentRouter from './content.route';
import goalRouter from './dailyGoal.route';
import courseRouter from './course.route';
import quizRouter from './quiz.route';
import leaderboardRouter from './leaderboard.route';
import userLessonRouter from './userLesson.route';

const rootRouter = express.Router()

rootRouter.use('/lessons', lessonRouter);
rootRouter.use('/languages', languageRouter);
rootRouter.use('/daily-words', dailyWordRouter);
rootRouter.use('/contents', contentRouter);
rootRouter.use('/goals', goalRouter)
rootRouter.use('/courses', courseRouter);
rootRouter.use('/user-lessons', userLessonRouter);
rootRouter.use('/quizzes', quizRouter);
rootRouter.use('/leaderboard', leaderboardRouter)

export default rootRouter;
