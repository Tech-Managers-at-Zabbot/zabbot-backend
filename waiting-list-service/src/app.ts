

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import waitingListRoutes from './routes/waitingListRoutes';
import helmet from "helmet";
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import path from 'path';

const app = express();

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    port: process.env.FOUNDERS_LIST_SERVICE_SERVER_PORT || 3002,
    // dbUrl: process.env.DB_URL,
    //   jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};


app.disable("x-powered-by");

//Other Middlewares
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


const PORT = config.port;


app.listen(PORT, () => {
  console.log(`Founders List Server running on port ${PORT}`);
});

export default app;