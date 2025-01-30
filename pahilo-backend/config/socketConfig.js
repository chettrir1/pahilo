const {
  notifyDrivers,
  notifyRider,
  notifyRiderRejection,
} = require("../services/socketService");

module.exports = function (wss, users, db) {
  wss.on("connection", (ws) => {
    ws.on("message", async (message) => {
      const messageData = message.toString();
      console.log("Received message:", messageData);

      try {
        const parsedMessage = JSON.parse(messageData);
        console.log("Received parsedMessage:", parsedMessage);

        const { event, rideDetails } = parsedMessage;

        if (!event || !rideDetails) {
          console.warn("Invalid message formate or rideDetails missing!");
          return;
        }

        const userId = rideDetails?.userId;
        // Store the user’s WebSocket connection
        if (userId) {
          users[userId] = ws;
          console.log(`User ${userId} connected!`);
        }

        switch (event) {
          case "requestRide":
            notifyDrivers(users, rideDetails);
            break;

          case "acceptRide":
            const { rideId, driverId, driverLatitude, driverLongitude } =
              rideDetails;

            if (!rideId || !driverLatitude || !driverLongitude) {
              console.warn(
                "Missing rideId, driverLatitude or driverLongitude in acceptRide event"
              );
              return;
            }
            const rider = await getRiderDetails(db, rideId);
            const driver = await getDriverDetails(db, driverId);

            if (rider && driver) {
              notifyRider(users, rider, rideId, driver);
            } else {
              console.error("Error: Rider or driver details not found!");
            }
            break;

          case "rejectRide":
            const { rejectedRideId } = rideDetails;
            if (!rejectedRideId) {
              console.warn("Missing rideId in rejectRide event");
              return;
            }
            const riderII = await getRiderDetails(db, rejectedRideId);

            notifyRiderRejection(users, riderII.id, rejectedRideId);
            break;

          default:
            console.warn("Unknown event received:", event);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      for (const userId in users) {
        if (users[userId] === ws) {
          console.log(`User ${userId} disconnected!`);
          delete users[userId];
          console.log("Users after disconnection:", Object.keys(users));
          break;
        }
      }
    });
  });
};

// Helper function to fetch user details
async function getRiderDetails(db, rideId) {
  const getRiderIdQuery = `SELECT rider_id FROM rides WHERE id = ?`;
  const [rideResult] = await db.execute(getRiderIdQuery, [rideId]);

  if (rideResult.length === 0) {
    throw new Error("Ride not found!");
  }

  const riderId = rideResult[0].rider_id;

  const query = `SELECT u.id, u.name
     FROM users u
     WHERE u.id = ?`;
  const [result] = await db.execute(query, [riderId]);

  if (result.length === 0) {
    throw new Error("User details not found!");
  }

  return result.length > 0
    ? {
        id: result[0].id,
        name: result[0].name,
      }
    : null;
}

async function getDriverDetails(db, userId) {
  const query = `SELECT u.id, u.name, d.latitude, d.longitude
     FROM users u
     Left JOIN drivers d ON u.id = d.driver_id
     WHERE u.id = ?`;

  const [result] = await db.execute(query, [userId]);
  return result.length > 0
    ? {
        id: result[0].id,
        name: result[0].name,
        location: {
          latitude: result[0].latitude,
          longitude: result[0].longitude,
        },
      }
    : null;
}
