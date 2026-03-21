import express from 'express';
import cors from 'cors';
import connectDB from './config/MongoDbCon.js';
import'dotenv/config.js'
import dealRouter from './routers/dealRouter.js';
import userRouter from './routers/userRoute.js';
import payRouter from './routers/razorpayRoute.js';
import Couponrouter from './routers/userCouponRouter.js';
import adminRouter from './routers/adminRouter.js';
import helmet from "helmet";
import cloudinary, { connectCloudinary } from './config/cloudinary.js';



const app=express();
const PORT = process.env.PORT || 5111;
connectDB();
connectCloudinary();

const allowedOrigins = [
    "https://dealdine.in",
    "https://www.dealdine.in",
    "https://admin.dealdine.in"
  ];
  
  app.use(cors({
    origin: function(origin, callback){
      if(!origin || allowedOrigins.includes(origin)){
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  }));
app.use(express.json());
app.use(helmet());

app.use('/api/deals',dealRouter)
app.use('/api/user',userRouter)
app.use('/payment',payRouter)
app.use('/coupon',Couponrouter)
app.use('/api/admin',adminRouter)



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}); 
