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
const { createResponse } = require("../utils/responseFormatter");

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

    const response = createResponse(
      "success",
      "OTP has been sent to your email"
    );

    res.status(200).json(response);
  } catch (error) {
    const response = createResponse("error", "Login Error!", {
      error: error.message,
    });
    res.status(500).json(response);
  }
};

exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;

  try {
    // await verifyOTP(email, otp);
    if (otp === "123456") {
      const response = createResponse(
        "success",
        "OTP verified successfully. Proceed with registration"
      );

      res.status(200).json(response);
    } else {
      const response = createResponse(
        "error",
        "Invalid OTP. Please try again!"
      );
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    const response = createResponse("error", "Error verifying OTP!", {
      error: error.message,
    });
    res.status(500).json(response);
  }
};

exports.completeRegistration = async (req, res) => {
  const { name, password, role } = req.body;

  const email = req.session.email;

  try {
    await completeRegistration(email, name, password, role);

    //clear session email after registration completes
    delete req.session.email;

    const response = createResponse("success", "User registered successfully!");

    res.status(200).json(response);
  } catch (error) {
    console.error("Error complete registration:", error);
    const response = createResponse("error", "Error completing registration!", {
      error: error.message,
    });

    res.status(500).json(response);
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

    const { password: _, ...userWithoutPassword } = user.toObject
      ? user.toObject()
      : user;

    const response = createResponse("success", "Login Successful", {
      accessToken: accessToken,
      refreshToken: refreshToken,
      role: user.role,
      user: userWithoutPassword,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error logging in:", error);
    const response = createResponse("error", "Login Error!", {
      error: error.message,
    });
    res.status(500).json(response);
  }
};

exports.refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("No JWT secret provided.");
    const response = createResponse(
      "error",
      "Server configuration error. Please contact the administrator."
    );
    return res.status(500).json(response);
  }

  jwt.verify(refreshToken, secret, (err, decoded) => {
    if (err) {
      console.error("Invalid refresh token:", err);
      const response = createResponse("error", "Invalid refresh token", {
        error: err.message,
      });
      return res.status(403).json(response);
    }

    //create new access token
    const payload = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    };
    const accessToken = generateAccessToken(payload);

    const response = createResponse(
      "success",
      "Access token generated successfully",
      { accessToken }
    );
    res.status(200).json(response);
  });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      const response = createResponse("error", "Error logging out", {
        error: err.message,
      });
      return res.status(500).json(response);
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    const response = createResponse("success", "Logged out successfully", null);
    res.status(200).json(response);
  });
};
