const {
  requestRide,
  acceptRide,
  rejectRide,
} = require("../services/rideService");

exports.requestRide = async (req, res) => {
  const { pickupLocation, destinationLocation } = req.body;
  const { id, role } = req.user;
  if (role !== "rider") {
    return res.status(403).json({ error: "Only riders can request a ride" });
  }

  try {
    const rideDetails = await requestRide(
      id,
      pickupLocation,
      destinationLocation
    );
    res.status(200).json({
      message: "Ride requested successfully",
      rideId: rideDetails.rideId,
    });
  } catch (error) {
    console.error("Error requesting ride:", error);
    res.status(500).json({ error: "Error requesting ride!" });
  }
};

exports.acceptRide = async (req, res) => {
  const { rideId } = req.body;
  const { id, role } = req.user;

  if (role !== "driver") {
    return res.status(403).json({ error: "Only drivers can accept a ride" });
  }

  try {
    const result = await acceptRide(rideId, id);
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Error accepting ride:", error);
    res.status(500).json({ error: "Error accepting ride!" });
  }
};

exports.rejectRide = async (req, res) => {
  console.log("Body Info:", req.body);
  const { rideId } = req.body;
  const { id, role } = req.user;

  if (role !== "driver") {
    return res.status(403).json({ error: "Only drivers can reject a ride" });
  }

  try {
    const result = await rejectRide(rideId);
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Error rejecting ride:", error);
    res.status(500).json({ error: "Error rejecting ride!" });
  }
};
