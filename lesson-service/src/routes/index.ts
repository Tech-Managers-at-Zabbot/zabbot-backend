import express from 'express';
import lessonRouter from './lesson.route';
import languageRouter from './language.route';

const rootRouter = express.Router()

// rootRouter.use('/language', require('./language.route').default);
// rootRouter.use('/content', require('./content.route').default);

rootRouter.use('/lesson', lessonRouter);
rootRouter.use('/language', languageRouter);

export default rootRouter;