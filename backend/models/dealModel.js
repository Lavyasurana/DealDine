import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({

  resName: {
    type: String,
    required: true
  },

  dealName: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  price: {
    type: Number,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  town: {
    type: String,
    required: true
  },

  validFrom: {
    type: Date
  },

  validTill: {
    type: Date
  },

  expiryDate: {
    type: Date
  },

  maxRedemptions: {
    type: Number,
    default: 50
  },

  redeemedCount: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  admin:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

});

const dealModel = mongoose.model("Deal", dealSchema);

export default dealModel;