import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "morgan";
import cookieParser from "cookie-parser";
import apiRouter from "./routes";
import { createServer } from "http";
import { errorUtilities } from './utilities';
import path from "path";
// import './models/associations';
import config from '../../config/config';

const app = express();

const server = createServer(app);

export const externalConfig = {
  PORT: config.EDEDUN_PORT || 3006,
  // dbUrl: process.env.DB_URL,
  // jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};

// Set security HTTP headers to disable 'powered by Express' header feature
app.disable("x-powered-by");

// Set security HTTP headers
app.use(helmet());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Compress response to increase speed
app.use(compression());

// Set Cors
app.use(cors());

//Other Middlewares
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/", apiRouter);


// Health Check Endpoint
app.get("/", (request: Request, response: Response) => {
  response.send("Welcome to Èdèdún APYP's Backend Server. 👋");
});


// Error handler
app.use(errorUtilities.globalErrorHandler);

/**
 * Server
 */
server.listen(externalConfig.PORT, () => {
  console.log(`Èdèdún server running on Port ${externalConfig.PORT}`);
});

export default app;
