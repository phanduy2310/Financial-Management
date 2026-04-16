// core/notification.processor.js
const Notification = require("../models/notification.model");
const Factory = require("./notification.factory");
const sseManager = require("../sse/sse.manager");

exports.process = async ({
  event,
  user_id,
  payload = {},
  channels = ["web"],
  source_service,
}) => {
  const template = Factory[event];
  if (!template) throw new Error(`Unsupported event: ${event}`);

  const content = template({ payload });

  // 1. Lưu DB
  const notification = await Notification.query().insert({
    user_id,
    event,
    source_service,
    title: content.title,
    message: content.message,
    data: payload,
    channels,
  });

  // 2. Push SSE tới client đang kết nối
  sseManager.sendToUser(user_id, {
    type: "NEW_NOTIFICATION",
    notification,
  });

  return notification;
};
