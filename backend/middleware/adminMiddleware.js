export const adminMiddleware = (req, res, next) => {
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }
    next();
  };

export const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Superadmin access only",
    });
  }

  next();
};
