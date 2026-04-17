const NotificationProcessor = require("../core/notification.processor");

exports.publish = async (req, res) => {
  const { event, user_id, payload, channels, source_service } = req.body;

  if (!event || !user_id) {
    return res.status(400).json({ message: "event và user_id là bắt buộc" });
  }

  try {
    const notification = await NotificationProcessor.process({
      event,
      user_id,
      payload,
      channels: channels || ["web"],
      source_service,
    });

    res.json({ success: true, data: notification });
  } catch (err) {
    console.error(`[Notification publish error] event=${event}`, err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
