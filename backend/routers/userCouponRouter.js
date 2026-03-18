import express from "express";
import {
  createCoupon,
  getMyCoupons,
  getCouponById,
  redeemCoupon
} from "../controllers/userCouponController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const Couponrouter = express.Router();

Couponrouter.post("/create", authMiddleware, createCoupon);
Couponrouter.get("/my", authMiddleware, getMyCoupons);
Couponrouter.get("/:couponId", authMiddleware, getCouponById);
Couponrouter.put("/redeem/:couponId", authMiddleware,redeemCoupon);

export default Couponrouter;