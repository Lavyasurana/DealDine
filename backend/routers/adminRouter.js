import express from "express"
import {
  registerAdmin,
  loginAdmin,
  adminProfile,
  getAllAdmin,
  getCurrentAdmin,
  logoutAdmin
} from "../controllers/adminController.js"
import { authMiddleware } from "../middleware/authmiddleware.js"
import { adminMiddleware } from "../middleware/adminMiddleware.js"
import { csrfMiddleware } from "../middleware/csrfMiddleware.js"
import { loginLimiter } from "../services/rateLimit.js"
import { upload } from "../middleware/multer.js"

const adminRouter = express.Router()

adminRouter.post('/register',registerAdmin)
adminRouter.post("/login",loginLimiter,loginAdmin)
adminRouter.post("/logout",authMiddleware,adminMiddleware,csrfMiddleware,logoutAdmin)
adminRouter.get("/me",authMiddleware,adminMiddleware,getCurrentAdmin)
adminRouter.post("/profile",authMiddleware,adminMiddleware,csrfMiddleware,upload.single('image'),adminProfile)
adminRouter.get('/getallAdmin',getAllAdmin)


export default adminRouter
