const { body } = require("express-validator");

exports.emailValidation = body("email")
  .isEmail()
  .withMessage("Invalid email format!");

exports.otpValidation = body("otp")
  .isNumeric()
  .withMessage("OTP must be numeric")
  .isLength({ min: 6, max: 6 })
  .withMessage("OTP must be a 6-digit number!");

exports.nameValidation = body("name")
  .notEmpty()
  .withMessage("Name is required!");

exports.passwordValidation = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long!");

exports.refreshTokenValidation = body("refreshToken")
  .notEmpty()
  .withMessage("Refresh token is required!");
