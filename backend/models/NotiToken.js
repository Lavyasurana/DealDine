// models/Token.js
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String, // optional (if logged in)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const NotiTokenModel= mongoose.model("NotificationToken", tokenSchema);
export default NotiTokenModel