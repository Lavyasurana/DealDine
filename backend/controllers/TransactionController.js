import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import crypto from "node:crypto";
import Transaction from "../models/Transaction.js";
import cloudinary from "../config/cloudinary.js"; 
import userModel from "../models/userModel.js";
import dealModel from "../models/dealModel.js";
import UserCoupon from "../models/userCouponModel.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || "2023-08-01";
const CASHFREE_ENV = (process.env.CASHFREE_ENV || "production").toLowerCase();
const CASHFREE_API_BASE =
  CASHFREE_ENV === "sandbox"
    ? "https://sandbox.cashfree.com/pg"
    : "https://api.cashfree.com/pg";

const getCashfreeHeaders = () => ({
  "x-client-id": process.env.CASHFREE_CLIENT_ID,
  "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
  "x-api-version": CASHFREE_API_VERSION,
  "Content-Type": "application/json",
});

const ensureCashfreeConfigured = () => {
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
    throw new Error("Cashfree credentials are missing");
  }
};

const hasReachedClaimLimit = async (dealId, maxRedemptions) => {
  const totalClaims = await UserCoupon.countDocuments({ deal: dealId });
  return totalClaims >= maxRedemptions;
};

const validateDealPurchase = async (userId, dealId) => {
  const user = await userModel.findById(userId);
  const deal = await dealModel.findById(dealId);

  if (!user || !deal) {
    return { error: "Invalid user or deal" };
  }

  if (await hasReachedClaimLimit(dealId, deal.maxRedemptions)) {
    return { error: "This deal is no longer available" };
  }

  const existingCoupon = await UserCoupon.findOne({
    user: userId,
    deal: dealId,
    isUsed: false,
  }).populate("deal");

  if (existingCoupon) {
    return { error: "You already own this coupon", existingCoupon };
  }

  return { user, deal };
};

const issueCouponForTransaction = async (transaction) => {
  if (transaction.userCouponId) {
    const coupon = await UserCoupon.findById(transaction.userCouponId).populate("deal");
    if (coupon) {
      return coupon;
    }
  }

  const existingCoupon = await UserCoupon.findOne({
    user: transaction.userId,
    deal: transaction.dealId,
    isUsed: false,
  }).populate("deal");

  if (existingCoupon) {
    transaction.userCouponId = existingCoupon._id;
    transaction.status = "approved";
    await transaction.save();
    return existingCoupon;
  }

  const coupon = await UserCoupon.create({
    user: transaction.userId,
    deal: transaction.dealId,
  });

  await coupon.populate("deal");

  transaction.userCouponId = coupon._id;
  transaction.status = "approved";
  await transaction.save();

  return coupon;
};

const getBackendPublicUrl = (req) =>
  process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;

const getClientUrl = () => process.env.CLIENT_URL || process.env.FRONTEND_URL;

const extractCashfreeOrderId = (payload) =>
  payload?.data?.order?.order_id ||
  payload?.data?.payment?.order_id ||
  payload?.order?.order_id ||
  payload?.order_id ||
  null;

const extractCashfreePaymentId = (payload) =>
  payload?.data?.payment?.cf_payment_id ||
  payload?.data?.payment?.payment_id ||
  payload?.payment?.cf_payment_id ||
  payload?.payment_id ||
  null;

const verifyCashfreeWebhookSignature = (rawBody, signature, timestamp) => {
  if (!signature || !timestamp || !rawBody || !process.env.CASHFREE_CLIENT_SECRET) {
    return false;
  }

  const signedPayload = `${timestamp}${rawBody}`;
  const digest = crypto
    .createHmac("sha256", process.env.CASHFREE_CLIENT_SECRET)
    .update(signedPayload)
    .digest("base64");

  return digest === signature;
};

const fetchCashfreeOrder = async (orderId) => {
  ensureCashfreeConfigured();
  const response = await axios.get(`${CASHFREE_API_BASE}/orders/${orderId}`, {
    headers: getCashfreeHeaders(),
  });

  return response.data;
};

const syncCashfreeOrder = async (transaction, cashfreeOrder, gatewayPaymentId) => {
  if (!transaction) {
    return { success: false, message: "Transaction not found" };
  }

  if (gatewayPaymentId) {
    transaction.gatewayPaymentId = gatewayPaymentId;
  }

  if (cashfreeOrder.order_status !== "PAID") {
    transaction.status = cashfreeOrder.order_status === "ACTIVE" ? "pending" : "rejected";
    await transaction.save();
    return {
      success: false,
      message: cashfreeOrder.order_status === "ACTIVE"
        ? "Payment is still pending"
        : "Payment was not successful",
    };
  }

  const coupon = await issueCouponForTransaction(transaction);
  return { success: true, coupon };
};

export const createCashfreeOrder = async (req, res) => {
  try {
    ensureCashfreeConfigured();

    const userId = req.user.id;
    const { dealId } = req.body;
    const validation = await validateDealPurchase(userId, dealId);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { user, deal } = validation;
    const orderId = `deal_${dealId}_${Date.now()}`;
    const returnUrl = `${getClientUrl()}/cashfree-return?order_id={order_id}&deal_id=${dealId}`;
    const notifyUrl = `${getBackendPublicUrl(req)}/api/payment/cashfree/webhook`;

    const orderPayload = {
      order_id: orderId,
      order_amount: Number(deal.price),
      order_currency: "INR",
      customer_details: {
        customer_id: String(user._id),
        customer_name: `${user.firstName} ${user.lastName}`.trim(),
        customer_email: user.email,
        customer_phone: String(user.phone),
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
      },
      order_note: `Deal purchase for ${deal.dealName}`,
    };

    const { data } = await axios.post(`${CASHFREE_API_BASE}/orders`, orderPayload, {
      headers: getCashfreeHeaders(),
    });

    await Transaction.findOneAndUpdate(
      { gatewayOrderId: orderId },
      {
        userId,
        dealId,
        gatewayOrderId: orderId,
        amount: deal.price,
        provider: "cashfree",
        status: "created",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      paymentSessionId: data.payment_session_id,
      orderId,
    });
  } catch (error) {
    console.log("Cashfree order error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to create payment session",
    });
  }
};

export const confirmCashfreePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const transaction = await Transaction.findOne({
      gatewayOrderId: orderId,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    const cashfreeOrder = await fetchCashfreeOrder(orderId);
    const result = await syncCashfreeOrder(transaction, cashfreeOrder);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      coupon: result.coupon,
    });
  } catch (error) {
    console.log("Cashfree confirm error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

export const handleCashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = req.rawBody;

    if (!verifyCashfreeWebhookSignature(rawBody, signature, timestamp)) {
      return res.status(401).send("Invalid signature");
    }

    const payload = req.body;
    const orderId = extractCashfreeOrderId(payload);
    const gatewayPaymentId = extractCashfreePaymentId(payload);

    if (!orderId) {
      return res.status(200).send("No order id");
    }

    const transaction = await Transaction.findOne({ gatewayOrderId: orderId });

    if (!transaction) {
      return res.status(200).send("No matching transaction");
    }

    const cashfreeOrder = await fetchCashfreeOrder(orderId);
    await syncCashfreeOrder(transaction, cashfreeOrder, gatewayPaymentId);

    return res.status(200).send("OK");
  } catch (error) {
    console.log("Cashfree webhook error:", error.response?.data || error.message);
    return res.status(500).send("Server Error");
  }
};

export const payWithCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dealId } = req.body;
    const validation = await validateDealPurchase(userId, dealId);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { user, deal } = validation;

    if (user.credits < deal.price) {
      return res.status(400).json({
        success: false,
        message: "Not enough credits",
      });
    }

    user.credits -= deal.price;
    await user.save();

    const coupon = await UserCoupon.create({
      user: userId,
      deal: dealId,
    });

    await coupon.populate("deal");

    return res.json({
      success: true,
      message: "Deal unlocked using credits 🎉",
      coupon,
      remainingCredits: user.credits,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const verifyWithVision = async (req, res) => {
  try {
    const { dealId } = req.body;
    const file = req.file; 

    if (!file) return res.status(400).json({ success: false, message: "Upload screenshot" });

    // 1. Prepare Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imageData = {
      inlineData: { data: file.buffer.toString("base64"), mimeType: file.mimetype }
    };

    const prompt = "Extract UPI UTR (12 digits) and Amount. Return ONLY JSON: {\"utr\": \"string\", \"amount\": number}";
    
    const result = await model.generateContent([prompt, imageData]);
    const cleanJson = result.response.text().replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(cleanJson);

    // 2. Prevent Re-use (Duplicate UTR)
// Replace your "Step 2" in verifyWithVision with this:
const existing = await Transaction.findOne({ transactionId: aiData.utr });

if (existing) {
  // If it exists and is already approved by SMS, just tell the user it's done
  if (existing.status === "approved") {
     return res.json({ success: true, message: "Payment already verified!", utr: aiData.utr });
  }
  // Otherwise, if it was just a duplicate attempt, block it
  return res.status(400).json({ success: false, message: "Payment already being processed" });
}

    // 3. Upload proof to Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve) => {
        cloudinary.uploader.upload_stream({ folder: "payments" }, (err, res) => resolve(res.secure_url))
        .end(file.buffer);
      });
    };
    const imageUrl = await uploadToCloudinary();

    // 4. Create Transaction
    const newTx = await Transaction.create({
      userId: req.user.id,
      dealId,
      transactionId: aiData.utr,
      amount: aiData.amount,
      screenshotUrl: imageUrl,
      status: "pending"
    });

    res.json({ success: true, message: "AI verified screenshot. Waiting for bank SMS.", utr: aiData.utr });

  } catch (error) {
    res.status(500).json({ success: false, message: "AI Error: " + error.message });
  }
};

// controllers/paymentController.js (continued)

export const handleBankSMS = async (req, res) => {
    try {
      const { message } = req.body; // Sent from iPhone Shortcut
      if (!message) return res.status(400).send("No message");
  
      // 1. Regex to get 12-digit UTR from BoB SMS
      const utrMatch = message.match(/\b\d{12}\b/);
      if (!utrMatch) return res.status(200).send("Not a UPI SMS");
  
      const incomingUtr = utrMatch[0];
  
      // 2. Find and Update the Transaction
      const transaction = await Transaction.findOne({ transactionId: incomingUtr });
  
      if (transaction) {
        transaction.status = "approved";
        transaction.verifiedByBank = true;
        await transaction.save();
        
        console.log(`✅ Approved: UTR ${incomingUtr}`);
        return res.status(200).send("Approved");
      } 
  
      // If SMS arrives before user uploads screenshot, we can't match yet
      res.status(200).send("SMS logged, no matching user yet");
      
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };

  // controllers/paymentController.js (continued)

export const getPaymentStatus = async (req, res) => {
    try {
      const { utr } = req.params;
      const transaction = await Transaction.findOne({ transactionId: utr });
  
      if (!transaction) return res.status(404).json({ message: "Not found" });
  
      res.json({ 
        status: transaction.status, // approved, pending, or rejected
        success: transaction.status === "approved" 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
