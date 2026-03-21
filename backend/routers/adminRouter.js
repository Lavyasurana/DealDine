import express from "express"
import { registerAdmin, loginAdmin, adminProfile} from "../controllers/adminController.js"
import { authMiddleware } from "../middleware/authmiddleware.js"
import { adminMiddleware } from "../middleware/adminMiddleware.js"
import { loginLimiter } from "../services/rateLimit.js"
import { upload } from "../middleware/multer.js"

const adminRouter = express.Router()

adminRouter.post('/register',registerAdmin)
adminRouter.post("/login",loginLimiter,loginAdmin)
adminRouter.post("/profile",authMiddleware,adminMiddleware,upload.single('image'),adminProfile)


export default adminRouter