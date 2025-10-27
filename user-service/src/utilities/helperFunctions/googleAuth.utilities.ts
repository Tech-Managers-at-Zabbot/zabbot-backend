import { Request } from "express";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  StrategyOptionsWithRequest,
  VerifyCallback,
} from "passport-google-oauth20";
import config from "../../../../config/config";

const setupGoogleRegisterStrategy = (
  verifyCallback: (
    request: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void,
  options?: Partial<StrategyOptionsWithRequest>
) => {
  const strategyOptions: StrategyOptionsWithRequest = {
    clientID: config?.GOOGLE_CLIENT_ID || "",
    clientSecret: config?.GOOGLE_CLIENT_SECRET || "",
    callbackURL: `${config?.GOOGLE_REGISTER_CALLBACK_URL}`,
    passReqToCallback: true,
    ...options,
  };

  passport.use(
    "google-register",
    new GoogleStrategy(strategyOptions, verifyCallback)
  );
};

const setupGoogleLoginStrategy = (
  verifyCallback: (
    request: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void,
  options?: Partial<StrategyOptionsWithRequest>
) => {
  const strategyOptions: StrategyOptionsWithRequest = {
    clientID: config?.GOOGLE_CLIENT_ID || "",
    clientSecret: config?.GOOGLE_CLIENT_SECRET || "",
    callbackURL: `${config?.GOOGLE_LOGIN_CALLBACK_URL}`,
    passReqToCallback: true,
    ...options,
  };

  passport.use(
    "google-login",
    new GoogleStrategy(strategyOptions, verifyCallback)
  );
};

export default {
  setupGoogleRegisterStrategy,
  setupGoogleLoginStrategy,
};
