// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  transactionId: { type: String, unique: true, sparse: true },
  gatewayOrderId: { type: String, unique: true, sparse: true },
  gatewayPaymentId: { type: String, sparse: true },
  provider: {
    type: String,
    enum: ['manual_upi', 'cashfree'],
    default: 'manual_upi'
  },
  userCouponId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCoupon' },
  amount: { type: Number, required: true },
  screenshotUrl: { type: String }, // Cloudinary link
  status: { 
    type: String, 
    enum: ['created', 'pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  verifiedByBank: { type: Boolean, default: false }, // Becomes true when SMS hits
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
