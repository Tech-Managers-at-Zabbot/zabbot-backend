import express from 'express';
import lessonRouter from './lesson.route';
import languageRouter from './language.route';
import dailyWordRouter from './dailyWord.route';
import contentRouter from './content.route';
import goalRouter from './dailyGoal.route';

const rootRouter = express.Router()

rootRouter.use('/lessons', lessonRouter);
rootRouter.use('/languages', languageRouter);
rootRouter.use('/daily-words', dailyWordRouter)
rootRouter.use('/contents', contentRouter);
rootRouter.use('/goals', goalRouter)

export default rootRouter;