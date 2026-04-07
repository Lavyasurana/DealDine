import userModel from "../models/userModel.js";
import PendingSignup from "../models/pendingSignupModel.js";
import validator from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import nodemailer from "nodemailer";
import { sendContactEmail, sendVerificationOtpEmail } from "../services/emailService.js";

const createToken=async(id)=>{
    const token= jwt.sign({id},process.env.JWT_SECRET_KEY, { expiresIn: "1d" })
    return token;

}

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_BLOCK_MS = 10 * 60 * 1000;

const normalizeEmail = (email = "") => email.toLowerCase().trim();

const buildOtpPayload = () => {
  const now = new Date();
  return {
    otp: generateOtp(),
    otpExpiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
    otpLastSentAt: now,
    otpAttempts: 0,
    verificationBlockedUntil: null
  };
};

const userLogin=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const normalizedEmail = normalizeEmail(email);
        const user= await userModel.findOne({ email: normalizedEmail })
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
        res.status(500).json({success:false,message:"Login failed"})
        }
}

const userRegister=async(req,res)=>{
    try{
        
        const{firstName,lastName,email,password,phone,userId}=req.body;
        const normalizedEmail = normalizeEmail(email);
     
       
        if(!validator.isEmail(normalizedEmail))
            return res.status(400).json({success:false,message:"Enter a valid email"})
        const existingUser = await userModel.findOne({
          $or: [{ email: normalizedEmail }, { userId }, { phone }]
        });
        if(existingUser)
            return res.status(400).json({success:false,message:"User already exists"})

        const pendingConflict = await PendingSignup.findOne({
          email: { $ne: normalizedEmail },
          $or: [{ userId }, { phone }]
        });

        if (pendingConflict) {
          return res.status(400).json({
            success: false,
            message: "A signup is already pending with this phone or user ID"
          });
        }
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt);
        const otpPayload = buildOtpPayload();

        await PendingSignup.findOneAndUpdate(
          { email: normalizedEmail },
          {
            firstName,
            lastName,
            phone,
            email: normalizedEmail,
            password: hashedPassword,
            userId,
            ...otpPayload
          },
          {
            upsert: true,
            returnDocument: "after",
            setDefaultsOnInsert: true
          }
        );

        await sendVerificationOtpEmail(normalizedEmail, otpPayload.otp);

        res.json({
          success: true,
          message: "Verification OTP sent to your email"
        });
   
        
    }catch(error){
        console.log(error)
        res.status(500).json({success:false,message:"Failed to start signup"})
    }
}

const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const pendingSignup = await PendingSignup.findOne({
      email: normalizedEmail
    });

    if (!pendingSignup) {
      return res.status(404).json({
        success: false,
        message: "No pending signup found for this email"
      });
    }

    if (
      pendingSignup.verificationBlockedUntil &&
      pendingSignup.verificationBlockedUntil > new Date()
    ) {
      return res.status(429).json({
        success: false,
        message: "Too many wrong OTP attempts. Please try again later"
      });
    }

    if (pendingSignup.otp !== otp) {
      pendingSignup.otpAttempts += 1;

      if (pendingSignup.otpAttempts >= OTP_MAX_ATTEMPTS) {
        pendingSignup.verificationBlockedUntil = new Date(Date.now() + OTP_BLOCK_MS);
      }

      await pendingSignup.save();

      return res.status(400).json({
        success: false,
        message:
          pendingSignup.otpAttempts >= OTP_MAX_ATTEMPTS
            ? "Too many wrong OTP attempts. Please try again later"
            : "Invalid OTP"
      });
    }

    if (pendingSignup.otpExpiresAt < new Date()) {
      await PendingSignup.deleteOne({ _id: pendingSignup._id });
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again"
      });
    }

    const duplicateUser = await userModel.findOne({
      $or: [
        { email: pendingSignup.email },
        { userId: pendingSignup.userId },
        { phone: pendingSignup.phone }
      ]
    });

    if (duplicateUser) {
      await PendingSignup.deleteOne({ _id: pendingSignup._id });
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const user = await userModel.create({
      firstName: pendingSignup.firstName,
      lastName: pendingSignup.lastName,
      phone: pendingSignup.phone,
      email: pendingSignup.email,
      password: pendingSignup.password,
      userId: pendingSignup.userId,
      isVerified: true
    });

    await PendingSignup.deleteOne({ _id: pendingSignup._id });

    const token = await createToken(user._id);

    return res.json({
      success: true,
      message: "Email verified successfully",
      token
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP"
    });
  }
};

const resendSignupOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const pendingSignup = await PendingSignup.findOne({ email: normalizedEmail });

    if (!pendingSignup) {
      return res.status(404).json({
        success: false,
        message: "No pending signup found for this email"
      });
    }

    const now = Date.now();
    const lastSent = new Date(pendingSignup.otpLastSentAt).getTime();

    if (now - lastSent < OTP_RESEND_COOLDOWN_MS) {
      const secondsLeft = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - lastSent)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${secondsLeft}s before requesting another OTP`
      });
    }

    Object.assign(pendingSignup, buildOtpPayload());
    await pendingSignup.save();
    await sendVerificationOtpEmail(normalizedEmail, pendingSignup.otp);

    return res.json({
      success: true,
      message: "A new OTP has been sent"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP"
    });
  }
};

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

const updateCurrentUser = async (req, res) => {
  try {
    const normalizedPhone = String(req.body.phone || "").trim();

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const existingUser = await userModel.findOne({
      phone: normalizedPhone,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already in use",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { phone: normalizedPhone },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
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
      res.status(500).json({ success: false, message: "Error sending reset email" });
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
      res.status(400).json({ success: false, message: "Invalid or expired token" });
    }
  };
export const sendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // ✅ validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await sendContactEmail({ name, email, message });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.log("❌ Contact Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

  export {
    userLogin,
    userRegister,
    verifySignupOtp,
    resendSignupOtp,
    getCurrentUser,
    updateCurrentUser,
    forgotPassword,
    resetPassword
  };
