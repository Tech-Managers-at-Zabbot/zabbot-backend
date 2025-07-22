import express from 'express';
import lessonRouter from './lesson.route';
import languageRouter from './language.route';
import contentRouter from './content.route';

const rootRouter = express.Router()

// rootRouter.use('/language', require('./language.route').default);
// rootRouter.use('/content', require('./content.route').default);

rootRouter.use('/lessons', lessonRouter);
rootRouter.use('/languages', languageRouter);
rootRouter.use('/contents', contentRouter);

export default rootRouter;