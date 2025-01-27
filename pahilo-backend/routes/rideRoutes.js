const express = require("express");
const {
  requestRide,
  acceptRide,
  rejectRide,
} = require("../controllers/rideController");

const authenticateJWT = require("../middlewares/auth");

const router = express.Router();

// Ride request endpoint (only accessible by authenticated riders)
router.post("/request-ride", authenticateJWT, requestRide);

// Ride accept endpoint (only accessible by drivers)
router.post("/accept-ride", authenticateJWT, acceptRide);

// Ride reject endpoint (only accessible by drivers)
router.post("/reject-ride", authenticateJWT, rejectRide);

module.exports = router;
