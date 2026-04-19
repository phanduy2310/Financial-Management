import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "../../api/axios";
import { useUserId } from "../../hooks/useUserId";

export default function AddGroupTransactionModal({
    groupId,
    members,
    onClose,
    refresh,
}) {
    const currentUserId = useUserId();

    const [form, setForm] = useState({
        type: "expense",
        category: "",
        amount: "",
        note: "",
    });

    const [splitMode, setSplitMode] = useState("equal"); // 'equal' | 'custom'
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [customShares, setCustomShares] = useState({}); // {user_id: amount}

    useEffect(() => {
        // mặc định chọn tất cả thành viên
        setSelectedMembers(members.map((m) => m.user_id));
    }, [members]);

    const handleToggleMember = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const equalShare = () => {
        const total = Number(form.amount || 0);
        if (!total || selectedMembers.length === 0) return 0;
        return Math.round(total / selectedMembers.length);
    };

    const handleCustomShareChange = (userId, value) => {
        setCustomShares((prev) => ({
            ...prev,
            [userId]: Number(value || 0),
        }));
    };

    const buildSharesPayload = () => {
        if (splitMode === "equal") {
            const per = equalShare();
            return selectedMembers.map((userId) => ({
                user_id: userId,
                amount: per,
            }));
        } else {
            return selectedMembers.map((userId) => ({
                user_id: userId,
                amount: Number(customShares[userId] || 0),
            }));
        }
    };

    const handleSubmit = async () => {
        const payload = {
            group_id: Number(groupId),
            user_id: currentUserId,
            type: form.type,
            category: form.category,
            amount: Number(form.amount),
            note: form.note,
            shares: buildSharesPayload(), // TODO: backend xử lý thêm
        };

        try {
            await axios.post("/group-transactions", payload);
            refresh();
            onClose();
        } catch (err) {
            console.error("Create group transaction error:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Thêm giao dịch nhóm
                </h2>

                {/* Basic info */}
                <div className="space-y-3 mb-4">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setForm((f) => ({ ...f, type: "expense" }))
                            }
                            className={`flex-1 py-2 rounded-xl text-sm font-medium border 
                                ${
                                    form.type === "expense"
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : "bg-gray-50 text-gray-600 border-gray-200"
                                }`}
                        >
                            Chi tiêu
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setForm((f) => ({ ...f, type: "income" }))
                            }
                            className={`flex-1 py-2 rounded-xl text-sm font-medium border 
                                ${
                                    form.type === "income"
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                        : "bg-gray-50 text-gray-600 border-gray-200"
                                }`}
                        >
                            Thu vào
                        </button>
                    </div>

                    <input
                        name="category"
                        placeholder="Danh mục (VD: Đi ăn, cafe, tiền phòng...)"
                        className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={handleChange}
                    />

                    <input
                        name="amount"
                        type="number"
                        placeholder="Tổng số tiền"
                        className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={handleChange}
                    />

                    <textarea
                        name="note"
                        placeholder="Ghi chú (tùy chọn)"
                        rows={2}
                        className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        onChange={handleChange}
                    />
                </div>

                {/* Split Bill */}
                <div className="border border-gray-100 rounded-2xl p-4 mb-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-800">
                            Chia tiền (Split Bill)
                        </p>
                        <select
                            value={splitMode}
                            onChange={(e) => setSplitMode(e.target.value)}
                            className="text-xs border rounded-lg px-2 py-1 bg-white"
                        >
                            <option value="equal">Chia đều</option>
                            <option value="custom">Tuỳ chỉnh</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        {members.map((m) => {
                            const checked = selectedMembers.includes(m.user_id);
                            const equal = equalShare();

                            return (
                                <div
                                    key={m.id}
                                    className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-100"
                                >
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                                handleToggleMember(m.user_id)
                                            }
                                            className="rounded"
                                        />
                                        <span>{m.user?.fullname || `User #${m.user_id}`}</span>
                                        {m.role === "owner" && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                                Chủ nhóm
                                            </span>
                                        )}
                                    </label>

                                    {checked && (
                                        <div className="text-right text-xs text-gray-600">
                                            {splitMode === "equal" ? (
                                                <span>
                                                    ~{" "}
                                                    {isNaN(equal)
                                                        ? 0
                                                        : equal.toLocaleString()}
                                                    đ
                                                </span>
                                            ) : (
                                                <input
                                                    type="number"
                                                    placeholder="Số tiền"
                                                    className="w-24 border rounded-lg px-2 py-1 text-xs"
                                                    onChange={(e) =>
                                                        handleCustomShareChange(
                                                            m.user_id,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700"
                >
                    Lưu giao dịch
                </button>
            </div>
        </div>
    );
}
