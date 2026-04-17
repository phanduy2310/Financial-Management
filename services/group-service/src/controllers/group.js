const groups = require("../services/group");
const members = require("../services/group_member");
const { success, error } = require("../utils/response");

exports.createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const owner_id = req.user.id;

        if (!name) {
            return error(res, "Thiếu tên nhóm", 400, "MISSING_NAME");
        }

        const group = await groups.createGroupWithOwner({
            name,
            description,
            owner_id
        });

        return success(res, group, "Tạo nhóm thành công", 201);
    } catch (err) {
        console.error("[CREATE GROUP ERROR]", err);
        return error(res, "Không thể tạo nhóm", 500, "CREATE_GROUP_ERROR");
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;
        const { name, description } = req.body;

        const fields = {};
        if (name !== undefined) fields.name = name;
        if (description !== undefined) fields.description = description;

        if (Object.keys(fields).length === 0) {
            return error(res, "Không có thông tin cần cập nhật", 400, "EMPTY_UPDATE_FIELDS");
        }

        const existing = await groups.getById(groupId);
        if (!existing) {
            return error(res, "Không tìm thấy nhóm", 404, "GROUP_NOT_FOUND");
        }

        if (existing.owner_id !== userId) {
            return error(res, "Không có quyền cập nhật nhóm này", 403, "FORBIDDEN");
        }

        const updated = await groups.update(groupId, fields);

        return success(res, updated, "Cập nhật nhóm thành công");
    } catch (err) {
        console.error("[UPDATE GROUP ERROR]", err);
        return error(res, "Không thể cập nhật nhóm", 500, "UPDATE_GROUP_ERROR");
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const existing = await groups.getById(groupId);
        if (!existing) {
            return error(res, "Không tìm thấy nhóm", 404, "GROUP_NOT_FOUND");
        }

        if (existing.owner_id !== userId) {
            return error(res, "Không có quyền xóa nhóm này", 403, "FORBIDDEN");
        }

        await groups.delete(groupId);

        return success(res, null, "Xóa nhóm thành công");
    } catch (err) {
        console.error("[DELETE GROUP ERROR]", err);
        return error(res, "Không thể xóa nhóm", 500, "DELETE_GROUP_ERROR");
    }
};

exports.getMyGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await groups.getGroupsOfUser(userId);

        const normalized = data.map((g) => ({
            ...g,
            member_count: Number(g.member_count) || 0
        }));

        return success(res, normalized, "Lấy danh sách nhóm thành công");
    } catch (err) {
        console.error("[GET MY GROUPS ERROR]", err);
        return error(res, "Không thể lấy danh sách nhóm", 500, "GET_GROUPS_ERROR");
    }
};