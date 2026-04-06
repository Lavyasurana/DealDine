import express from "express";

import { upload } from "../middleware/multer.js";
import { verifyWithVision, handleBankSMS, getPaymentStatus  } from "../controllers/TransactionController.js";

import { authMiddleware } from "../middleware/authmiddleware.js";

const paymentRouter = express.Router();


paymentRouter.post(
    "/verify-vision", 
    authMiddleware, 
    upload.single("screenshot"), 
    verifyWithVision
);


paymentRouter.post("/webhook/bank-sms", handleBankSMS);


paymentRouter.get("/status/:utr", authMiddleware, getPaymentStatus);

export default paymentRouter;