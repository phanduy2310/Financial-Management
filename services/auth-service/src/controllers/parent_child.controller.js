const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");

const ParentChild = require("../models/parent_child.model");
const ParentChildToken = require("../models/parent_child_token.model");
const User = require("../models/user.model");
const {
    sendParentInviteNotification,
} = require("../services/parent_invite_notification.service");

// ➕ Parent thêm child bằng email
exports.addChildByEmail = async (req, res) => {
    try {
        const parentId = req.user.id;
        const parentEmail = req.user.email;
        const { child_email } = req.body;

        if (!child_email) {
            return res
                .status(400)
                .json({ message: "Vui lòng nhập email của con" });
        }

        // Tìm người dùng theo email
        const child = await User.query().where("email", child_email).first();

        if (!child) {
            return res
                .status(404)
                .json({ message: "Tài khoản email này chưa đăng ký hệ thống" });
        }

        // Kiểm tra logic tự thêm chính mình
        if (child.id === parentId) {
            return res
                .status(400)
                .json({ message: "Bạn không thể tự kết nối với chính mình" });
        }

        // Kiểm tra xem đã tồn tại mối quan hệ hoặc yêu cầu chờ nào chưa
        const existed = await ParentChild.query()
            .where({
                parent_id: parentId,
                child_id: child.id,
            })
            .first();

        if (existed) {
            if (existed.status === "pending") {
                return res
                    .status(400)
                    .json({ message: "Lời mời đang ở trạng thái chờ xác nhận" });
            }
            if (existed.status === "accepted") {
                return res
                    .status(400)
                    .json({ message: "Tài khoản này đã được liên kết" });
            }
            // status === "rejected": xóa record cũ để cho phép mời lại
            await ParentChild.query().deleteById(existed.id);
        }

        // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu (Nếu một bước lỗi, các bước trước sẽ rollback)
        const result = await ParentChild.transaction(async (trx) => {
            // 1️⃣ Tạo liên kết trạng thái pending
            const link = await ParentChild.query(trx).insert({
                parent_id: parentId,
                child_id: child.id,
                status: "pending",
            });

            // 2️⃣ Tạo token xác thực
            const token = uuidv4();
            await ParentChildToken.query(trx).insert({
                parent_child_id: link.id,
                token,
                expired_at: dayjs().add(2, "day").format("YYYY-MM-DD HH:mm:ss"),
            });

            return { token, childId: child.id };
        });

        // 3️⃣ Gửi in-app notification (không để lỗi notification block response)
        sendParentInviteNotification({
            parentEmail,
            childId: result.childId,
            token: result.token,
        }).catch((err) =>
            console.error("[NOTIFY PARENT INVITE ERROR]", err.message)
        );

        return res.json({
            message: "Lời mời đã được gửi thành công!",
        });
    } catch (err) {
        console.error("[ADD CHILD ERROR]", err);
        return res.status(500).json({
            message: "Hệ thống gặp lỗi khi gửi lời mời",
            error: err.message,
        });
    }
};

// ✅ Child xác nhận / từ chối
exports.confirmLink = async (req, res) => {
    try {
        const { token, action } = req.body;

        if (!token || !["accepted", "rejected"].includes(action)) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
            });
        }

        const tokenRow = await ParentChildToken.query()
            .where({ token, used: false })
            .first();

        if (!tokenRow) {
            return res.status(400).json({
                message: "Token không hợp lệ hoặc đã dùng",
            });
        }

        if (dayjs().isAfter(tokenRow.expired_at)) {
            return res.status(400).json({
                message: "Token đã hết hạn",
            });
        }

        await ParentChild.query()
            .findById(tokenRow.parent_child_id)
            .patch({
                status: action,
                accepted_at: action === "accepted" ? new Date() : null,
            });

        await ParentChildToken.query().findById(tokenRow.id).patch({ used: true });

        res.json({
            message:
                action === "accepted"
                    ? "Đã chấp nhận liên kết phụ huynh"
                    : "Đã từ chối liên kết",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📋 Parent xem danh sách con
exports.getChildren = async (req, res) => {
    try {
        const parentId = req.user.id;

        const children = await ParentChild.query()
            .where({
                parent_id: parentId,
                status: "accepted",
            })
            .withGraphFetched("child(safeColumns)")
            .modifiers({
                safeColumns: (builder) =>
                    builder.select("id", "fullname", "email", "role"),
            });

        res.json({ data: children });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
