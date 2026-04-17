import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCoupon",
      required: true,
      unique: true,
    },
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
    billAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
