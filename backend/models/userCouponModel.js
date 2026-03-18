import mongoose from "mongoose";

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
    unique: true
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

const UserCoupon = mongoose.model("UserCoupon", userCouponSchema);

export default UserCoupon;