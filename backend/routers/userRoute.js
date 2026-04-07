import express from 'express'
import { userLogin, userRegister ,verifySignupOtp,resendSignupOtp,getCurrentUser,forgotPassword,resetPassword, sendContact} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
import NotiTokenModel from '../models/NotiToken.js';
const userRouter=express.Router();

userRouter.post('/login',userLogin)
userRouter.post('/register',userRegister)
userRouter.post('/verify-otp',verifySignupOtp)
userRouter.post('/resend-otp',resendSignupOtp)
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post("/contact", sendContact);



userRouter.post("/save-token", authMiddleware, async (req, res) => {
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

  userRouter.post("/remove-token", authMiddleware, async (req, res) => {
    const { token } = req.body;
  
    await NotiTokenModel.deleteOne({ token });
  
    res.json({ success: true });
  });




export default userRouter;
