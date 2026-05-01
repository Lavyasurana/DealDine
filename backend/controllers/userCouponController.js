import UserCoupon from "../models/userCouponModel.js";
import dealModel from "../models/dealModel.js";
import Bill from "../models/billModel.js";
import { sendCouponPurchaseEmail } from "../services/emailService.js";
import { isDealLiveAt } from "../utils/dealSchedule.js";

const hasReachedClaimLimit = async (dealId, maxRedemptions) => {
  const totalClaims = await UserCoupon.countDocuments({ deal: dealId });
  return totalClaims >= maxRedemptions;
};

export const createCoupon = async (req, res) => {
  try {
    const { dealId } = req.body;

    const userId = req.user.id; // from authMiddleware
    const deal = await dealModel.findById(dealId);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found"
      });
    }

    if (deal.validTill && new Date() > new Date(deal.validTill)) {
      return res.status(400).json({
        success: false,
        message: "This deal is no longer available"
      });
    }

    if (await hasReachedClaimLimit(dealId, deal.maxRedemptions)) {
      return res.status(400).json({
        success: false,
        message: "This deal is no longer available"
      });
    }

    // Prevent duplicate purchase
    const existing = await UserCoupon.findOne({
      user: userId,
      deal: dealId,
      isUsed: false
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already own this coupon"
      });
    }

    const coupon = await UserCoupon.create({
      user: userId,
      deal: dealId
    });

    await coupon.populate("deal");
    await coupon.populate("user");
    await sendCouponPurchaseEmail(coupon.user.email, coupon);

    return res.json({
      success: true,
      coupon
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon"
    });
  }
};

export const getMyCoupons = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const coupons = await UserCoupon.find({ user: userId })
        .populate("deal")
        .sort({ issuedAt: -1 });

      const validCoupons = coupons.filter((coupon) => coupon.deal);
  
      return res.json({
        success: true,
        coupons: validCoupons
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch coupons"
      });
    }
  };

  export const getCouponById = async (req, res) => {
    try {
      const { couponId } = req.params;
      const requesterId = req.user.id;
      const isAdmin = req.user.role === "admin";
  
      const coupon = await UserCoupon.findById(couponId)
        .populate("deal")
        .populate("user");
  
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found"
        });
      }

      if (!coupon.deal) {
        return res.status(404).json({
          success: false,
          message: "This coupon's deal is no longer available"
        });
      }

      const couponOwnerId = coupon.user?._id?.toString();
      if (!isAdmin && couponOwnerId !== requesterId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this coupon"
        });
      }
  
      return res.json({
        success: true,
        coupon
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error fetching coupon"
      });
    }
  };



export const redeemCoupon = async (req, res) => {
    try {
  
      const { couponId } = req.params;
      const adminId = req.user.id;
  
      const coupon = await UserCoupon.findById(couponId).populate("deal");
  
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found"
        });
      }
  
      const deal = coupon.deal;

      if (!deal) {
        return res.status(404).json({
          success: false,
          message: "This coupon's deal is no longer available"
        });
      }
  
      // Check admin ownership
      if (deal.admin.toString() !== adminId) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to redeem this coupon"
        });
      }
  
      // Check if already used
      if (coupon.isUsed) {
        return res.status(400).json({
          success: false,
          message: "Coupon already used"
        });
      }
  
      const now = new Date();
  
      // The coupon can only be redeemed during one of the scheduled deal slots.
      if (now > deal.validTill) {
        return res.status(400).json({
          success: false,
          message: "Coupon expired"
        });
      }

      if (!isDealLiveAt(deal, now)) {
        return res.status(400).json({
          success: false,
          message: "This coupon can only be redeemed during the deal's scheduled time"
        });
      }
  
      coupon.isUsed = true;
      coupon.usedAt = new Date();
  
      await coupon.save();
  
      return res.json({
        success: true,
        message: "Coupon redeemed successfully"
      });
  
    } catch (error) {
  
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to redeem coupon"
      });
  
    }
  };

export const getAdminRedeemedCoupons = async (req, res) => {
  try {
    const adminId = req.user.id;

    const coupons = await UserCoupon.find({ isUsed: true })
      .populate("user", "firstName lastName email")
      .populate("deal");

    const bills = await Bill.find({ admin: adminId });
    const billsByCouponId = new Map(
      bills.map((bill) => [bill.coupon.toString(), bill])
    );

    const adminCoupons = coupons
      .filter((coupon) => coupon.deal?.admin?.toString() === adminId)
      .filter((coupon) => !billsByCouponId.has(coupon._id.toString()))
      .map((coupon) => ({
        ...coupon.toObject(),
        bill: billsByCouponId.get(coupon._id.toString()) || null,
      }))
      .sort((a, b) => new Date(b.usedAt || 0) - new Date(a.usedAt || 0));

    return res.json({
      success: true,
      coupons: adminCoupons
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch redeemed coupons"
    });
  }
};

export const updateCouponBill = async (req, res) => {
  try {
    const { couponId } = req.params;
    const adminId = req.user.id;
    const parsedBillAmount = Number(req.body?.billAmount);

    if (!Number.isFinite(parsedBillAmount) || parsedBillAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid bill amount"
      });
    }

    const coupon = await UserCoupon.findById(couponId).populate("deal");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    if (!coupon.deal) {
      return res.status(404).json({
        success: false,
        message: "This coupon's deal is no longer available"
      });
    }

    if (coupon.deal.admin.toString() !== adminId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this coupon"
      });
    }

    if (!coupon.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Redeem the coupon before adding the bill amount"
      });
    }

    const bill = await Bill.findOneAndUpdate(
      { coupon: coupon._id },
      {
        coupon: coupon._id,
        deal: coupon.deal._id,
        user: coupon.user,
        admin: adminId,
        billAmount: parsedBillAmount,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({
      success: true,
      message: "Bill amount saved successfully",
      bill
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to save bill amount"
    });
  }
};
