import express from 'express'
import { userLogin, userRegister ,verifySignupOtp,resendSignupOtp,getCurrentUser,updateCurrentUser,logoutUser,forgotPassword,resetPassword, sendContact, handleResendWebhook} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
import { csrfMiddleware } from '../middleware/csrfMiddleware.js';
import { forgotPasswordLimiter, loginLimiter, otpResendLimiter, otpVerifyLimiter, resetPasswordLimiter } from '../services/rateLimit.js';
import NotiTokenModel from '../models/NotiToken.js';
const userRouter=express.Router();

userRouter.post('/login',loginLimiter,userLogin)
userRouter.post('/register',userRegister)
userRouter.post('/verify-otp',otpVerifyLimiter,verifySignupOtp)
userRouter.post('/resend-otp',otpResendLimiter,resendSignupOtp)
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.put('/me', authMiddleware, csrfMiddleware, updateCurrentUser);
userRouter.post('/logout', authMiddleware, csrfMiddleware, logoutUser);
userRouter.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
userRouter.post('/reset-password', resetPasswordLimiter, resetPassword);
userRouter.post("/contact", sendContact);
userRouter.post("/email/webhook", handleResendWebhook);



userRouter.post("/save-token", authMiddleware, csrfMiddleware, async (req, res) => {
    try {
      const { token } = req.body;
      
      const userId = req.user.id; 
      
  
      await NotiTokenModel.findOneAndUpdate(
        { token },
        { token, userId },
        { upsert: true }
      );
  
      res.json({ success: true });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save token" });
    }
  });

  userRouter.post("/remove-token", authMiddleware, csrfMiddleware, async (req, res) => {
    const { token } = req.body;
  
    await NotiTokenModel.deleteOne({ token });
  
    res.json({ success: true });
  });




export default userRouter;
