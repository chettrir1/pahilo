const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = "1h";

  const payload = { id: user.id, name: user.email };

  return jwt.sign(payload, secret, { expiresIn });
}

function generateRefreshToken(user) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = "1d";

  const payload = { id: user.id, email: user.email };

  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = { generateAccessToken, generateRefreshToken };
