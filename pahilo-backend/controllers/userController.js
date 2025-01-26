const {
  sendOTP,
  completeRegistration,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
} = require("../services/userService");
const { verifyOTP } = require("../services/otpService");
const jwt = require("jsonwebtoken");
const db = require("../services/db");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
  const { email } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = ? LIMIT 1";
    const [existingUser] = await db.execute(query, [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already exists!" });
    }

    //save the email in temporary storage
    req.session.email = email;

    res
      .status(200)
      .json({ message: "OTP has been sent to your email.(123456)" });
  } catch (error) {
    res.status(500).json({ error: "Error sending OTP!" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;

  try {
    // await verifyOTP(email, otp);
    if (otp === "123456") {
      res.status(200).json({
        message: "OTP verified successfully. Proceed with registration",
      });
    } else {
      res.status(500).json({ error: "Invalid OTP!" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.completeRegistration = async (req, res) => {
  const { name, password } = req.body;
  const email = req.session.email;

  try {
    const response = await completeRegistration(email, name, password);

    //clear session email after registration completes
    delete req.session.email;

    res.status(200).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error complete registration:", error);
    res.status(500).json({ error: "Error completing registration!" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successful",
      accessToken: accessToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in!" });
  }
};

exports.refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("No JWT secret provided.");
    return res.status(500).json({
      error: "Server configuration error. Please contact the administrator!",
    });
  }

  jwt.verify(refreshToken, secret, (err, decoded) => {
    if (err) {
      console.error("Invalid refresh token:", err);
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    //create new access token
    const payload = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    };
    const accessToken = generateAccessToken(payload);

    res.status(200).json({
      accessToken: accessToken,
    });
  });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: "Error logging out" });
    }
    res.clearCookie("refreshToken", {
      httoOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logged out successfully" });
  });
};
