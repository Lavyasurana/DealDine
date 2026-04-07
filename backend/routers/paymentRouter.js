import express from "express";
import {
  confirmCashfreePayment,
  createCashfreeOrder,
  handleCashfreeWebhook,
  payWithCredits,
} from "../controllers/TransactionController.js";

import { authMiddleware } from "../middleware/authmiddleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/pay-with-credits", authMiddleware, payWithCredits);
paymentRouter.post("/cashfree/order", authMiddleware, createCashfreeOrder);
paymentRouter.get("/cashfree/confirm/:orderId", authMiddleware, confirmCashfreePayment);
paymentRouter.post("/cashfree/webhook", handleCashfreeWebhook);

export default paymentRouter;
