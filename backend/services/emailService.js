import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (payload) => resend.emails.send(payload);

// 🔥 Deal Email
export const sendDealEmail = async (email, deal) => {
  try {
    const html = `
  <div style="font-family: Arial, sans-serif; background:#ecfdf5; padding:20px;">
    
    <h1 style="color:#059669;">🔥 Deal Alert!</h1>
    
    <h2 style="margin-bottom:5px; color:#065f46;">
      ${deal.dealName}
    </h2>
    <p style="color:#047857;">
      at <b>${deal.resName}</b>
    </p>

    <img 
      src="${deal.image || 'https://via.placeholder.com/400'}" 
      style="width:100%; max-width:400px; border-radius:12px; margin:15px 0;"
    />

    <p style="font-size:16px; color:#065f46;">
      ${deal.description}
    </p>

    <div style="
      background:#d1fae5;
      padding:15px;
      border-radius:10px;
      text-align:center;
      margin:20px 0;
    ">
      <h2 style="margin:0; color:#059669;">
        Only ₹${deal.price}
      </h2>
      <p style="margin:5px 0; color:#047857;">
        ⏳ Limited Time Offer
      </p>
    </div>

    <a href="https://dealdine.in"
      style="
        display:inline-block;
        background:#059669;
        color:white;
        padding:12px 20px;
        text-decoration:none;
        border-radius:8px;
        font-weight:bold;
      "
    >
      Grab This Deal 🚀
    </a>

    <p style="margin-top:30px; font-size:12px; color:#065f46;">
      Hurry before it's gone! Deals like this don’t last long 😋
    </p>

  </div>

  `;

  const response = await sendEmail({
    from: "DealDine <noreply@dealdine.in>",
    reply_to: "dealdine24@gmail.com",
    to: email,
    subject: `🔥 ${deal.dealName} @ ₹${deal.price} – Don’t Miss Out!`,
    html,
    });
    return { success: true, email, response };
  } catch (error) {
    return { success: false, email, error };
  }
};

export const sendVerificationOtpEmail = async (email, otp) => {
  await sendEmail({
    from: "DealDine <noreply@dealdine.in>",
    reply_to: "dealdine24@gmail.com",
    to: email,
    subject: "Your DealDine verification code",
    html: `
      <h2>Your verification code is ${otp}</h2>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
};

export const sendContactEmail = async ({ name, email, message }) => {
  const html = `
    <h2>📩 New Contact Message</h2>
    <p><b>Name:</b> ${name}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Message:</b></p>
    <p>${message}</p>
  `;

  await sendEmail({
    from: "DealDine <noreply@dealdine.in>",
    reply_to: email,
    to: "dealdine24@gmail.com",
    subject: `New Contact from ${name}`,
    html,
  });
};

export const sendCouponPurchaseEmail = async (email, coupon) => {
  try {
    const validFrom = coupon.deal?.validFrom
      ? new Date(coupon.deal.validFrom).toLocaleString("en-IN")
      : "N/A";
    const validTill = coupon.deal?.validTill
      ? new Date(coupon.deal.validTill).toLocaleString("en-IN")
      : "N/A";

    const html = `
      <h2>Your coupon is ready 🎉</h2>
      <p>Thank you for your purchase on DealDine.</p>
      <p><b>Coupon ID:</b> ${coupon._id}</p>
      <p><b>Restaurant:</b> ${coupon.deal?.resName || "N/A"}</p>
      <p><b>Deal:</b> ${coupon.deal?.dealName || "N/A"}</p>
      <p><b>Price:</b> ₹${coupon.deal?.price ?? "N/A"}</p>
      <p><b>Valid From:</b> ${validFrom}</p>
      <p><b>Valid Till:</b> ${validTill}</p>
      <p>You can also view this coupon in your DealDine account anytime.</p>
    `;

    await sendEmail({
      from: "DealDine <noreply@dealdine.in>",
      reply_to: "dealdine24@gmail.com",
      to: email,
      subject: "Your DealDine coupon details",
      html,
    });
  } catch (error) {}
};
