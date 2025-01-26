const express = require("express");
const {
  requestRide,
  acceptRide,
  rejectRide,
} = require("../controllers/rideController");
const authenticateJWT = require("../middlewares/auth");

module.exports = (app) => {
  const router = express.Router();

  //request-ride
  router.post("/request-ride", authenticateJWT, requestRide);

  //accept-ride
  router.post("/accept-ride", authenticateJWT, acceptRide);

  //reject-ride
  router.post("/reject-ride", authenticateJWT, rejectRide);

  app.use("/api/rides", router);
};
