const db = require("../services/db");

async function verifyOTP(email, otp) {
  const query =
    "SELECT * FROM otp_verification WHERE email = ? ORDER BY created_at DESC LIMIT 1";
  const [otpRecords] = await db.execute(query, [email]);

  if (otpRecords.length === 0) {
    throw new Error("OTP not generated for this email!");
  }

  const record = otpRecords[0];

  const currentTime = new Date();

  if (record.otp !== otp) {
    throw new Error("Invalid OTP!");
  }

  if (currentTime > record.otp_expiry) {
    throw new Error("OTP has expired!");
  }

  return true;
}

module.exports = { verifyOTP };
