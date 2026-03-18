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