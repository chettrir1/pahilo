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

  console.log("Request body:", req.body); // Log the body for debugging
  console.log("User role:", role);

  if (
    !pickupLocation ||
    !destinationLocation ||
    !pickupLocation.pickupLatitude ||
    !pickupLocation.pickupLongitude ||
    !destinationLocation.destinationLatitude ||
    !destinationLocation.destinationLongitude
  ) {
    const response = createResponse(
      "error",
      "Invalid or missing pickup/destination location",
      null
    );
    return res.status(400).json(response);
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
  const { rideId, driverLocation } = req.body;
  const { id, role } = req.user;

  if (role !== "driver") {
    const response = createResponse(
      "error",
      "Only drivers can accept a ride",
      null
    );
    return res.status(403).json(response);
  }

  if (
    !driverLocation ||
    !driverLocation.latitude ||
    !driverLocation.longitude
  ) {
    const response = createResponse(
      "error",
      "Driver location is required to accept a ride",
      null
    );
    return res.status(400).json(response);
  }

  try {
    const result = await acceptRide(rideId, id, driverLocation);
    const response = createResponse("success", result.message, result.data);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error accepting ride:", error);

    let statusCode = 500;
    let errorMessage = "Error accepting ride!";

    if (error.message == "Ride not found or already accepted!") {
      statusCode = 404;
      errorMessage = error.message;
    }

    const response = createResponse("error", errorMessage, {
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

    let statusCode = 500;
    let errorMessage = "Error rejecting ride!";

    if (error.message === "Ride request is no longer available!") {
      statusCode = 404;
      errorMessage = error.message;
    }

    const response = createResponse("error", errorMessage, {
      error: error.message,
    });
    res.status(statusCode).json(response);
  }
};
