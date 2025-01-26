const express = require("express");
const router = express.Router();

const {
  register,
  verifyOtp,
  completeRegistration,
  loginUser,
  refreshToken,
  logout,
} = require("../controllers/userController");

const {
  handleValidationErrors,
} = require("../middlewares/handleValidationErrors");

const {
  emailValidation,
  otpValidation,
  nameValidation,
  passwordValidation,
  refreshTokenValidation,
} = require("../validations/validationSchemas");

// registration
router.post("/register", emailValidation, handleValidationErrors, register);

//verify-otp
router.post("/verify-otp", otpValidation, handleValidationErrors, verifyOtp);

//complete registration
router.post(
  "/complete-registration",
  [nameValidation, passwordValidation],
  handleValidationErrors,
  completeRegistration
);

// login
router.post(
  "/login",
  [emailValidation, passwordValidation],
  handleValidationErrors,
  loginUser
);

//refresh token
router.post(
  "/refresh-token",
  refreshTokenValidation,
  handleValidationErrors,
  refreshToken
);

//logout
router.post("/logout", logout);

module.exports = router;
