import joiValidations from "../../validations/joi/joi.validations";
import { emailAuthControllers, googleAuthControllers } from "../../controllers";
import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import config from "../../../../config/config";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";
import Users from "../../../../shared/entities/user-service-entities/users/users.entities";
import jwt from "jsonwebtoken";
import { randomUUID, createHash, timingSafeEqual } from "crypto";

const router = express.Router();

/**
 * Refresh only with a separately presented refresh credential.
 * Access JWTs, including expired ones, are never accepted as refresh proof.
 */
router.post("/refresh-session", async (request: Request, response: Response) => {
  response.setHeader("Cache-Control", "no-store");
  const refreshToken = request.body?.refreshToken;
  if (typeof refreshToken !== "string" || refreshToken.length > 4096) {
    return response.status(401).json({ message: "Refresh token required" });
  }

  try {
    const claims = jwt.verify(refreshToken, String(config.APP_JWT_SECRET), {
      algorithms: ["HS256"],
    });
    if (typeof claims === "string" || typeof claims.userId !== "string") {
      return response.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await Users.findByPk(claims.userId, {
      attributes: ["id", "email", "role", "refreshToken", "isActive", "isBlocked", "isVerified"],
    });
    if (!user || !user.isActive || user.isBlocked || !user.isVerified ||
        user.refreshToken !== refreshToken) {
      return response.status(401).json({ message: "Session expired. Please log in again" });
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, String(config.APP_JWT_SECRET), {
      expiresIn: claims.stayLoggedIn ? "30d" : "2h",
      algorithm: "HS256",
    });
    // Add a unique ID so every rotation invalidates the previous token.
    const nextRefreshToken = jwt.sign(
      { ...payload, stayLoggedIn: claims.stayLoggedIn === true, jti: randomUUID() },
      String(config.APP_JWT_SECRET),
      { expiresIn: claims.stayLoggedIn ? "60d" : "30d", algorithm: "HS256" },
    );
    const [updated] = await Users.update(
      { refreshToken: nextRefreshToken },
      { where: { id: user.id, refreshToken } },
    );
    if (updated !== 1) {
      return response.status(401).json({ message: "Session already rotated. Please log in again" });
    }

    return response.status(200).json({
      token: accessToken,
      refreshToken: nextRefreshToken,
    });
  } catch {
    return response.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

/** Revoke the current session when the user signs out. */
router.post("/logout-session", async (request: Request, response: Response) => {
  response.setHeader("Cache-Control", "no-store");
  const refreshToken = request.body?.refreshToken;
  if (typeof refreshToken !== "string" || refreshToken.length > 4096) {
    return response.status(401).json({ message: "Refresh token required" });
  }
  try {
    const claims = jwt.verify(refreshToken, String(config.APP_JWT_SECRET), {
      algorithms: ["HS256"],
    });
    if (typeof claims === "string" || typeof claims.userId !== "string") {
      return response.status(401).json({ message: "Invalid session" });
    }
    const [count] = await Users.update({ refreshToken: null }, {
      where: { id: claims.userId, refreshToken },
    });
    if (count !== 1) return response.status(401).json({ message: "Session already ended" });
    return response.status(200).json({ message: "Logged out" });
  } catch {
    return response.status(401).json({ message: "Invalid or expired session" });
  }
});

router.post(
  "/signup",
  joiValidations.inputValidator(joiValidations.userRegisterSchemaViaEmail),
  emailAuthControllers.userRegistrationController
);
router.post("/verify-user", emailAuthControllers.verifyUserAccountController);
router.post(
  "/resend-verification-otp",
  emailAuthControllers.resendVerificationOtpController
);
router.post(
  "/login",
  joiValidations.inputValidator(joiValidations.loginUserSchema),
  emailAuthControllers.userLoginController
);
router.post(
  "/reset-password-request",
  joiValidations.inputValidator(joiValidations.resendVerificationLinkSchema),
  emailAuthControllers.userPasswordResetRequestController
);
router.post(
  "/reset-password",
  joiValidations.inputValidator(joiValidations.resetPasswordSchema),
  emailAuthControllers.userResetPasswordController
);
router.post(
  "/change-password",
  joiValidations.inputValidator(joiValidations.changePasswordSchema),
  generalAuthFunction,
  emailAuthControllers.changeUserPasswordController
);

router.patch(
  "/update-user-names",
  joiValidations.inputValidator(joiValidations.updateUserNameSchema),
  generalAuthFunction,
  emailAuthControllers.updateUserNamesController
);

router.get(
  "/single-user",
  generalAuthFunction,
  emailAuthControllers.getSingleUserDetailsController
);

/**
 * Exchanges a Google OAuth one-time code for an authenticated session.
 * Codes are hashed at rest and expire after 60 seconds. Reuse is rejected.
 */
router.post("/google/exchange", async (request: Request, response: Response) => {
  response.setHeader("Cache-Control", "no-store");
  const code = request.body?.code;
  if (typeof code !== "string" || code.length > 160) {
    return response.status(401).json({ message: "Invalid exchange code" });
  }
  const segments = code.split(".");
  if (segments.length !== 2 ||
      !/^[0-9a-fA-F-]{36}$/.test(segments[0]) ||
      !/^[0-9a-f]{64}$/.test(segments[1])) {
    return response.status(401).json({ message: "Invalid exchange code" });
  }
  const user = await Users.findByPk(segments[0]);
  const stored = user?.accessToken?.split(":");
  if (!user || !user.isActive || user.isBlocked || !user.isVerified ||
      !user.refreshToken || stored?.length !== 2 ||
      !/^\d+$/.test(stored[1]) || Number(stored[1]) <= Date.now()) {
    return response.status(401).json({ message: "Exchange code expired or invalid" });
  }
  const expectedHash = Buffer.from(stored[0], "hex");
  const presentedHash = createHash("sha256").update(code).digest();
  if (expectedHash.length !== presentedHash.length ||
      !timingSafeEqual(expectedHash, presentedHash)) {
    return response.status(401).json({ message: "Invalid exchange code" });
  }
  // Atomic use-once redemption.
  const [redeemed] = await Users.update(
    { accessToken: null },
    { where: { id: user.id, accessToken: user.accessToken } },
  );
  if (redeemed !== 1) return response.status(401).json({ message: "Exchange code already used" });

  const jwtPayload = { userId: user.id, email: user.email, role: user.role };
  const token = jwt.sign(jwtPayload, String(config.APP_JWT_SECRET), {
    expiresIn: "2h", algorithm: "HS256",
  });
  return response.json({
    token,
    refreshToken: user.refreshToken,
    user: {
      id: user.id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, role: user.role, profilePicture: user.profilePicture,
      isVerified: user.isVerified, isFirstTimeLogin: user.isFirstTimeLogin,
      languageId: config.YORUBA_LANGUAGE_ID,
    },
  });
});

// Google Registration Route
router.get(
  "/google/register",
  (request: Request, response: Response, next: NextFunction) => {
    const timezone = `${request.query.timezone}`;
    passport.authenticate("google-register", {
      scope: ["profile", "email"],
      session: false,
      passReqToCallback: true,
      state: timezone,
    })(request, response, next);
  }
);

// Google Login Route
router.get(
  "/google/login",
  (request: Request, response: Response, next: NextFunction) => {
    const timezone = `${request.query.timezone}`;
    passport.authenticate("google-login", {
      scope: ["profile", "email"],
      session: false,
      passReqToCallback: true,
      state: timezone,
    })(request, response, next);
  }
);

// Google Registration Callback
router.get(
  "/google/register/callback",
  (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate("google-register", {
      session: false,
    })(request, response, (error: any) => {
      if (error) {
        return response.redirect(
          `${config.GOOGLE_AUTH_FAILURE_URL}?error=${error.message}`
        );
      }

      if (!request.user) {
        return response.redirect(
          `${config.GOOGLE_AUTH_FAILURE_URL}?error=registration_failed`
        );
      }

      return googleAuthControllers.googleAuthRegistrationCallbackController(
        request,
        response,
        next
      );
    });
  }
);

// Google Login Callback
router.get(
  "/google/login/callback",
  (request: Request, response: Response, next: NextFunction) => {
    passport.authenticate("google-login", {
      session: false,
    })(request, response, (error: any) => {
      if (error) {
        return response.redirect(
          `${config.GOOGLE_AUTH_FAILURE_URL}?error=${error.message}`
        );
      }

      if (!request.user) {
        return response.redirect(
          `${config.GOOGLE_AUTH_FAILURE_URL}?error=login_failed`
        );
      }

      return googleAuthControllers.googleAuthLoginCallbackController(
        request,
        response,
        next
      );
    });
  }
);

router.get("/google/failure", googleAuthControllers.googleAuthFailure);

export default router;
