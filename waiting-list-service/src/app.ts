import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import waitingListRoutes from './routes/waitingListRoutes';
import helmet from "helmet";
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import { connectDB } from './config/db';

const app = express();

dotenv.config()

// Set security HTTP headers to disable 'powered by Express' header feature
app.disable("x-powered-by");

//Other Middlewares
// Suggested order:
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(logger("dev")); // Logger after security but before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/', waitingListRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
      service: 'waiting-list-service',
      status: 'ok',
    });
  });

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;