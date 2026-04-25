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
import multer from "multer"

const adminRouter = express.Router()
const uploadAdminProfileImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Image size must be 5MB or smaller",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Invalid image upload",
    });
  });
}

adminRouter.post('/register',registerAdmin)
adminRouter.post("/login",loginLimiter,loginAdmin)
adminRouter.post("/logout",authMiddleware,adminMiddleware,csrfMiddleware,logoutAdmin)
adminRouter.get("/me",authMiddleware,adminMiddleware,getCurrentAdmin)
adminRouter.post("/profile",authMiddleware,adminMiddleware,csrfMiddleware,uploadAdminProfileImage,adminProfile)
adminRouter.get('/getallAdmin',getAllAdmin)


export default adminRouter
