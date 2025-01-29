const db = require("../services/db");
const {
  notifyDrivers,
  notifyRider,
  notifyRiderRejection,
} = require("../services/socketService");
const { createResponse } = require("../utils/responseFormatter");

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
  return createResponse("success", "Ride requested successfully", rideDetails);
}

async function acceptRide(rideId, driverId) {
  const query =
    "UPDATE rides SET status = 'accepted', driver_id = ? WHERE id = ? AND status= 'pending'";

  const [result] = await db.execute(query, [driverId, rideId]);

  if (result.affectedRows === 0) {
    throw new Error("Ride not found or already accepted!");
  }

  const getRideQuery = `
    SELECT r.rider_id, u.name AS rider_name
    FROM rides r
    JOIN users u ON r.rider_id = u.id
    WHERE r.id = ?
  `;

  const [rideDetails] = await db.execute(getRideQuery, [rideId]);

  if (rideDetails.length === 0) {
    throw new Error("Ride not found!");
  }

  const rider = {
    id: rideDetails[0].rider_id,
    name: rideDetails[0].rider_name,
  };

  const getDriverQuery = `
    SELECT id, name
    FROM users WHERE id = ?
  `;

  const [driverDetails] = await db.execute(getDriverQuery, [driverId]);

  if (driverDetails.length === 0) {
    throw new Error("Driver not found!");
  }

  const driver = {
    id: driverDetails[0].id,
    name: driverDetails[0].name,
  };

  notifyRider(rideId, rider, driver);

  return createResponse("success", "Ride accepted successfully", {
    rideId,
    driver,
  });
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
  return createResponse("success", "Ride rejected successfully", { rideId });
}

module.exports = { requestRide, acceptRide, rejectRide };
