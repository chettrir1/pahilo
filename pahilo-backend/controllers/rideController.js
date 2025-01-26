const db = require("../services/db");

exports.bookRide = async (req, res) => {
  const { userId, pickupLocation, dropOffLocation } = req.body;

  const fare = calculateFare(pickupLocation, dropOffLocation);

  if (!userId || !pickupLocation || !dropOffLocation) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const query =
    "INSERT INTO rides (user_id, pickup_location, drop_off_location, fare) VALUES (?, ?, ?,?)";

  try {
    await db.execute(query, [userId, pickupLocation, dropOffLocation, fare]);
    res.status(201).json({ message: "Ride booked successfully", fare });
  } catch (error) {
    res.status(500).json({ error: "Error booking ride!" });
  }
};

const calculateFare = async (pickupLocation, dropOffLocation) => {
  //TOTO replace with actual logic later
  return 10.0;
};
