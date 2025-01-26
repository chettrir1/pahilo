const nodemailer = require("nodemailer");

async function sendOTPEmail(email, otp) {
  const fromEmail = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASS;

  if (!email || !password) {
    console.error("No email credentials provided.");
    return;
  }

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: fromEmail,
      pass: password,
    },
  });

  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: "Your One-Time Password (OTP) for Email Verification",
    text: `Hello,
        
        Thank you for registering with our app! To complete your email verification, please use the following One-Time Password (OTP):
        OTP: ${otp}
        
        This code is valid for the next 10 minutes. If you did not request this, please ignore this email.
        
        Best regards,
        The Pahilo Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP send successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}

module.exports = { sendOTPEmail };
