import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";
import allowedModel from "../models/allowedAdminModel.js";
import userModel from "../models/userModel.js";
import Bill from "../models/billModel.js";
import { clearCsrfCookie, setCsrfCookie } from "../middleware/csrfMiddleware.js";

const MIN_PASSWORD_LENGTH = 8;
const normalizeEmail = (email = "") => email.trim().toLowerCase();
const getConfiguredSuperAdminEmail = () =>
  normalizeEmail(process.env.SUPERADMIN_EMAIL || "");
const isProduction = process.env.NODE_ENV === "production";
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const createToken = (admin) =>
  jwt.sign(
    { id: admin._id, role: resolveAdminRole(admin), tokenType: "access" },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  domain: getSharedCookieDomain(),
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
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

export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await adminModel.findOne({ email: normalizedEmail });

    if (!admin || resolveAdminRole(admin) !== "superadmin") {
      return res.json({
        success: false,
        message: "email or password wrong",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return res.json({
        success: false,
        message: "email or password wrong",
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = createToken(admin);
    setAuthCookie(res, token);

    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Login failed",
    });
  }
};

export const getCurrentSuperAdmin = async (req, res) => {
  try {
    if (!req.cookies?.csrf_token) {
      setCsrfCookie(res);
    }

    const admin = await adminModel.findById(req.user.id).select("-password");

    if (!admin || resolveAdminRole(admin) !== "superadmin") {
      return res.status(404).json({
        success: false,
        message: "Superadmin not found",
      });
    }

    const adminObject = admin.toObject();
    adminObject.role = "superadmin";

    return res.json({
      success: true,
      admin: adminObject,
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch superadmin",
    });
  }
};

export const logoutSuperAdmin = async (_req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true, message: "Logged out successfully" });
};

export const createAdminBySuperAdmin = async (req, res) => {
  try {
    const { name, email, password, restaurantName } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name?.trim() || !normalizedEmail || !restaurantName?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and restaurant name are required",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
      });
    }

    const allowed = await allowedModel.findOne({ email: normalizedEmail });
    if (!allowed) {
      return res.status(400).json({
        success: false,
        message: "This admin email is not present in allowed admins",
      });
    }

    const existingAdmin = await adminModel.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await adminModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      restaurantName: restaurantName.trim(),
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        restaurantName: admin.restaurantName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
};

export const addCreditsToUser = async (req, res) => {
  try {
    const { userId, credits } = req.body;
    const parsedCredits = Number(credits);

    if (!userId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ObjectId is required",
      });
    }

    if (!Number.isFinite(parsedCredits) || parsedCredits <= 0) {
      return res.status(400).json({
        success: false,
        message: "Credits must be a positive number",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      userId.trim(),
      { $inc: { credits: parsedCredits } },
      { new: true }
    ).select("firstName lastName email credits");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Credits added successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to add credits",
    });
  }
};

export const getRestaurantBillsForSuperAdmin = async (req, res) => {
  try {
    const restaurantName = req.query?.restaurantName?.trim();

    if (!restaurantName) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    const restaurantAdmin = await adminModel
      .findOne({
        restaurantName: {
          $regex: `^${escapeRegex(restaurantName)}$`,
          $options: "i",
        },
      })
      .select("_id name email restaurantName");

    if (!restaurantAdmin) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const bills = await Bill.find({ admin: restaurantAdmin._id })
      .populate("user", "firstName lastName email")
      .populate("deal", "dealName resName price")
      .populate("coupon", "couponCode issuedAt usedAt")
      .sort({ createdAt: -1 });

    const totalBillAmount = bills.reduce(
      (sum, bill) => sum + (Number(bill.billAmount) || 0),
      0
    );

    return res.json({
      success: true,
      restaurant: {
        id: restaurantAdmin._id,
        name: restaurantAdmin.restaurantName,
        adminName: restaurantAdmin.name,
        adminEmail: restaurantAdmin.email,
      },
      bills,
      totalBillAmount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant bills",
    });
  }
};
