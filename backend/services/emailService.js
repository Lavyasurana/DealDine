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

export const sendVerificationOtpEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
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

    console.log("✅ Verification OTP email sent:", response);
  } catch (error) {
    console.log("❌ OTP email failed:", error);
    throw error;
  }
};

export const sendContactEmail = async ({ name, email, message }) => {
  try {
    const html = `
      <h2>📩 New Contact Message</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b></p>
      <p>${message}</p>
    `;

    const response = await resend.emails.send({
      from: "DealDine <noreply@dealdine.in>",
      reply_to: email, // 👈 important (so you can reply directly)
      to: "dealdine24@gmail.com", // 👈 YOU receive message
      subject: `New Contact from ${name}`,
      html,
    });

    console.log("✅ Contact email sent:", response);
  } catch (error) {
    console.log("❌ Contact email failed:", error);
    throw error;
  }
};
