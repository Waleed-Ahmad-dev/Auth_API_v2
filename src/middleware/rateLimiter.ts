import rateLimit from "express-rate-limit";

// General API Rate Limiter
export const apiRateLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // 100 requests per windowMs
     message: {
          message: "Too many requests from this IP, please try again later.",
     },
     standardHeaders: true, // Send rate limit info in `RateLimit-*` headers
     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Login Rate Limiter
export const loginRateLimiter = rateLimit({
     windowMs: 10 * 60 * 1000, // 10 minutes
     max: 5, // Limit each IP to 5 login attempts per windowMs
     message: {
          message: "Too many login attempts. Please try again later.",
     },
     standardHeaders: true,
     legacyHeaders: false,
});

// Password Reset Rate Limiter
export const passwordResetRateLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 3, // Limit each IP to 3 password reset requests
     message: {
          message: "Too many password reset requests. Please try again after 15 minutes.",
     },
     standardHeaders: true,
     legacyHeaders: false,
});

export default apiRateLimiter;
