import mongoose from "mongoose";

const allowedAdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }
  });
  
const allowedModel= mongoose.model("allowedadmins", allowedAdminSchema);
export default allowedModel