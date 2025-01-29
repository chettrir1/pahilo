const {
  requestRide,
  acceptRide,
  rejectRide,
} = require("../services/rideService");
const { createResponse } = require("../utils/responseFormatter");

exports.requestRide = async (req, res) => {
  const { pickupLocation, destinationLocation } = req.body;
  const { id, role } = req.user;
  if (role !== "rider") {
    const response = createResponse(
      "error",
      "Only riders can request a ride",
      null
    );
    return res.status(403).json(response);
  }

  try {
    const rideDetails = await requestRide(
      id,
      pickupLocation,
      destinationLocation
    );
    const response = createResponse("success", "Ride requested successfully", {
      rideId: rideDetails.rideId,
    });
    res.status(200).json(response);
  } catch (error) {
    console.error("Error requesting ride:", error);
    const response = createResponse("error", "Error requesting ride!", {
      error: error.message,
    });
    res.status(500).json(response);
  }
};

exports.acceptRide = async (req, res) => {
  const { rideId } = req.body;
  const { id, role } = req.user;

  if (role !== "driver") {
    const response = createResponse(
      "error",
      "Only drivers can accept a ride",
      null
    );
    return res.status(403).json(response);
  }

  try {
    const result = await acceptRide(rideId, id);
    const response = createResponse("success", result.message, null);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error accepting ride:", error);
    const response = createResponse("error", "Error accepting ride!", {
      error: error.message,
    });
    res.status(500).json(response);
  }
};

exports.rejectRide = async (req, res) => {
  console.log("Body Info:", req.body);
  const { rideId } = req.body;
  const { id, role } = req.user;

  if (role !== "driver") {
    const response = createResponse(
      "error",
      "Only drivers can reject a ride",
      null
    );
    return res.status(403).json(response);
  }

  try {
    const result = await rejectRide(rideId);
    const response = createResponse("success", result.message, null);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error rejecting ride:", error);
    const response = createResponse("error", "Error rejecting ride!", {
      error: error.message,
    });
    res.status(500).json(response);
  }
};
