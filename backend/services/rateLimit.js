import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // only 5 attempts allowed
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const ipKey = ipKeyGenerator(req.ip);
    const emailKey = (req.body?.email || "unknown-email").trim().toLowerCase();

    return `${ipKey}:${emailKey}`;
  },
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
