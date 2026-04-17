const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.id ?? payload.sub,
      role: payload.role,
    };

    if (!req.user.id) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};
