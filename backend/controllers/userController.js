import userModel from "../models/userModel.js";
import validator from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import nodemailer from "nodemailer";
import { sendVerificationEmail } from "../services/emailService.js";
import crypto from "crypto";
const createToken=async(id)=>{
    const token= jwt.sign({id},process.env.JWT_SECRET_KEY, { expiresIn: "1d" })
    return token;

}
const userLogin=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user= await userModel.findOne({email})
        if(!user)
            return res.json({success:false,message:"User does not exist"})
    
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch)
            return res.json({success:false,message:"Enter valid password"})
          
        if (!user.isVerified) {
          return res.json({
              success: false,
              message: "Please verify your email first"
          });
      }
    
        const token=await createToken(user._id)
        res.json({success:true,token,user_name:user.name,user_id:user._id})
        console.log("token:",token)
    
    
    
    
    
    }catch(error){
        console.log(error.message)
        res.json({success:false,error})
        }
}

const userRegister=async(req,res)=>{
    try{
        
        const{firstName,lastName,email,password,phone,userId}=req.body;
     
       
        if(!validator.isEmail(email))
            return res.json({success:false,message:"enter a valid email"})
        const exist=await userModel.findOne({email});
        if(exist)
            return res.json({success:false,message:"user already exists"})
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt);
        
        const token = crypto.randomBytes(32).toString("hex");

        const user = new userModel({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            userId,
            isVerified: false,
            verificationToken: token
        });  
    
       
        await user.save();
        const x=await sendVerificationEmail(email, token);
        console.log("email sent",x)

res.json({
    success: true,
    message: "Verification email sent"
});
   
        
    }catch(error){
        console.log(error)
        res.json({success:false,error})
    }
}

const getCurrentUser = async (req, res) => {
    try {
      const user = await userModel
        .findById(req.user.id)
        .select("-password");
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      res.json({
        success: true,
        user
      });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

  const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await userModel.findOne({ email });
  
      // IMPORTANT: don't reveal if user exists
      if (!user) {
        return res.json({
          success: true,
          message: "If email exists, reset link sent",
        });
      }
  
      // Generate token (15 min expiry)
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" }
      );
  
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
      // Mail transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      await transporter.sendMail({
        from: `"DealDine" <${process.env.EMAIL}>`,
        to: email,
        subject: "Reset Your Password",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link expires in 15 minutes.</p>
        `,
      });
  
      res.json({ success: true, message: "Reset link sent" });
  
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error sending reset email" });
    }
  };

  const resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      await userModel.findByIdAndUpdate(decoded.id, {
        password: hashedPassword,
      });
  
      res.json({ success: true, message: "Password reset successful" });
  
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Invalid or expired token" });
    }
  };


  const verifyUser = async (req, res) => {
    try {
      const user = await userModel.findOne({
        verificationToken: req.params.token
      });
  
      if (!user) {
        return res.send("Invalid or expired token");
      }
  
      user.isVerified = true;
      user.verificationToken = null;
  
      await user.save();
  
      res.send("Email verified successfully");
    } catch (error) {
      res.send("Error verifying email");
    }
  };


  export {
    userLogin,
    userRegister,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    verifyUser
  };