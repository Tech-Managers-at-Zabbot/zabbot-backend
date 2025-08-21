import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { errorUtilities } from "../../shared/utilities";
import rootRouter from "./routes";
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";
import { inspect } from 'util';
import http from 'http';

const app = express();

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: process.env.LESSON_SERVICE_PORT || 3007,
  serverTimeout: parseInt('300000'), // 5 minutes default
  requestTimeout: parseInt('240000'), // 4 minutes default
  keepAliveTimeout: parseInt('65000'), // 65 seconds default
};

app.disable("x-powered-by");


app.use((request: Request, response: Response, next: NextFunction) => {
  request.setTimeout(config.requestTimeout, () => {
    const error = new Error('Request timeout');
    (error as any).status = 408;
    next(error);
  });
  
  response.setTimeout(config.requestTimeout, () => {
    if (!response.headersSent) {
      response.status(408).json({ 
        error: 'Request timeout',
        message: 'The server took too long to respond'
      });
    }
  });
  
  next();
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(logger("dev"));
app.use(cookieParser());

// Routes
app.use("/", rootRouter);

app.get("/check-status", (req, res) => {
  res.json({
    service: "Pronunciation Server",
    status: "ok",
  });
});

const utilShim = {
  ...require('util'),
  isNullOrUndefined: (val: unknown) => val === null || val === undefined
};


if (!('isNullOrUndefined' in inspect)) {
  require('util').isNullOrUndefined = utilShim.isNullOrUndefined;
}


// Error handling
app.use(errorUtilities.globalErrorHandler as any);

const server = http.createServer(app);

server.timeout = config.serverTimeout;
server.keepAliveTimeout = config.keepAliveTimeout;
server.headersTimeout = config.keepAliveTimeout + 1000;

server.on('timeout', (socket) => {
  console.log('Server timeout occurred');
  socket.destroy();
});


if (require.main === module) {
  const PORT = config.port;
  server.listen(PORT, () => {
    console.log(`Pronunciation Server running on port ${PORT}`);
    console.log(`Timeout configuration:`, {
      server: config.serverTimeout,
      request: config.requestTimeout,
      keepAlive: config.keepAliveTimeout,
      headers: config.keepAliveTimeout + 1000
    });
  });
}

export default app;
