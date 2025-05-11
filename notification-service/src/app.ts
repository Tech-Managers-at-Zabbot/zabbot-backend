// const { errorUtilities } = require('../../shared/utilities');

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import notificationRoutes from './routes/notification.routes';
// import { formatResponse } from './utils/response.util';
// import logger from './utils/logger';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Create and configure Express application
 */
  const app = express();

  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    port: process.env.NOTIFICATION_SERVICE_PORT || 3003,
    // dbUrl: process.env.DB_URL,
    //   jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

//   // Request logging middleware
//   app.use((req: Request, res: Response, next: NextFunction) => {
//     const startTime = Date.now();
    
//     res.on('finish', () => {
//       const duration = Date.now() - startTime;
//       const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
      
//       logger[logLevel]({
//         method: req.method,
//         url: req.originalUrl,
//         status: res.statusCode,
//         duration,
//         ip: req.ip,
//         userAgent: req.headers['user-agent']
//       }, 'Request completed');
//     });
    
//     next();
//   });

//   // Routes
//   app.use('/api/notifications', notificationRoutes);

//   // Root route
//   app.get('/', (req: Request, res: Response) => {
//     return formatResponse(res, 200, {
//       success: true,
//       message: 'Notification Service API',
//       data: {
//         version: '1.0.0',
//         endpoints: {
//           health: '/api/notifications/health',
//           sendEmail: '/api/notifications/email'
//         }
//       }
//     });
//   });

//   // 404 handler
//   app.use((req: Request, res: Response) => {
//     return formatResponse(res, 404, {
//       success: false,
//       message: `Route ${req.originalUrl} not found`
//     });
//   });

//   // Error handler
//   app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//     logger.error({ err, path: req.path }, 'Unhandled error');
    
//     return formatResponse(res, 500, {
//       success: false,
//       message: 'Internal server error',
//       errors: [err.message]
//     });
//   });


  // Health check endpoint
app.get('/', (req, res) => {
    res.json({
      service: 'Notification Server',
      status: 'ok',
    });
  });

  const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Notification Server running on port ${PORT}`);
});

export default app;