import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import waitingListRoutes from './routes/waitingListRoutes';
import helmet from "helmet";
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";
import { errorUtilities } from '../../shared/utilities';
import config from '../../config/config';

const app = express();

app.disable("x-powered-by");

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/', waitingListRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'founders-list-service',
    status: 'ok',
  });
});

// Error handling
app.use(errorUtilities.globalErrorHandler as any);

// Start server if not imported as a module
if (require.main === module) {
  const PORT = config.FOUNDERS_LIST_SERVICE_SERVER_PORT;
  app.listen(PORT, () => {
    console.log(`Founders List Server running on port ${PORT}`);
  });
}

export default app;