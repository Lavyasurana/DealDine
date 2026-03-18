import UserCoupon from "../models/userCouponModel.js";


export const createCoupon = async (req, res) => {
  try {
    const { dealId } = req.body;

    const userId = req.user.id; // from authMiddleware

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
  
      return res.json({
        success: true,
        coupons
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
  
      const coupon = await UserCoupon.findById(couponId)
        .populate("deal")
        .populate("user");
  
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found"
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
  
      // ❗ Check if deal time has passed
      if (now > deal.validTill) {
        return res.status(400).json({
          success: false,
          message: "Coupon expired"
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