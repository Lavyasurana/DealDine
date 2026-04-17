import express from "express";
import {
  confirmCashfreePayment,
  createCashfreeOrder,
  getCashfreePaymentStatus,
  getCheckoutSummary,
  handleCashfreeWebhook,
  payWithCredits,
} from "../controllers/TransactionController.js";

import { authMiddleware } from "../middleware/authmiddleware.js";
import { csrfMiddleware } from "../middleware/csrfMiddleware.js";

const paymentRouter = express.Router();

paymentRouter.get("/checkout-summary/:dealId", authMiddleware, getCheckoutSummary);
paymentRouter.post("/pay-with-credits", authMiddleware, csrfMiddleware, payWithCredits);
paymentRouter.post("/cashfree/order", authMiddleware, csrfMiddleware, createCashfreeOrder);
paymentRouter.get("/cashfree/confirm/:orderId", authMiddleware, confirmCashfreePayment);
paymentRouter.get("/cashfree/status/:orderId", authMiddleware, getCashfreePaymentStatus);
paymentRouter.post("/cashfree/webhook", handleCashfreeWebhook);

export default paymentRouter;
