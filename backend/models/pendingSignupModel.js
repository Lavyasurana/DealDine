import mongoose from "mongoose";

const pendingSignupSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  userId: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  offerCode: { type: String, trim: true, uppercase: true, default: null },
  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  otpLastSentAt: { type: Date, required: true },
  otpAttempts: { type: Number, default: 0 },
  verificationBlockedUntil: { type: Date, default: null },
}, {
  timestamps: true,
});

pendingSignupSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingSignup = mongoose.model("PendingSignup", pendingSignupSchema);

export default PendingSignup;
