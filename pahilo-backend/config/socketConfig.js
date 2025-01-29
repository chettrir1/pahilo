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

        const { event, rideDetails, userId } = parsedMessage;

        // Store the user’s WebSocket connection
        if (userId) {
          users[userId] = ws;
        }

        switch (event) {
          case "requestRide":
            notifyDrivers(rideDetails);
            break;

          case "acceptRide":
            const { rideId, driverId, riderId } = rideDetails;
            const rider = await getUserDetails(db, riderId);
            const driver = await getUserDetails(db, driverId);

            if (rider && driver) {
              notifyRider(users, rider, rideId, driver);
              notifyDrivers(users, driver, rideId, rider);
            } else {
              console.error("Error: Rider or driver details not found!");
            }
            break;

          case "rejectRide":
            const { rideId: rejectedRideId } = rideDetails;
            notifyRiderRejection(rejectedRideId);
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
          delete users[userId];
          break;
        }
      }
      console.log("Client disconnected");
    });
  });
};

// Helper function to fetch user details
async function getUserDetails(db, userId) {
  const query =
    "SELECT id, name, phone, profile_picture FROM users WHERE id = ?";
  const [result] = await db.execute(query, [userId]);
  return result.length > 0 ? result[0] : null;
}
