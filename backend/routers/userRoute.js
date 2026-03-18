import express from 'express'
import { userLogin, userRegister ,getCurrentUser} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authmiddleware.js';
const userRouter=express.Router();

userRouter.post('/login',userLogin)
userRouter.post('/register',userRegister)
userRouter.get('/me', authMiddleware, getCurrentUser);


export default userRouter;