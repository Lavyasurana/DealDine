import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const cookieToken = req.cookies?.access_token;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded.tokenType !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = decoded;   // attach user data to request
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};