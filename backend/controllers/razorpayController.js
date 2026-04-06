import Razorpay from "razorpay";
import crypto from "node:crypto";
import userModel from "../models/userModel.js";
import dealModel from "../models/dealModel.js";
import UserCoupon from "../models/userCouponModel.js";

const hasReachedClaimLimit = async (dealId, maxRedemptions) => {
  const totalClaims = await UserCoupon.countDocuments({ deal: dealId });
  return totalClaims >= maxRedemptions;
};

// ================= CREATE ORDER =================
export const getOrder = async (req, res) => {
  try {
    
    const { amount, currency, receipt} = req.body;
   

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount,
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Order creation failed",
      });
    }

    return res.json(order);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= VALIDATE + CREATE COUPON =================
export const validateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dealId,
    } = req.body;

    const userId = req.user.id;
  
    

    // 🔐 Verify payment signature
    const sha = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_SECRET
    );

    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }
      // 🔍 Check deal exists
      const deal = await dealModel.findById(dealId);
      if (!deal) {
        return res.json({
          success: false,
          message: "Deal not found",
        });
      }

      if (await hasReachedClaimLimit(dealId, deal.maxRedemptions)) {
        return res.json({
          success: false,
          message: "This deal is no longer available",
        });
      }
  
      // 🚫 Prevent duplicate coupon
      const existing = await UserCoupon.findOne({
        user: userId,
        deal: dealId,
        isUsed: false,
      });
  
      if (existing) {
        return res.json({
          success: false,
          message: "You already own this coupon",
        });
      }

    

    // ✅ Create coupon
    const coupon = await UserCoupon.create({
      user: userId,
      deal: dealId,
    });

    await coupon.populate("deal");

    return res.json({
      success: true,
      message: "Payment successful & coupon created 🎉",
      coupon,
    });

  } catch (error) {
    console.error("Validation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ================= PAY WITH CREDITS =================
export const payWithCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dealId } = req.body;

    const user = await userModel.findById(userId);
    const deal = await dealModel.findById(dealId);

    if (!user || !deal) {
      return res.json({
        success: false,
        message: "Invalid user or deal",
      });
    }

    if (await hasReachedClaimLimit(dealId, deal.maxRedemptions)) {
      return res.json({
        success: false,
        message: "This deal is no longer available",
      });
    }

    // 🚫 Duplicate check
    const existing = await UserCoupon.findOne({
      user: userId,
      deal: dealId,
      isUsed: false,
    });

    if (existing) {
      return res.json({
        success: false,
        message: "You already own this coupon",
      });
    }

    // ❌ Not enough credits
    if (user.credits < deal.price) {
      return res.json({
        success: false,
        message: "Not enough credits",
      });
    }

    // ✅ Deduct credits
    user.credits -= deal.price;
    await user.save();

    // ✅ Create coupon
    const coupon = await UserCoupon.create({
      user: userId,
      deal: dealId,
    });

    await coupon.populate("deal");

    return res.json({
      success: true,
      message: "Deal unlocked using credits 🎉",
      coupon,
      remainingCredits: user.credits,
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server error",
    });
  }
};
