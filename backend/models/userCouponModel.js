import mongoose from "mongoose";
import crypto from "node:crypto";

const generateCouponCode = () => crypto.randomBytes(4).toString("hex").toUpperCase();

const userCouponSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal",
    required: true
  },

  couponCode: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
    default: generateCouponCode
  },

  isUsed: {
    type: Boolean,
    default: false
  },

  usedAt: {
    type: Date
  },

  issuedAt: {
    type: Date,
    default: Date.now
  }

});

userCouponSchema.index(
  { user: 1, deal: 1 },
  {
    unique: true,
    partialFilterExpression: { isUsed: false }
  }
);

const UserCoupon = mongoose.model("UserCoupon", userCouponSchema);

export default UserCoupon;
