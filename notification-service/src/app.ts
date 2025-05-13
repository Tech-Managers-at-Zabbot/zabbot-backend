import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { errorUtilities } from '../../shared/utilities';
import rootRouter from './routes';
const app = express();

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.NOTIFICATION_SERVICE_PORT || 3003,
  // dbUrl: process.env.DB_URL,
  // jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

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
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Notification Server running on port ${PORT}`);
  });
}

export default app;