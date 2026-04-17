// core/notification.factory.js
module.exports = {
  PARENT_LINK_REQUEST: ({ payload }) => ({
    title: "Yêu cầu liên kết phụ huynh",
    message: `Phụ huynh ${
      payload.parent_email || "không rõ"
    } muốn theo dõi chi tiêu của bạn`,
  }),

  TRANSACTION_CREATED: ({ payload }) => ({
    title: payload.type === "income" ? "Thu nhập mới" : "Chi tiêu mới",
    message: `${payload.type === "income" ? "Thu" : "Chi"} ${
      payload.amount ? Number(payload.amount).toLocaleString("vi-VN") : "0"
    }đ — ${payload.category || ""}`,
  }),

  INSTALLMENT_DUE_SOON: ({ payload }) => ({
    title: "Trả góp",
    message: payload.message || `Kỳ trả góp đến hạn ${payload.due_date || ""}`,
  }),

  SAVING_PLAN_COMPLETED: ({ payload }) => ({
    title: "Kế hoạch tiết kiệm hoàn thành",
    message: `Chúc mừng! Bạn đã hoàn thành kế hoạch "${payload.title || ""}"`,
  }),
};
