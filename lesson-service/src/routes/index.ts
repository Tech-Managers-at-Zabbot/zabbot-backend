import express from 'express';
import lessonRouter from './lesson.route';
import languageRouter from './language.route';
import dailyWordRouter from './dailyWord.route';

const rootRouter = express.Router()

// rootRouter.use('/language', require('./language.route').default);
// rootRouter.use('/content', require('./content.route').default);

rootRouter.use('/lessons', lessonRouter);
rootRouter.use('/languages', languageRouter);
rootRouter.use('/daily-words', dailyWordRouter)

export default rootRouter;