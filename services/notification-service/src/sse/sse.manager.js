// Quản lý SSE connections theo user_id
const clients = new Map();

exports.addClient = (userId, res) => {
  const key = String(userId);
  if (!clients.has(key)) {
    clients.set(key, new Set());
  }
  clients.get(key).add(res);
};

exports.removeClient = (userId, res) => {
  const key = String(userId);
  if (clients.has(key)) {
    clients.get(key).delete(res);
    if (clients.get(key).size === 0) {
      clients.delete(key);
    }
  }
};

exports.sendToUser = (userId, data) => {
  const key = String(userId);
  if (!clients.has(key)) return;
  let message;
  try {
    message = `data: ${JSON.stringify(data)}\n\n`;
  } catch (err) {
    console.error("[SSE] JSON.stringify failed:", err.message);
    return;
  }
  for (const res of clients.get(key)) {
    try {
      res.write(message);
    } catch (err) {
      console.error("[SSE] res.write failed:", err.message);
    }
  }
};
