const db = require("../services/db");
const {
  notifyDrivers,
  notifyRider,
  notifyRiderRejection,
} = require("../services/socketService");

async function requestRide(userId, pickupLocation, destinationLocation) {
  if (!pickupLocation || !destinationLocation) {
    throw new Error("Missing pickup or destination location.");
  }

  const { pickupLatitude, pickupLongitude } = pickupLocation;
  const { destinationLatitude, destinationLongitude } = destinationLocation;

  if (
    pickupLatitude === undefined ||
    pickupLongitude === undefined ||
    destinationLatitude === undefined ||
    destinationLongitude === undefined
  ) {
    throw new Error("Missing latitude or longitude values.");
  }

  const query =
    "INSERT INTO rides (rider_id, pickup_latitude, pickup_longitude, destination_latitude, destination_longitude, status) VALUES (?, ?, ?, ?, ?, 'pending')";

  const [result] = await db.execute(query, [
    userId,
    pickupLatitude,
    pickupLongitude,
    destinationLatitude,
    destinationLongitude,
  ]);

  const rideDetails = {
    rideId: result.insertId,
    pickupLocation,
    destinationLocation,
  };

  notifyDrivers(rideDetails);
  return rideDetails;
}

async function acceptRide(rideId, driverId) {
  const query =
    "UPDATE rides SET status = 'accepted', driver_id = ? WHERE id = ? AND status= 'pending'";

  const [result] = await db.execute(query, [driverId, rideId]);

  if (result.affectedRows === 0) {
    throw new Error("Ride not found or already accepted!");
  }

  const getRideQuery = "SELECT rider_id FROM rides WHERE id = ?";
  const [rideDetails] = await db.execute(getRideQuery, [rideId]);

  if (rideDetails.length === 0) {
    throw new Error("Ride not found!");
  }

  const riderId = rideDetails[0].rider_id;

  notifyRider(riderId, rideId, driverId);

  return { message: "Ride accepted successfully!" };
}

async function rejectRide(rideId) {
  console.log("Rejecting Ride ID:", rideId);

  const query =
    "UPDATE rides SET status = 'rejected' WHERE id = ? AND status = 'pending'";

  console.log("Executing SQL Query:", query, [rideId]);

  const [result] = await db.execute(query, [rideId]);
  console.log("Query Result:", result);

  if (result.affectedRows === 0) {
    throw new Error("Ride request is no longer available!");
  }

  notifyRiderRejection(rideId);
  return { message: "Ride rejected successfully!" };
}

module.exports = { requestRide, acceptRide, rejectRide };
