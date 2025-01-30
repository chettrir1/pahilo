const WebSocket = require("ws");

let wss;

function setWSS(wsServer) {
  wss = wsServer;
}

function notifyDrivers(user, rideDetails) {
  if (!wss) {
    console.error("WebSocket server is not initialized!");
    return;
  }

  if (!user) {
    console.error("User object is not defined!");
    return;
  }

  console.log("Notifying drivers about new ride request...");
  console.log("Ride details:", rideDetails);
  console.log("Connected users:", user);
  console.log("Total WebSocket clients:", wss.clients.size);

  wss.clients.forEach((client) => {
    console.log(`✅ Found user with role: ${user.role}`);

    if (user && user.role === "rider" && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          event: "newRideRequest",
          rideDetails,
        })
      );
    }
  });
}

function notifyRider(users, rider, rideId, driver) {
  const riderSocket = users[rider.id];

  console.log("Notifying rider about new accepted ride request...");
  console.log("Rider details:", rider);
  console.log("Driver details:", driver);

  if (riderSocket) {
    if (riderSocket.readyState === WebSocket.OPEN) {
      riderSocket.send(
        JSON.stringify({
          event: "rideAccepted",
          rideId,
          rider: {
            id: rider.id,
            name: rider.name,
          },
          driver: {
            id: driver.id,
            name: driver.name,
            location: driver.location,
          },
        })
      );
      console.log(`Notification sent to rider ${rider.id}`);
    } else {
      console.error(
        `Error: Rider socket exists but is not open for user ${rider.id}`
      );
    }
  } else {
    console.error(`Error: Rider socket not found for user ${rider.id}`);
  }
}

function notifyRiderRejection(user, riderId, rideId) {
  const riderSocket = user[riderId];

  if (riderSocket && riderSocket.readyState === WebSocket.OPEN) {
    riderSocket.send(
      JSON.stringify({
        event: "rideRejected",
        rideId,
      })
    );
  } else {
    console.error(`Error: Rider socket not found for ride ${rideId}`);
  }
}

module.exports = {
  setWSS,
  notifyDrivers,
  notifyRider,
  notifyRiderRejection,
};
