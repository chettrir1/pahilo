const express = require("express");
const rideController = require("../controllers/rideController");

const router = express.router();

//Book a ride
router.post("/book", rideController.bookRide);