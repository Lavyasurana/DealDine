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

const allowedOrigins = process.env.ALLOWED_ORIGINS
  .split(",")
  .map(origin => origin.trim());


const corsOptions = {
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(null, false); 
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};


app.use(cors(corsOptions));

// ✅ Handle preflight requests globally
app.options("*", cors(corsOptions));
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
