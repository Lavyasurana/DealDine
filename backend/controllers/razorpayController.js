import Razorpay from 'razorpay'
import crypto from "node:crypto";

const getOrder=async(req,res)=> {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });
  
      const options = req.body;
      const order = await razorpay.orders.create(options);
  
      if (!order) {
        return res.status(500).send("Error");
      }
  
      res.json(order);
    } catch (err) {
      console.log(err);
      res.status(500).send("Error");
    }
  
}


const validateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sha = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_SECRET
    );

    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Transaction is not legit!",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

  } catch (error) {
    console.error("Validation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// controllers/paymentController.js

import userModel from "../models/userModel.js";
import dealModel from "../models/dealModel.js";
import UserCoupon from "../models/userCouponModel.js";

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

    // ❌ Check duplicate coupon (reuse your logic)
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

    // ✅ Create coupon (same as your flow)
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
export {validateOrder,getOrder}