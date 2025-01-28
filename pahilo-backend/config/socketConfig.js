const {
  notifyDrivers,
  notifyRider,
  notifyRiderRejection,
} = require("../services/socketService");

module.exports = function (wss, users) {
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      const messageData = message.toString();

      console.log("Received message:", messageData);

      try {
        const parsedMessage = JSON.parse(messageData);
        console.log("Received parsedMessage:", parsedMessage);

        const { event, rideDetails, userId } = parsedMessage;

        if (userId) {
          users[userId] = ws;
        }
        if (event === "requestRide") {
          notifyDrivers(rideDetails);
        }

        if (event === "acceptRide") {
          const { rideId, driverId, riderId } = rideDetails;
          notifyRider(users, riderId, riderId, driverId);
        }

        if (event === "rejectRide") {
          const { rideId } = rideDetails;
          notifyRiderRejection(rideId);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      for (let userId in users) {
        if (users[userId] === ws) {
          delete users[userId];
          break;
        }
      }
      console.log("Client disconnected");
    });
  });
};
