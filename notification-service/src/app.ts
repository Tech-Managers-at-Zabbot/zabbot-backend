import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorUtilities } from '../../shared/utilities';
import rootRouter from './routes';
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";
import config from '../../config/config';

const app = express();

app.disable("x-powered-by");

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(logger("dev"));
app.use(cookieParser());

// Routes
app.use('/notification', rootRouter)




app.get('/', (req, res) => {
  res.json({
    service: 'Notification Server',
    status: 'ok',
  });
});

// Error handling
app.use(errorUtilities.globalErrorHandler as any);

// Start server if not imported as a module
if (require.main === module) {
  const PORT = config.NOTIFICATION_SERVICE_PORT;
  app.listen(PORT, () => {
    console.log(`Notification Server running on port ${PORT}`);
  });
}

export default app;