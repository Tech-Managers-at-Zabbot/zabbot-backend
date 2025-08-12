// import express from "express";
// import comparePronounciation from "./routes/pronounciation.route";

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.json());

// // Routes
// app.use("/", comparePronounciation);

// app.listen(PORT, () => {
//   console.log(`🚀 Server is running at http://localhost:${PORT}`);
// });

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pronunciationFeedbackRoutes from "./routes/pronunciationFeedbackRoutes";
import helmet from "helmet";
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { errorUtilities } from "../../shared/utilities";

const app = express();

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: process.env.PRONUNCIATION_FEEDBACK_SERVICE_SERVER_PORT || 3004,
  // dbUrl: process.env.DB_URL,
  // jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET
};

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
app.use("/", pronunciationFeedbackRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    service: "pronunciation-feedback-service",
    status: "ok",
  });
});

// Error handling
app.use(errorUtilities.globalErrorHandler as any);

// Start server if not imported as a module
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(
      `Pronunciation Feedback Service Server running on port ${PORT}`
    );
  });
}

export default app;
