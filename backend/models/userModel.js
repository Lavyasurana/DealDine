import monngoose from 'mongoose'
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true,trim: true },
  lastName: { type: String, required: true,trim: true },
  userId:{type:String,required:true,unique:true},
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },

  phone: { type: String, required: true,unique:true },

  credits:{type:Number,default:100},

  issuedCoupons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal"
    }
  ]
});

const userModel=monngoose.model("user",userSchema)

export default userModel;