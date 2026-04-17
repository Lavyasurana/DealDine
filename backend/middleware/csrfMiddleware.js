import crypto from "node:crypto";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const isProduction = process.env.NODE_ENV === "production";

const getSharedCookieDomain = () => {
  if (!isProduction) {
    return undefined;
  }

  return ".dealdine.in";
};

const getCsrfCookieOptions = () => ({
  httpOnly: false,
  secure: isProduction,
  sameSite: "lax",
  domain: getSharedCookieDomain(),
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
});

export const setCsrfCookie = (res) => {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
  return token;
};

export const clearCsrfCookie = (res) => {
  res.clearCookie(CSRF_COOKIE_NAME, getCsrfCookieOptions());
};

export const csrfMiddleware = (req, res, next) => {
  if (!req.cookies?.access_token) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  next();
};
