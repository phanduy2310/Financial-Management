const groups = require("../services/group");
const members = require("../services/group_member");
const { success, error } = require("../utils/response");

exports.createGroup = async (req, res) => {
    try {
        const { name, description, owner_id } = req.body;

        if (!name || !owner_id) {
            return error(res, "Thiếu name hoặc owner_id", 400);
        }

        const group = await groups.create({ name, description, owner_id });

        // Owner là thành viên đầu tiên
        await members.addMember(group.id, owner_id, "owner");

        success(res, group, "Tạo nhóm thành công");
    } catch (err) {
        error(res, err.message);
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const fields = {};
        if (name !== undefined) fields.name = name;
        if (description !== undefined) fields.description = description;

        if (Object.keys(fields).length === 0) {
            return error(res, "Không có thông tin cần cập nhật", 400);
        }

        const updated = await groups.update(req.params.id, fields);
        if (!updated) return error(res, "Không tìm thấy nhóm", 404);

        success(res, null, "Cập nhật nhóm thành công");
    } catch (err) {
        error(res, err.message);
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        await groups.delete(req.params.id);
        success(res, null, "Xóa nhóm thành công");
    } catch (err) {
        error(res, err.message);
    }
};

exports.getGroupsOfUser = async (req, res) => {
    try {
        const data = await groups.getGroupsOfUser(req.params.user_id);

        // Enrich owner_name
        const ownerIds = [...new Set(data.map((g) => g.owner_id).filter(Boolean))];
        let userMap = {};
        if (ownerIds.length > 0) {
            try {
                userMap = Object.fromEntries(ownerIds.map((u) => [u.id, u]));
            } catch (e) {
                console.error("[GROUP] Failed to fetch owner names:", e.message);
            }
        }

        const enriched = data.map((g) => ({
            ...g,
            member_count: Number(g.member_count) || 0,
            owner_name: userMap[g.owner_id]?.fullname || null,
        }));

        success(res, enriched);
    } catch (err) {
        error(res, err.message);
    }
};
