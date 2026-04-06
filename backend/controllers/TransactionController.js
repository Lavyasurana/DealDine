// controllers/paymentController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import Transaction from "../models/Transaction.js";
import cloudinary from "../config/cloudinary.js"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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