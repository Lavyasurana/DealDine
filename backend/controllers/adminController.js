import adminModel from "../models/adminModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { clearCsrfCookie, setCsrfCookie } from "../middleware/csrfMiddleware.js";

const MIN_PASSWORD_LENGTH = 8;
const normalizeEmail = (email = "") => email.trim().toLowerCase();
const getConfiguredSuperAdminEmail = () =>
  normalizeEmail(process.env.SUPERADMIN_EMAIL || "");
const isProduction = process.env.NODE_ENV === "production";

const getSharedCookieDomain = () => {
  if (!isProduction) {
    return undefined;
  }

  return ".dealdine.in";
};

const resolveAdminRole = (admin) => {
  const normalizedEmail = normalizeEmail(admin?.email);
  const configuredSuperAdminEmail = getConfiguredSuperAdminEmail();

  if (admin?.role === "superadmin") {
    return "superadmin";
  }

  if (configuredSuperAdminEmail && normalizedEmail === configuredSuperAdminEmail) {
    return "superadmin";
  }

  return "admin";
};

const createToken = (admin)=>{
  return jwt.sign(
    { id: admin._id, role: resolveAdminRole(admin), tokenType: "access" },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  )
}

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  domain: getSharedCookieDomain(),
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

const setAuthCookie = (res, token) => {
  res.cookie("access_token", token, getAuthCookieOptions());
  setCsrfCookie(res);
};

const clearAuthCookie = (res) => {
  res.clearCookie("access_token", getAuthCookieOptions());
  clearCsrfCookie(res);
};

const isStrongPassword = (password = "") =>
  typeof password === "string" &&
  password.length >= MIN_PASSWORD_LENGTH &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

/* REGISTER ADMIN */

export const registerAdmin = async(req,res)=>{
  try{
    const {name,email,password,restaurantName} = req.body
    const normalizedEmail = normalizeEmail(email);

    if (!name?.trim() || !normalizedEmail || !restaurantName?.trim()) {
      return res.status(400).json({ success: false, message: "Name, email and restaurant name are required" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include uppercase, lowercase, and a number"
      });
    }
    const allowed = await allowedModel.findOne({ email: normalizedEmail });

    if (!allowed) {
      return res.json({
        success: false,
        message: "You are not authorized to register"
      });
    }

    const existing = await adminModel.findOne({ email: normalizedEmail })

    if(existing){
      return res.json({
        success:false,
        message:"Admin already exists"
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const admin = new adminModel({
      name,
      email: normalizedEmail,
      restaurantName,
      password:hashedPassword,
      role: normalizedEmail === getConfiguredSuperAdminEmail() ? "superadmin" : "admin"
    })

    await admin.save()

   

    res.json({
      success:true,
     
    })

  }catch(error){

    console.log(error)

    res.json({
      success:false,
      message:"Error creating admin"
    })

  }
}


/* LOGIN ADMIN */

export const loginAdmin = async(req,res)=>{
  try{

    const {email,password} = req.body
    const normalizedEmail = normalizeEmail(email);
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await adminModel.findOne({ email: normalizedEmail })

    if(!admin){
      return res.json({
        success:false,
        message:"email or password wrong"
      })
    }

    const isMatch = await bcrypt.compare(password,admin.password)

    if(!isMatch){
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec delay
      return res.json({
        success:false,
        message:"email or password wrong"
      })
    }

    admin.lastLogin = new Date()
    await admin.save()

    const token = createToken(admin)
    setAuthCookie(res, token);

    res.json({
      success:true
    })

  }catch(error){

    console.log(error)

    res.json({
      success:false,
      message:"Login failed"
    })

  }
}

export const getCurrentAdmin = async (req, res) => {
  try {
    if (!req.cookies?.csrf_token) {
      setCsrfCookie(res);
    }

    const admin = await adminModel.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const adminObject = admin.toObject();
    adminObject.role = resolveAdminRole(admin);

    return res.json({ success: true, admin: adminObject });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch admin" });
  }
};

export const logoutAdmin = async (_req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true, message: "Logged out successfully" });
};


import cloudinary from "../config/cloudinary.js";
import allowedAdminModel from "../models/allowedAdminModel.js"
import allowedModel from "../models/allowedAdminModel.js"

export const adminProfile = async (req, res) => {
  try {
    const { restaurantName, location, town } = req.body;
    const userId = req.user.id;

    let imageUrl = "";

    // multer uses memoryStorage, so uploaded files are available as buffers.
    if (req.file) {
      const fileUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(fileUri, {
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    }

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId,
      {
        restaurantName,
        location,
        town,
        ...(imageUrl && { imageUrl }) // update image only if exists
      },
      { new: true } // returns updated doc
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
};




export const getAllAdmin = async (req, res) => {
  try {
    const admins = await adminModel.find({
      imageUrl: { $nin: [null, ""] }
    })
    .select("-name -email -password -createdAt -lastLogin");

    res.json({
      success: true,
      admins
    });

  } catch (error) {
    res.json({
      success: false,
      error
    });
  }
};
