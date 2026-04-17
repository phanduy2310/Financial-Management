const Notification = require("../models/notification.model");
const sseManager = require("../sse/sse.manager");
const jwt = require("jsonwebtoken");

exports.list = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const data = await Notification.query()
      .where("user_id", req.user.id)
      .orderBy("created_at", "desc")
      .limit(limit);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unreadCount = async (req, res) => {
  try {
    const count = await Notification.query()
      .where("user_id", req.user.id)
      .where("is_read", false)
      .resultSize();

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.stream = (req, res) => {
  // Xác thực token qua query param (do EventSource không hỗ trợ header)
  const token = req.query.token;
  if (!token) return res.status(401).end();

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id || decoded.sub;
  } catch {
    return res.status(401).end();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Gửi ping mỗi 30s để giữ kết nối
  const keepAlive = setInterval(() => res.write(": ping\n\n"), 30000);

  sseManager.addClient(userId, res);

  req.on("close", () => {
    clearInterval(keepAlive);
    sseManager.removeClient(userId, res);
  });
};

exports.markRead = async (req, res) => {
  try {
    await Notification.query()
      .patch({
        is_read: true,
        read_at: new Date(),
      })
      .where({
        id: req.params.id,
        user_id: req.user.id,
      });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
