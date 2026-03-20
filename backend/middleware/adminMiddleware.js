export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
      console.log("not admin")
    }
    console.log("success admin")
    next();
  };