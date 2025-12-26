import paypal from "@paypal/checkout-server-sdk";
import config from "../../../config/config";

const environment = () => {
  const clientId = config.PAYPAL_CLIENT_ID!;
  const clientSecret = config.PAYPAL_CLIENT_SECRET!;

  if (config.NODE_ENV === "production") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

export const paypalClient = () => {
  return new paypal.core.PayPalHttpClient(environment());
};