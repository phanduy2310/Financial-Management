const groups = require("../services/group");
const members = require("../services/group_member");
const { success, error } = require("../utils/response");
const user = require("../clients/user")

exports.addMember = async (req, res) => {
    try {
        const requester_id = req.user.id;
        const group_id = req.params.group_id;
        const { user_id, role } = req.body;

        if (!group_id || !user_id) {
            return error(
                res,
                "Thiếu group_id hoặc user_id",
                400,
                "MISSING_REQUIRED_FIELD"
            );
        }

        const group = await groups.getById(group_id);
        if (!group) {
            return error(res, "Không tìm thấy nhóm", 404, "GROUP_NOT_FOUND");
        }

        if (group.owner_id !== requester_id) {
            return error(
                res,
                "Chỉ owner mới có quyền thêm thành viên",
                403,
                "FORBIDDEN"
            );
        }

        const existing = await members.getMember(group_id, user_id);
        if (existing) {
            return error(
                res,
                "Người dùng đã là thành viên của nhóm",
                409,
                "MEMBER_ALREADY_EXISTS"
            );
        }

        const result = await members.addMember(
            group_id,
            user_id,
            role || "member"
        );

        return success(res, result, "Thêm thành viên thành công", 201);
    } catch (err) {
        console.error("[ADD MEMBER ERROR]", err);
        return error(res, "Không thể thêm thành viên", 500, "ADD_MEMBER_ERROR");
    }
};

exports.removeMember = async (req, res) => {
    try {
        const requester_id = req.user.id;
        const group_id = req.params.group_id;
        const user_id = req.params.user_id;

        if (!group_id || !user_id) {
            return error(
                res,
                "Thiếu group_id hoặc user_id",
                400,
                "MISSING_REQUIRED_FIELD"
            );
        }

        const group = await groups.getById(group_id);
        if (!group) {
            return error(res, "Không tìm thấy nhóm", 404, "GROUP_NOT_FOUND");
        }

        const existing = await members.getMember(group_id, user_id);
        if (!existing) {
            return error(
                res,
                "Thành viên không tồn tại trong nhóm",
                404,
                "MEMBER_NOT_FOUND"
            );
        }

        const isOwner = Number(group.owner_id) === Number(requester_id);
        const isSelf = Number(user_id) === Number(requester_id);

        if (!isOwner && !isSelf) {
            return error(
                res,
                "Chỉ owner mới có quyền xóa người khác hoặc thành viên tự rời nhóm",
                403,
                "FORBIDDEN"
            );
        }

        // Không cho owner tự rời nhóm nếu chưa có cơ chế chuyển owner
        if (isSelf && Number(group.owner_id) === Number(user_id)) {
            return error(
                res,
                "Owner không thể tự rời nhóm",
                400,
                "OWNER_CANNOT_LEAVE_GROUP"
            );
        }

        await members.removeMember(group_id, user_id);

        return success(res, null, isSelf ? "Rời nhóm thành công" : "Xóa thành viên thành công");
    } catch (err) {
        console.error("[REMOVE MEMBER ERROR]", err);
        return error(res, "Không thể xóa thành viên", 500, "REMOVE_MEMBER_ERROR");
    }
};


exports.getAllMembers = async (req, res) => {
    try {
        const group_id = req.params.group_id;

        if (!group_id) {
            return error(res, "Thiếu group_id", 400, "MISSING_GROUP_ID");
        }

        const membersList = await members.getMembers(group_id);

        const userIds = [...new Set(membersList.map((m) => m.user_id).filter(Boolean))];
        const users = await user.getListFullNameByUserIds(userIds);

        const userMap = Object.fromEntries(
            users.map((user) => [user.id, user.fullname])
        );

        const normalized = membersList.map((m) => ({
            ...m,
            fullname: userMap[m.user_id] || null
        }));

        return success(res, normalized, "Lấy danh sách thành viên thành công");
    } catch (err) {
        console.error("[GET MEMBERS ERROR]", err);
        return error(res, "Không thể lấy danh sách thành viên", 500, "GET_MEMBERS_ERROR");
    }
};