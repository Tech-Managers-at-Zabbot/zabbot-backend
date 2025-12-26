import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import logger from "morgan";
import cookieParser from "cookie-parser";
import { errorUtilities } from "../../shared/utilities";
import config from "../../config/config";
import routes from "./routes";
import { paypalControllers, stripeControllers } from "./controllers";

const app = express();

app.disable("x-powered-by");

app.post(
  "/payment-services/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeControllers.stripeWebhookController
);

app.post(
  "/payment-services/paypal/webhook",
  express.json(),
  paypalControllers.paypalWebhookController
);

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/payment-services", routes);

// Health check endpoint
app.get("/", (req, res) => {
  res.send(
    "Payment Service is running. Please refer to the documentation for usage details."
  );
});

// Error handling
app.use(errorUtilities.globalErrorHandler as any);

// Start server if not imported as a module
if (require.main === module) {
  const PORT = config.PAYMENT_SERVICE_PORT;
  app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
  });
}

export default app;
