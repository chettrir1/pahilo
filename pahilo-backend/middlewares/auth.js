const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const secret = process.env.JWT_SECRET;

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateJWT };
