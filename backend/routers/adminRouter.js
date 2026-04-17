import express from "express"
import {
  registerAdmin,
  loginAdmin,
  loginSuperAdmin,
  adminProfile,
  getAllAdmin,
  getCurrentAdmin,
  getCurrentSuperAdmin,
  logoutAdmin,
  createAdminBySuperAdmin,
  addCreditsToUser
} from "../controllers/adminController.js"
import { authMiddleware } from "../middleware/authmiddleware.js"
import { adminMiddleware, superAdminMiddleware } from "../middleware/adminMiddleware.js"
import { csrfMiddleware } from "../middleware/csrfMiddleware.js"
import { loginLimiter } from "../services/rateLimit.js"
import { upload } from "../middleware/multer.js"

const adminRouter = express.Router()

adminRouter.post('/register',registerAdmin)
adminRouter.post("/login",loginLimiter,loginAdmin)
adminRouter.post("/superadmin/login",loginLimiter,loginSuperAdmin)
adminRouter.post("/logout",authMiddleware,adminMiddleware,csrfMiddleware,logoutAdmin)
adminRouter.get("/me",authMiddleware,adminMiddleware,getCurrentAdmin)
adminRouter.get(
  "/superadmin/me",
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  getCurrentSuperAdmin
)
adminRouter.post("/profile",authMiddleware,adminMiddleware,csrfMiddleware,upload.single('image'),adminProfile)
adminRouter.get('/getallAdmin',getAllAdmin)
adminRouter.post(
  "/superadmin/register-admin",
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  csrfMiddleware,
  createAdminBySuperAdmin
)
adminRouter.post(
  "/superadmin/add-credits",
  authMiddleware,
  adminMiddleware,
  superAdminMiddleware,
  csrfMiddleware,
  addCreditsToUser
)


export default adminRouter
