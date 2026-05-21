import axios from "axios";
import crypto from "node:crypto";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import userModel from "../models/userModel.js";
import dealModel from "../models/dealModel.js";
import UserCoupon from "../models/userCouponModel.js";
import { sendCouponPurchaseEmail } from "../services/emailService.js";
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

class PurchaseError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const isDuplicateKeyError = (error) => error?.code === 11000;

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

  if (deal.validTill && new Date() > new Date(deal.validTill)) {
    return { error: "This deal is no longer available" };
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

const buildCheckoutSummary = (user, deal) => {
  const dealPrice = Number(deal.price) || 0;
  const availableCredits = Math.max(Number(user.credits) || 0, 0);
  const creditsApplied = Math.min(availableCredits, dealPrice);
  const cashAmount = Math.max(dealPrice - creditsApplied, 0);

  return {
    dealPrice,
    availableCredits,
    creditsApplied,
    creditsLeft: availableCredits - creditsApplied,
    cashAmount,
  };
};

const runInTransaction = async (work) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await work(session);
    });

    return result;
  } finally {
    await session.endSession();
  }
};

const reserveDealRedemption = async (deal, session, _pendingCouponCount = 0) => {
  const updatedDeal = await dealModel.findOneAndUpdate(
    {
      _id: deal._id,
      redeemedCount: { $lt: deal.maxRedemptions },
    },
    {
      $inc: { redeemedCount: 1 },
    },
    {
      new: true,
      session,
    }
  );

  if (updatedDeal) {
    return updatedDeal;
  }

  throw new PurchaseError("This deal is no longer available");
};

const settleTransactionCredits = async (transaction, session) => {
  if (!transaction || transaction.creditsSettled || !transaction.creditsApplied) {
    return;
  }

  const user = await userModel.findOneAndUpdate(
    {
      _id: transaction.userId,
      credits: { $gte: transaction.creditsApplied },
    },
    {
      $inc: { credits: -transaction.creditsApplied },
    },
    {
      new: true,
      session,
    }
  );

  if (!user) {
    throw new PurchaseError("User does not have enough credits to settle this transaction");
  }

  transaction.creditsSettled = true;
  await transaction.save({ session });

  return user;
};

const issueCouponForTransaction = async (transaction, session) => {
  if (transaction.userCouponId) {
    const coupon = await UserCoupon.findById(transaction.userCouponId).session(session);
    if (coupon) {
      await userModel.updateOne(
        { _id: coupon.user },
        { $addToSet: { issuedCoupons: coupon._id } },
        { session }
      );
      return { coupon, created: false };
    }
  }

  const existingCoupon = await UserCoupon.findOne({
    user: transaction.userId,
    deal: transaction.dealId,
    isUsed: false,
  }).session(session);

  if (existingCoupon) {
    await userModel.updateOne(
      { _id: transaction.userId },
      { $addToSet: { issuedCoupons: existingCoupon._id } },
      { session }
    );
    transaction.userCouponId = existingCoupon._id;
    transaction.status = "approved";
    await transaction.save({ session });
    return { coupon: existingCoupon, created: false };
  }

  try {
    const [coupon] = await UserCoupon.create(
      [
        {
          user: transaction.userId,
          deal: transaction.dealId,
        },
      ],
      { session }
    );

    const deal = await dealModel.findById(transaction.dealId).session(session);
    if (!deal) {
      throw new PurchaseError("Deal not found", 404);
    }

    await reserveDealRedemption(deal, session, 1);

    await userModel.updateOne(
      { _id: transaction.userId },
      { $addToSet: { issuedCoupons: coupon._id } },
      { session }
    );

    transaction.userCouponId = coupon._id;
    transaction.status = "approved";
    await transaction.save({ session });

    return { coupon, created: true };
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const coupon = await UserCoupon.findOne({
      user: transaction.userId,
      deal: transaction.dealId,
      isUsed: false,
    }).session(session);

    if (!coupon) {
      throw error;
    }

    await userModel.updateOne(
      { _id: transaction.userId },
      { $addToSet: { issuedCoupons: coupon._id } },
      { session }
    );

    transaction.userCouponId = coupon._id;
    transaction.status = "approved";
    await transaction.save({ session });

    return { coupon, created: false };
  }
};

const populateCoupon = async (couponId) =>
  UserCoupon.findById(couponId)
    .populate("deal")
    .populate("user");

const maybeSendCouponEmail = async (coupon, shouldSend) => {
  if (shouldSend && coupon?.user?.email) {
    await sendCouponPurchaseEmail(coupon.user.email, coupon);
  }
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

  if (transaction.status === "approved" && transaction.userCouponId) {
    const coupon = await populateCoupon(transaction.userCouponId);
    return { success: true, coupon };
  }

  if (cashfreeOrder.order_status !== "PAID") {
    if (gatewayPaymentId) {
      transaction.gatewayPaymentId = gatewayPaymentId;
    }

    transaction.status = cashfreeOrder.order_status === "ACTIVE" ? "pending" : "rejected";
    await transaction.save();
    return {
      success: false,
      message: cashfreeOrder.order_status === "ACTIVE"
        ? "Payment is still pending"
        : "Payment was not successful",
    };
  }

  const { couponId, created } = await runInTransaction(async (session) => {
    const transactionInSession = await Transaction.findById(transaction._id).session(session);

    if (!transactionInSession) {
      throw new PurchaseError("Transaction not found", 404);
    }

    if (gatewayPaymentId) {
      transactionInSession.gatewayPaymentId = gatewayPaymentId;
    }

    if (transactionInSession.status === "approved" && transactionInSession.userCouponId) {
      return {
        couponId: transactionInSession.userCouponId,
        created: false,
      };
    }

    await settleTransactionCredits(transactionInSession, session);
    const { coupon, created } = await issueCouponForTransaction(transactionInSession, session);

    return {
      couponId: coupon._id,
      created,
    };
  });

  const coupon = await populateCoupon(couponId);
  await maybeSendCouponEmail(coupon, created);

  return { success: true, coupon };
};

export const getCheckoutSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dealId } = req.params;
    const validation = await validateDealPurchase(userId, dealId);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        existingCouponId: validation.existingCoupon?._id || null,
      });
    }

    const { user, deal } = validation;
    const summary = buildCheckoutSummary(user, deal);

    return res.json({
      success: true,
      deal,
      summary,
    });
  } catch (error) {
    console.log("Checkout summary error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load checkout summary",
    });
  }
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
    const summary = buildCheckoutSummary(user, deal);

    if (summary.cashAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "This deal can be purchased fully using credits",
      });
    }

    const orderId = `deal_${dealId}_${Date.now()}`;
    const returnUrl = `${getClientUrl()}/cashfree-return?order_id={order_id}&deal_id=${dealId}`;
    const notifyUrl = `${getBackendPublicUrl(req)}/api/payment/cashfree/webhook`;

    const orderPayload = {
      order_id: orderId,
      order_amount: summary.cashAmount,
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
        transactionId: orderId,
        gatewayOrderId: orderId,
        amount: summary.cashAmount,
        originalAmount: summary.dealPrice,
        creditsApplied: summary.creditsApplied,
        creditsSettled: false,
        provider: "cashfree",
        status: "created",
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
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
    const statusCode = error instanceof PurchaseError ? error.statusCode : 500;
    const message = error instanceof PurchaseError
      ? error.message
      : "Failed to verify payment";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const getCashfreePaymentStatus = async (req, res) => {
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

    if (transaction.status === "approved" && transaction.userCouponId) {
      return res.json({
        success: true,
        status: "approved",
        couponId: transaction.userCouponId,
      });
    }

    const cashfreeOrder = await fetchCashfreeOrder(orderId);
    const result = await syncCashfreeOrder(transaction, cashfreeOrder);

    if (result.success && result.coupon?._id) {
      return res.json({
        success: true,
        status: "approved",
        couponId: result.coupon._id,
      });
    }

    const refreshedTransaction = await Transaction.findById(transaction._id);
    const status = refreshedTransaction?.status || "pending";

    return res.json({
      success: true,
      status,
      message: result.message || "Payment is being processed",
      couponId: refreshedTransaction?.userCouponId || null,
    });
  } catch (error) {
    console.log("Cashfree status error:", error.response?.data || error.message);
    const statusCode = error instanceof PurchaseError ? error.statusCode : 500;
    const message = error instanceof PurchaseError
      ? error.message
      : "Failed to fetch payment status";

    return res.status(statusCode).json({
      success: false,
      message,
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
    const { couponId, remainingCredits, created } = await runInTransaction(async (session) => {
      const user = await userModel.findById(userId).session(session);
      const deal = await dealModel.findById(dealId).session(session);

      if (!user || !deal) {
        throw new PurchaseError("Invalid user or deal");
      }

      const existingCoupon = await UserCoupon.findOne({
        user: userId,
        deal: dealId,
        isUsed: false,
      }).session(session);

      if (existingCoupon) {
        throw new PurchaseError("You already own this coupon");
      }

      const summary = buildCheckoutSummary(user, deal);

      if (summary.cashAmount > 0) {
        throw new PurchaseError("Not enough credits");
      }

      const updatedUser = await userModel.findOneAndUpdate(
        {
          _id: userId,
          credits: { $gte: summary.dealPrice },
        },
        {
          $inc: { credits: -summary.dealPrice },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedUser) {
        throw new PurchaseError("Not enough credits");
      }

      try {
        const [coupon] = await UserCoupon.create(
          [
            {
              user: userId,
              deal: dealId,
            },
          ],
          { session }
        );

        await reserveDealRedemption(deal, session, 1);

        await userModel.updateOne(
          { _id: userId },
          { $addToSet: { issuedCoupons: coupon._id } },
          { session }
        );

        return {
          couponId: coupon._id,
          remainingCredits: updatedUser.credits,
          created: true,
        };
      } catch (error) {
        if (!isDuplicateKeyError(error)) {
          throw error;
        }

        throw new PurchaseError("You already own this coupon");
      }
    });

    const coupon = await populateCoupon(couponId);
    await maybeSendCouponEmail(coupon, created);

    return res.json({
      success: true,
      message: "Deal unlocked using credits 🎉",
      coupon,
      remainingCredits,
    });
  } catch (error) {
    console.log(error);
    const statusCode = error instanceof PurchaseError ? error.statusCode : 500;
    const message = error instanceof PurchaseError ? error.message : "Server error";
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
