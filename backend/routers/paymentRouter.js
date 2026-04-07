import express from "express";

import { upload } from "../middleware/multer.js";
import {
  confirmCashfreePayment,
  createCashfreeOrder,
  getPaymentStatus,
  handleBankSMS,
  handleCashfreeWebhook,
  payWithCredits,
  verifyWithVision,
} from "../controllers/TransactionController.js";

import { authMiddleware } from "../middleware/authmiddleware.js";

const paymentRouter = express.Router();


paymentRouter.post(
    "/verify-vision", 
    authMiddleware, 
    upload.single("screenshot"), 
    verifyWithVision
);

paymentRouter.post("/pay-with-credits", authMiddleware, payWithCredits);
paymentRouter.post("/cashfree/order", authMiddleware, createCashfreeOrder);
paymentRouter.get("/cashfree/confirm/:orderId", authMiddleware, confirmCashfreePayment);
paymentRouter.post("/cashfree/webhook", handleCashfreeWebhook);

paymentRouter.post("/webhook/bank-sms", handleBankSMS);


paymentRouter.get("/status/:utr", authMiddleware, getPaymentStatus);

export default paymentRouter;
