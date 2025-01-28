const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Getting token from Authorization header

  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  console.log(token);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token." });
    }
    req.user = user; // Attach user to the request object
    next(); // Move on to the next middleware or route handler
  });
};

module.exports = authenticateJWT;
