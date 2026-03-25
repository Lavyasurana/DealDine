import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔥 Deal Email
export const sendDealEmail = async (email, deal) => {
  try {
    const html = `
      <h2>🔥 New Deal Available!</h2>
      <p><b>Restaurant:</b> ${deal.resName}</p>
      <p><b>Deal:</b> ${deal.dealName}</p>
      <p>${deal.description}</p>
      <p>Price: ₹${deal.price}</p>
    `;

    const response = await resend.emails.send({
      from: "DealDine <noreply@dealdine.in>", // ✅ use domain
      reply_to: "dealdine24@gmail.com",
      to: email,
      subject: "New Deal Available 🎉",
      html,
    });

    
  } catch (error) {
    console.log("❌ Deal email failed:", error);
  }
};

// 🔐 Verification Email
export const sendVerificationEmail = async (email, token) => {
  try {
    const url = `${process.env.FRONTEND_URL}/verify/${token}`;

    const response = await resend.emails.send({
      from: "DealDine <noreply@dealdine.in>", // ✅ use domain
      reply_to: "dealdine24@gmail.com",
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Click below to verify your email</h2>
        <a href="${url}">${url}</a>
      `,
    });

    console.log("✅ Verification email sent:", response);
  } catch (error) {
    console.log("❌ Email failed:", error);
    throw error;
  }
};