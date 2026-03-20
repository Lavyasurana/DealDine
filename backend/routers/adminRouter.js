import express from "express"
import { registerAdmin, loginAdmin } from "../controllers/adminController.js"
import { authMiddleware } from "../middleware/authmiddleware.js"
import { adminMiddleware } from "../middleware/adminMiddleware.js"
import { loginLimiter } from "../services/rateLimit.js"

const adminRouter = express.Router()


adminRouter.post("/login",loginLimiter,loginAdmin)

export default adminRouter