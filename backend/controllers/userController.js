import userModel from "../models/userModel.js";
import PendingSignup from "../models/pendingSignupModel.js";
import validator from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import nodemailer from "nodemailer";
import { sendContactEmail, sendVerificationOtpEmail } from "../services/emailService.js";
import { clearCsrfCookie, setCsrfCookie } from "../middleware/csrfMiddleware.js";

const createToken=async(id)=>{
    const token= jwt.sign({ id, tokenType: "access" },process.env.JWT_SECRET_KEY, { expiresIn: "1d" })
    return token;

}

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_BLOCK_MS = 10 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;

const normalizeEmail = (email = "") => email.toLowerCase().trim();
const normalizePhone = (phone = "") => String(phone).trim();
const normalizeUserId = (userId = "") => String(userId).trim();

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000
});

const setAuthCookie = (res, token) => {
  res.cookie("access_token", token, getAuthCookieOptions());
  setCsrfCookie(res);
};

const clearAuthCookie = (res) => {
  res.clearCookie("access_token", getAuthCookieOptions());
  clearCsrfCookie(res);
};

const isStrongPassword = (password = "") =>
  typeof password === "string" &&
  password.length >= MIN_PASSWORD_LENGTH &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

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
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }
        const normalizedEmail = normalizeEmail(email);
        const user= await userModel.findOne({ email: normalizedEmail })
        if(!user)
            return res.json({success:false,message:"user or password wrong"})
    
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch)
            return res.json({success:false,message:"user or password wrong"})
          
        if (!user.isVerified) {
          return res.json({
              success: false,
              message: "Please verify your email first"
          });
      }
    
        const token=await createToken(user._id)
        setAuthCookie(res, token);
        res.json({success:true,user_name:user.name,user_id:user._id})
    
    
    
    
    
    }catch(error){
        console.log(error.message)
        res.status(500).json({success:false,message:"Login failed"})
        }
}

const userRegister=async(req,res)=>{
    try{
        
        const{firstName,lastName,email,password,phone,userId}=req.body;
        const normalizedEmail = normalizeEmail(email);
        const normalizedPhone = normalizePhone(phone);
        const normalizedUserId = normalizeUserId(userId);
     
       
        if(!validator.isEmail(normalizedEmail))
            return res.status(400).json({success:false,message:"Enter a valid email"})
        if (!firstName?.trim() || !lastName?.trim()) {
          return res.status(400).json({ success: false, message: "First and last name are required" });
        }
        if (!normalizedPhone || !normalizedUserId) {
          return res.status(400).json({ success: false, message: "Phone and user ID are required" });
        }
        if (!isStrongPassword(password)) {
          return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters and include uppercase, lowercase, and a number"
          });
        }
        const existingUser = await userModel.findOne({
          $or: [{ email: normalizedEmail }, { userId: normalizedUserId }, { phone: normalizedPhone }]
        });
        if(existingUser)
            return res.status(400).json({success:false,message:"User already exists"})

        const pendingConflict = await PendingSignup.findOne({
          email: { $ne: normalizedEmail },
          $or: [{ userId: normalizedUserId }, { phone: normalizedPhone }]
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
            phone: normalizedPhone,
            email: normalizedEmail,
            password: hashedPassword,
            userId: normalizedUserId,
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
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }
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
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: "Email verified successfully"
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
    if (!req.body.email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
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
      if (!req.cookies?.csrf_token) {
        setCsrfCookie(res);
      }

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

const logoutUser = async (_req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true, message: "Logged out successfully" });
};

  const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
  
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
        { id: user._id, tokenType: "password_reset" },
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
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: "Token and new password are required" });
      }
      if (!isStrongPassword(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters and include uppercase, lowercase, and a number"
        });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decoded.tokenType !== "password_reset") {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
      }
  
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
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

export const handleResendWebhook = async (req, res) => {
  try {
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

  export {
    userLogin,
    userRegister,
    verifySignupOtp,
    resendSignupOtp,
    getCurrentUser,
    updateCurrentUser,
    logoutUser,
    forgotPassword,
    resetPassword
  };
