import express from "express";
import {
  createCoupon,
  getMyCoupons,
  getCouponById,
  redeemCoupon,
  getAdminRedeemedCoupons,
  updateCouponBill
} from "../controllers/userCouponController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { csrfMiddleware } from "../middleware/csrfMiddleware.js";

const Couponrouter = express.Router();

Couponrouter.post("/create", authMiddleware, csrfMiddleware, createCoupon);
Couponrouter.get("/my", authMiddleware, getMyCoupons);
Couponrouter.get("/admin/redeemed", authMiddleware, getAdminRedeemedCoupons);
Couponrouter.get("/:couponId", authMiddleware, getCouponById);
Couponrouter.put("/redeem/:couponId", authMiddleware, csrfMiddleware, redeemCoupon);
Couponrouter.put("/bill/:couponId", authMiddleware, csrfMiddleware, updateCouponBill);

export default Couponrouter;
