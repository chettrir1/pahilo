const WebSocket = require("ws");

let wss;

function setWSS(wsServer) {
  wss = wsServer;
}

function notifyDrivers(rideDetails) {
  if (!wss) {
    console.error("WebSocket server is not initialized!");
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          event: "newRideRequest",
          rideDetails,
        })
      );
    }
  });
}

function notifyRider(users, riderId, rideId, driverId) {
  const riderSocket = users[riderId];

  if (riderSocket) {
    riderSocket.send(
      JSON.stringify({
        event: "rideAccepted",
        rideId,
        driverId,
      })
    );
  }
}

function notifyRiderRejection(users, rideId) {
  const riderSocket = users[rideId];

  if (riderSocket) {
    riderSocket.send(
      JSON.stringify({
        event: "rideRejected",
        rideId,
      })
    );
  }
}

module.exports = {
  setWSS,
  notifyDrivers,
  notifyRider,
  notifyRiderRejection,
};
