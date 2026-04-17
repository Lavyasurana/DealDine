import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const buildAuthLimiter = ({ windowMs, max, message, includeEmail = true }) =>
  rateLimit({
    windowMs,
    max,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      const ipKey = ipKeyGenerator(req.ip);
      if (!includeEmail) {
        return ipKey;
      }

      const emailKey = (req.body?.email || "unknown-email").trim().toLowerCase();
      return `${ipKey}:${emailKey}`;
    },
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

export const loginLimiter = buildAuthLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // only 5 attempts allowed
  message: "Too many login attempts. Try again later."
});

export const otpVerifyLimiter = buildAuthLimiter({
  windowMs: 10 * 60 * 1000,
  max: 6,
  message: "Too many OTP verification attempts. Try again later."
});

export const otpResendLimiter = buildAuthLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many OTP resend attempts. Try again later."
});

export const forgotPasswordLimiter = buildAuthLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many reset requests. Try again later."
});

export const resetPasswordLimiter = buildAuthLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  includeEmail: false,
  message: "Too many password reset attempts. Try again later."
});
