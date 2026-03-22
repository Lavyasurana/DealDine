import express from 'express'
import { userLogin, userRegister ,getCurrentUser,forgotPassword,resetPassword, verifyUser} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
const userRouter=express.Router();

userRouter.post('/login',userLogin)
userRouter.post('/register',userRegister)
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.get('/verify/:token',verifyUser)


export default userRouter;