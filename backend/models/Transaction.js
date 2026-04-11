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
    enum: ['cashfree'],
    default: 'cashfree'
  },
  userCouponId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCoupon' },
  amount: { type: Number, required: true },
  originalAmount: { type: Number, required: true },
  creditsApplied: { type: Number, default: 0 },
  creditsSettled: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['created', 'pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
