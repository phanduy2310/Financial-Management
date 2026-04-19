import React, { useState } from "react";
import axios from "../../api/axios";
import { X, Trash2, PlusCircle } from "lucide-react";

export default function ManageMemberModal({
    groupId,
    members,
    onClose,
    refresh,
}) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!email) return;

        try {
            setLoading(true);

            // 1. Tìm user theo email qua auth service
            const res = await axios.get(`/auth/users/find`, {
                params: { email },
            });

            const user = res.data.data;
            if (!user) {
                alert("Không tìm thấy người dùng với email này");
                return;
            }

            // 2. POST /groups/:group_id/members theo spec
            await axios.post(`/groups/${groupId}/members`, {
                user_id: user.id,
            });

            refresh();
            setEmail("");
        } catch (err) {
            console.error("Add member error:", err);
            const msg = err.response?.data?.message;
            if (err.response?.status === 409) alert("Người dùng đã là thành viên nhóm.");
            else alert(msg || "Không thể thêm thành viên.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId) => {
        if (!window.confirm("Xoá thành viên này khỏi nhóm?")) return;

        try {
            // DELETE /groups/:group_id/members/:user_id theo spec
            await axios.delete(`/groups/${groupId}/members/${userId}`);
            refresh();
        } catch (err) {
            console.error("Remove member error:", err);
            alert(err.response?.data?.message || "Không thể xoá thành viên.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Quản lý thành viên
                </h2>

                {/* LIST MEMBERS */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto mb-4 pr-1">
                    {members.map((m) => (
                        <div
                            key={m.id || m.user_id}
                            className="flex items-center justify-between px-3 py-2 
                                       bg-gray-50 rounded-xl border border-gray-200"
                        >
                            <div className="flex items-center gap-3 text-sm">
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold">
                                    {(m.fullname || m.user?.fullname)?.charAt(0).toUpperCase() ?? "?"}
                                </div>

                                {/* Fullname */}
                                <span className="font-medium text-gray-800">
                                    {m.fullname || m.user?.fullname || `User #${m.user_id}`}
                                </span>

                                {/* Role Badge */}
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                                        m.role === "owner"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-[#FCE8E8] text-[#AE1C28]"
                                    }`}
                                >
                                    {m.role === "owner"
                                        ? "Chủ nhóm"
                                        : "Thành viên"}
                                </span>
                            </div>

                            {/* DELETE */}
                            {m.role !== "owner" && (
                                <button
                                    onClick={() => handleRemove(m.user_id)}
                                    className="p-1 text-[#AE1C28] hover:text-[#8F1A20]"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* ADD MEMBER BY EMAIL */}
                <div className="flex items-center gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email cần thêm"
                        className="flex-1 border rounded-xl px-3 py-2 text-sm 
                                   focus:ring-2 focus:ring-[#AE1C28] outline-none"
                    />

                    <button
                        onClick={handleAdd}
                        disabled={loading}
                        className={`px-3 py-2 rounded-xl bg-[#AE1C28] text-white 
                                   hover:bg-[#8F1A20] ${
                                       loading
                                           ? "opacity-50 cursor-not-allowed"
                                           : ""
                                   }`}
                    >
                        <PlusCircle size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
