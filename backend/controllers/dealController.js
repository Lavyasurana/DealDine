import dealModel from "../models/dealModel.js"
import userModel from "../models/userModel.js"


import { sendDealEmail } from "../services/emailService.js"

import adminModel from "../models/adminModel.js";
import NotiTokenModel from "../models/NotiToken.js";
import admin from "../config/firebase.js";
import {
  buildDealAvailabilityWindow,
  compareTimeStrings,
  normalizeAvailableDates,
  toDateInputValue,
  toTimeInputValue,
} from "../utils/dealSchedule.js";

const parseDatetimeLocalAsIST = (value) => {
  if (!value || typeof value !== "string") {
    return value;
  }

  if (value.includes("Z") || /[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }

  const [datePart, timePart = "00:00"] = value.split("T");

  if (!datePart) {
    return value;
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour = 0, minute = 0] = timePart.split(":").map(Number);

  if ([year, month, day, hour, minute].some(Number.isNaN)) {
    return value;
  }

  const utcMillis = Date.UTC(year, month - 1, day, hour - 5, minute - 30);
  return new Date(utcMillis);
};

const normalizeDealDates = (dealData) => ({
  ...dealData,
  validFrom: dealData.validFrom ? parseDatetimeLocalAsIST(dealData.validFrom) : dealData.validFrom,
  validTill: dealData.validTill ? parseDatetimeLocalAsIST(dealData.validTill) : dealData.validTill,
  expiryDate: dealData.expiryDate ? parseDatetimeLocalAsIST(dealData.expiryDate) : dealData.expiryDate,
});

const normalizeDealSchedule = (dealData) => {
  const normalizedDates = normalizeAvailableDates(dealData.availableDates);

  const startTime =
    typeof dealData.startTime === "string" && dealData.startTime.trim()
      ? dealData.startTime.trim()
      : dealData.validFrom
        ? toTimeInputValue(parseDatetimeLocalAsIST(dealData.validFrom))
        : "";

  const endTime =
    typeof dealData.endTime === "string" && dealData.endTime.trim()
      ? dealData.endTime.trim()
      : dealData.validTill
        ? toTimeInputValue(parseDatetimeLocalAsIST(dealData.validTill))
        : "";

  const fallbackDates = [];

  if (!normalizedDates.length && dealData.validFrom) {
    fallbackDates.push(parseDatetimeLocalAsIST(dealData.validFrom));
  }

  if (!normalizedDates.length && dealData.validTill) {
    fallbackDates.push(parseDatetimeLocalAsIST(dealData.validTill));
  }

  const availableDates = normalizedDates.length
    ? normalizedDates
    : normalizeAvailableDates(fallbackDates.map((value) => toDateInputValue(value)));

  return {
    startTime,
    endTime,
    availableDates,
  };
};

const getEmailErrorMessage = (error) => {
  if (!error) {
    return "Unknown email error";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error.message ||
    error.name ||
    error.error?.message ||
    error.response?.data?.message ||
    "Unknown email error"
  );
};

const addDeal = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { maxRedemptions, ...dealData } = req.body;
    const normalizedDealData = normalizeDealDates(dealData);
    const normalizedSchedule = normalizeDealSchedule(dealData);

    // ✅ 1. Fetch admin details
    const Admin = await adminModel.findById(adminId);

    if (!Admin) {
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

    if (!normalizedSchedule.startTime || !normalizedSchedule.endTime) {
      return res.json({
        success: false,
        message: "Start time and end time are required"
      });
    }

    if (compareTimeStrings(normalizedSchedule.startTime, normalizedSchedule.endTime) >= 0) {
      return res.json({
        success: false,
        message: "End time must be after start time"
      });
    }

    if (!normalizedSchedule.availableDates.length) {
      return res.json({
        success: false,
        message: "Select at least one date for this deal"
      });
    }

    const availabilityWindow = buildDealAvailabilityWindow(normalizedSchedule);

    // ✅ 2. Create deal with admin data
    const deal = new dealModel({
      ...normalizedDealData,
      admin: adminId,
      ...(parsedMaxRedemptions !== undefined
        ? { maxRedemptions: parsedMaxRedemptions }
        : {}),
      startTime: normalizedSchedule.startTime,
      endTime: normalizedSchedule.endTime,
      availableDates: availabilityWindow.availableDates,
      validFrom: availabilityWindow.validFrom,
      validTill: availabilityWindow.validTill,
      expiryDate: availabilityWindow.expiryDate,

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

    // ✅ 3. Fetch users
    const users = await userModel.find({}, "email");

    const emailRecipients = users
      .map((user) => user.email?.trim().toLowerCase())
      .filter(Boolean);

    // ✅ 4. Send emails and wait for the actual results
    const emailResults = await Promise.all(
      emailRecipients.map((email) => sendDealEmail(email, deal))
    );

    const successfulEmails = emailResults
      .filter((result) => result.success)
      .map((result) => result.email);

    const failedEmails = emailResults
      .filter((result) => !result.success)
      .map((result) => ({
        email: result.email,
        error: getEmailErrorMessage(result.error),
      }));

    console.log("Deal email summary:", {
      dealId: deal._id.toString(),
      totalRecipients: emailRecipients.length,
      successCount: successfulEmails.length,
      failureCount: failedEmails.length,
      failedEmails,
    });

    res.json({
      success: true,
      message:
        failedEmails.length > 0
          ? "Deal added. Some user emails could not be sent."
          : "Deal Added & Users Notified",
      emailSummary: {
        totalRecipients: emailRecipients.length,
        successCount: successfulEmails.length,
        failureCount: failedEmails.length,
        failedEmails,
      }
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
