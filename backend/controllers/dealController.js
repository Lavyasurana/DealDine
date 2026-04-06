import dealModel from "../models/dealModel.js"
import userModel from "../models/userModel.js"


import { sendDealEmail } from "../services/emailService.js"

import adminModel from "../models/adminModel.js";
import NotiTokenModel from "../models/NotiToken.js";
import admin from "../config/firebase.js";



const addDeal = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { maxRedemptions, ...dealData } = req.body;

    // ✅ 1. Fetch admin details
    const Admin = await adminModel.findById(adminId);

    if (!admin) {
      return res.json({
        success: false,
        message: "Admin not found"
      });
    }

    const parsedMaxRedemptions =
      maxRedemptions === undefined || maxRedemptions === null || maxRedemptions === ""
        ? undefined
        : Number(maxRedemptions);

    if (
      parsedMaxRedemptions !== undefined &&
      (!Number.isInteger(parsedMaxRedemptions) || parsedMaxRedemptions < 1)
    ) {
      return res.json({
        success: false,
        message: "Total claim limit must be a positive whole number"
      });
    }

    // ✅ 2. Create deal with admin data
    const deal = new dealModel({
      ...dealData,
      admin: adminId,
      ...(parsedMaxRedemptions !== undefined
        ? { maxRedemptions: parsedMaxRedemptions }
        : {}),

      // inject from admin
      resName: Admin.restaurantName,
      location: Admin.location,
      town: Admin.town,
      image: Admin.imageUrl
    });

    await deal.save();

    const tokens = await NotiTokenModel.find();

let successCount = 0;
let failureCount = 0;

await Promise.all(
  tokens.map(async (t) => {
    try {
      await admin.messaging().send({
        token: t.token,
        notification: {
          title: "🔥 New Deal Available!",
          body: `${deal.resName}: ${deal.dealName}`
        },
        webpush: {
          fcmOptions: {
            link: `http://localhost:5173/deal/${deal._id}`
          }
        }
      });

      successCount++; // ✅ success

    } catch (err) {
      failureCount++; // ❌ failure

      console.log("❌ Push error:", err.message);

      // remove invalid tokens
      if (
        err.code === "messaging/registration-token-not-registered"
      ) {
        await NotiTokenModel.deleteOne({ token: t.token });
      }
    }
  })
);

// 🔥 FINAL LOG
console.log("🔔 Notifications Summary:");
console.log("✅ Success:", successCount);
console.log("❌ Failed:", failureCount);
console.log("👥 Total Tokens:", tokens.length);


    // ✅ 3. Fetch users
    const users = await userModel.find();

    // ⚠️ 4. Send emails (we’ll optimize below)
   // send emails in background (DON'T BLOCK API)
Promise.all(
  users.map(user => sendDealEmail(user.email, deal))
).catch(err => console.log("Email error:", err));
    res.json({
      success: true,
      message: "Deal Added & Users Notified"
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error adding deal"
    });
  }
};



   const getAlldeal = async (req, res) => {
    try {
  
      const today = new Date()
  
      const startOfDay = new Date(today.setHours(0,0,0,0))
      const endOfDay = new Date(today.setHours(23,59,59,999))
  
      const deals = await dealModel.find({})
  
      res.json({
        success: true,
        deals
      })
  
    } catch (error) {
  
      console.log(error)
  
      res.json({
        success: false,
        message: "Failed to fetch deals"
      })
  
    }
  }

   const listAdminCoupons = async(req,res)=>{
    try{
  
      const adminId = req.user.id
  
      const deals = await dealModel.find({admin:adminId})
        .sort({createdAt:-1})
  
      res.json({
        success:true,
        deals
      })
  
    }catch(error){
  
      console.log(error)
  
      res.json({
        success:false,
        message:"Failed to fetch coupons"
      })
  
    }
  }

  export const searchRestaurantDeals = async (req,res)=>{
    try{
  
      const {query} = req.query
  
      const deals = await dealModel.find({
        resName: { $regex: query, $options: "i" }
      }).sort({createdAt:-1})
  
      res.json({
        success:true,
        deals
      })
  
    }catch(error){
  
      console.log(error)
  
      res.json({
        success:false,
        message:"Search failed"
      })
  
    }
  }



export {addDeal,getAlldeal,listAdminCoupons}
