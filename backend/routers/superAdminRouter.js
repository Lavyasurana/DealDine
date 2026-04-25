import express from "express";
import {
  loginSuperAdmin,
  getCurrentSuperAdmin,
  logoutSuperAdmin,
  createAdminBySuperAdmin,
  addCreditsToUser,
  getRestaurantBillsForSuperAdmin,
} from "../controllers/superAdminController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { adminMiddleware, superAdminMiddleware } from "../middleware/adminMiddleware.js";
import { csrfMiddleware } from "../middleware/csrfMiddleware.js";
import { loginLimiter } from "../services/rateLimit.js";

const superAdminRouter = express.Router();

superAdminRouter.post("/login", loginLimiter, loginSuperAdmin);
superAdminRouter.get(
  "/me",
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  getCurrentSuperAdmin
);
superAdminRouter.post(
  "/logout",
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  csrfMiddleware,
  logoutSuperAdmin
);
superAdminRouter.post(
  "/register-admin",
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  csrfMiddleware,
  createAdminBySuperAdmin
);
superAdminRouter.post(
  "/add-credits",
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  csrfMiddleware,
  addCreditsToUser
);
superAdminRouter.get(
  "/restaurant-bills",
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  getRestaurantBillsForSuperAdmin
);

export default superAdminRouter;
