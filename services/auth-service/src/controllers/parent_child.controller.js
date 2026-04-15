const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");

const ParentChild = require("../models/parent_child.model");
const ParentChildToken = require("../models/parent_child_token.model");
const User = require("../models/user.model");
const {
    sendParentInviteNotification,
} = require("../services/parent_invite_notification.service");

const confirmLinkSchema = Joi.object({
    token: Joi.string().trim().required(),
    action: Joi.string().valid("accepted", "rejected").required(),
});

exports.addChildByEmail = async (req, res) => {
    try {
        const parentId = req.user.id;
        const parentEmail = req.user.email;
        const { child_email } = req.body;

        if (!child_email) {
            return res.status(400).json({
                message: "Vui long nhap email cua con",
            });
        }

        const child = await User.query().where("email", child_email).first();

        if (!child) {
            return res.status(404).json({
                message: "Tai khoan email nay chua dang ky he thong",
            });
        }

        if (child.id === parentId) {
            return res.status(400).json({
                message: "Ban khong the tu ket noi voi chinh minh",
            });
        }

        const existed = await ParentChild.query()
            .where({
                parent_id: parentId,
                child_id: child.id,
            })
            .first();

        if (existed) {
            if (existed.status === "pending") {
                return res.status(400).json({
                    message: "Loi moi dang o trang thai cho xac nhan",
                });
            }

            if (existed.status === "accepted") {
                return res.status(400).json({
                    message: "Tai khoan nay da duoc lien ket",
                });
            }

            await ParentChild.query().deleteById(existed.id);
        }

        const result = await ParentChild.transaction(async (trx) => {
            const link = await ParentChild.query(trx).insert({
                parent_id: parentId,
                child_id: child.id,
                status: "pending",
            });

            const token = uuidv4();
            await ParentChildToken.query(trx).insert({
                parent_child_id: link.id,
                token,
                expired_at: dayjs().add(2, "day").format("YYYY-MM-DD HH:mm:ss"),
            });

            return { token, childId: child.id };
        });

        sendParentInviteNotification({
            parentEmail,
            childId: result.childId,
            token: result.token,
        }).catch((err) =>
            console.error("[NOTIFY PARENT INVITE ERROR]", err.message)
        );

        return res.json({
            message: "Loi moi da duoc gui thanh cong",
        });
    } catch (err) {
        console.error("[ADD CHILD ERROR]", err);
        return res.status(500).json({
            message: "He thong gap loi khi gui loi moi",
            error: err.message,
        });
    }
};

exports.confirmLink = async (req, res) => {
    try {
        const { error, value } = confirmLinkSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Du lieu khong hop le",
                details: error.details.map((detail) => detail.message),
            });
        }

        const childUserId = req.user.id;

        const result = await ParentChildToken.transaction(async (trx) => {
            const tokenRow = await ParentChildToken.query(trx)
                .where({ token: value.token })
                .forUpdate()
                .first();

            if (!tokenRow || tokenRow.used) {
                return {
                    status: 400,
                    body: {
                        message: "Token khong hop le hoac da dung",
                    },
                };
            }

            if (dayjs().isAfter(tokenRow.expired_at)) {
                return {
                    status: 400,
                    body: {
                        message: "Token da het han",
                    },
                };
            }

            const link = await ParentChild.query(trx)
                .findById(tokenRow.parent_child_id)
                .forUpdate();

            if (!link) {
                return {
                    status: 404,
                    body: {
                        message: "Khong tim thay lien ket parent-child",
                    },
                };
            }

            if (link.child_id !== childUserId) {
                return {
                    status: 403,
                    body: {
                        message: "Ban khong co quyen xac nhan lien ket nay",
                    },
                };
            }

            if (link.status !== "pending") {
                return {
                    status: 409,
                    body: {
                        message: "Lien ket nay da duoc xu ly",
                    },
                };
            }

            await ParentChild.query(trx).findById(link.id).patch({
                status: value.action,
                accepted_at: value.action === "accepted" ? new Date() : null,
            });

            await ParentChildToken.query(trx).findById(tokenRow.id).patch({
                used: true,
            });

            return {
                status: 200,
                body: {
                    message:
                        value.action === "accepted"
                            ? "Da chap nhan lien ket phu huynh"
                            : "Da tu choi lien ket",
                },
            };
        });

        return res.status(result.status).json(result.body);
    } catch (err) {
        console.error("[CONFIRM LINK ERROR]", err);
        return res.status(500).json({ error: err.message });
    }
};

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

        return res.json({ data: children });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
