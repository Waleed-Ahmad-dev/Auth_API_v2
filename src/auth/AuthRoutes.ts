import { Request, Response, Router } from "express";
import {
     confirmEmail,
     login,
     logout,
     refreshToken,
     requestPasswordReset,
     resetPassword,
     signUp,
} from "./AuthController";
import { handleValidationErrors } from "../validators/validateErrors"; // Middleware to handle validation errors
import { validateUserSignUp, validateUserLogin } from "../validators/userValidators"; // Centralized validators
import { validateToken } from "../validators/validate";
import "../config/passport";
import authRateLimiter, { loginRateLimiter, passwordResetRateLimiter } from "../middleware/rateLimiter";
import passport from "passport";

const AuthRouter = Router();

AuthRouter.use(authRateLimiter);

AuthRouter.post("/sign-up", [...validateUserSignUp, handleValidationErrors], signUp);
AuthRouter.post("/login", loginRateLimiter, [...validateUserLogin, handleValidationErrors], login);

AuthRouter.post("/request-password-reset", passwordResetRateLimiter, requestPasswordReset);
AuthRouter.post("/reset-password", resetPassword);

AuthRouter.get("/confirm-email", confirmEmail);

// Google OAuth
AuthRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
AuthRouter.get(
     "/google/callback",
     passport.authenticate("google", { failureRedirect: "/login" }),
     (req: Request, res: Response) => {
          res.redirect("/"); // Redirect after successful login
     }
);

// GitHub OAuth
AuthRouter.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
AuthRouter.get(
     "/github/callback",
     passport.authenticate("github", { failureRedirect: "/login" }),
     (req: Request, res: Response) => {
          res.redirect("/");
     }
);

AuthRouter.post("/logout", validateToken, logout);
AuthRouter.post("/refresh-token", refreshToken);

export default AuthRouter;
