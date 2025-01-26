const argon2 = require("argon2");
const db = require("../services/db");
const { sendOTPEmail } = require("../services/emailService");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function storeOtpInDatabase(email, otp) {
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  const query =
    "INSERT INTO otp_verification (email, otp, otp_expiry) VALUES (?,?,?)";
  await db.execute(query, [email, otp, otpExpiry]);
}

async function sendOTP(email) {
  const otp = generateOTP();
  await storeOtpInDatabase(email, otp);
  await sendOTPEmail(email, otp);
  return { message: "OTP sent to your email. Please verify." };
}

async function completeRegistration(email, name, password) {
  const hashedPassword = await argon2.hash(password);

  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  await db.execute(query, [name, email, hashedPassword]);

  const deleteOtpQuery = "DELETE FROM otp_verification WHERE email = ?";
  await db.execute(deleteOtpQuery, [email]);

  return { message: "User registered successfully!" };
}

async function loginUser(email, password) {
  const query = "SELECT * FROM users WHERE email = ? LIMIT 1";
  const [users] = await db.query(query, [email]);

  if (users.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = users[0];

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return user;
}

function generateAccessToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

function generateRefreshToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: "1d" });
}

module.exports = {
  sendOTP,
  completeRegistration,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
};
