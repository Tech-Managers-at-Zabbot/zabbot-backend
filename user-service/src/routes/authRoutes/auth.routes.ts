import joiValidations from "../../validations/joi/joi.validations";
import { emailAuthControllers, googleAuthControllers } from "../../controllers";
import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import config from "../../../../config/config";
import { generalAuthFunction } from "../../../../shared/middleware/authorization.middleware";
import Users from "../../../../shared/entities/user-service-entities/users/users.entities";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

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
router.post("/logout-session", generalAuthFunction, async (request: Request, response: Response) => {
  response.setHeader("Cache-Control", "no-store");
  const userId = (request as Request & { user?: { userId?: string } }).user?.userId;
  if (!userId) return response.status(401).json({ message: "Unauthorized" });
  await Users.update({ refreshToken: null }, { where: { id: userId } });
  return response.status(200).json({ message: "Logged out" });
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
