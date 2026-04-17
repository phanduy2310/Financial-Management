const members = require("../services/group_member");
const { success, error } = require("../utils/response");

exports.addMember = async (req, res) => {
    try {
        const { group_id, user_id } = req.body;

        if (!group_id || !user_id) {
            return error(res, "Thiếu group_id hoặc user_id", 400);
        }

        // Kiểm tra đã là thành viên chưa
        const existing = await members.getMember(group_id, user_id);
        if (existing) {
            return error(res, "Người dùng đã là thành viên của nhóm", 400);
        }

        await members.addMember(group_id, user_id);
        success(res, null, "Thêm thành viên thành công");
    } catch (err) {
        error(res, err.message);
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { group_id, user_id } = req.body;

        if (!group_id || !user_id) {
            return error(res, "Thiếu group_id hoặc user_id", 400);
        }

        await members.removeMember(group_id, user_id);
        success(res, null, "Xóa thành viên thành công");
    } catch (err) {
        error(res, err.message);
    }
};

exports.getMembers = async (req, res) => {
    try {
        const membersList = await members.getMembers(req.params.group_id);
        const userIds = membersList.map((m) => m.user_id);

        if (userIds.length === 0) {
            return success(res, []);
        }

        const userMap = Object.fromEntries(userIds.map((u) => [u.id, u]));
        const enriched = membersList.map((m) => ({
            ...m,
            user: userMap[m.user_id] || null,
        }));

        return success(res, enriched);
    } catch (err) {
        console.error("GET MEMBERS ERROR", err);
        return error(res, err.message);
    }
};
