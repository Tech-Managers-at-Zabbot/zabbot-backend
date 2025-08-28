import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorUtilities } from "../../shared/utilities";
import rootRouter from "./routes";
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";
import { inspect } from 'util';
import http from 'http';
import config from '../../config/config';

const app = express();

app.disable("x-powered-by");

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



if (require.main === module) {
  const PORT = config.PRONUNCIATION_SERVICE_PORT;
  server.listen(PORT, () => {
    console.log(`Pronunciation Server running on port ${PORT}`);
  });
}

export default app;
