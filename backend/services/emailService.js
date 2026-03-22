import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
})

export const sendDealEmail = async (email, deal) => {

  const html = `
  <h2>🔥 New Deal Available!</h2>
  <p><b>Restaurant:</b> ${deal.resName}</p>
  <p><b>Deal:</b> ${deal.dealName}</p>
  <p>${deal.description}</p>
  <p>Price: ₹${deal.price}</p>

  
  `

  await transporter.sendMail({
    from: `"Deal Dine" <${process.env.EMAIL}>`,
    to: email,
    subject: "New Deal Available 🎉",
    html
  })
}

export const sendVerificationEmail = async (email, token) => {
  try {
    const url = `${process.env.FRONTEND_URL}/verify/${token}`;

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Verify your email",
      html: `<h2>Click below to verify your email</h2>
             <a href="${url}">${url}</a>`
    });

    console.log("✅ Verification email sent:", info.response);

  } catch (error) {
    console.log("❌ Email failed:", error.message);
    throw error;
  }
};