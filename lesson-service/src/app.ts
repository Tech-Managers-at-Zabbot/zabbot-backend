import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { errorUtilities } from '../../shared/utilities';
import rootRouter from './routes';
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.LESSON_SERVICE_PORT || 3005,
  // dbUrl: process.env.DB_URL,
  // jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};

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
app.use('/', rootRouter);


app.get('/check-status', (req, res) => {
  res.json({
    service: 'Lesson Server',
    status: 'ok',
  });
});


// Error handling
app.use(errorUtilities.globalErrorHandler as any);

// Start server if not imported as a module
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Lesson Server running on port ${PORT}`);
  });
}

export default app;