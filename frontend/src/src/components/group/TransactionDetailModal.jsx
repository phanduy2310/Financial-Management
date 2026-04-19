import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "../../api/axios";

export default function TransactionDetailModal({ groupId, transactionId, onClose }) {
    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState(null);
    const [shares, setShares] = useState([]);

    const fetchDetail = async () => {
        if (!transactionId || !groupId) return setLoading(false);

        const id = Number(transactionId);
        if (isNaN(id) || id <= 0) {
            alert("ID giao dịch không hợp lệ.");
            return setLoading(false);
        }

        try {
            // GET /groups/:group_id/transactions/:transaction_id theo spec
            const res = await axios.get(`/groups/${groupId}/transactions/${id}`);
            setTransaction(res.data.data?.transaction || null);
            setShares(res.data.data?.shares || []);
        } catch (err) {
            console.error("Error loading transaction detail:", err);
            alert(err.response?.data?.message || "Không thể tải chi tiết giao dịch");
        }

        setLoading(false);
    };

    useEffect(() => {
        if (transactionId && groupId) fetchDetail();
    }, [transactionId, groupId]);

    if (loading || !transaction)
        return (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center text-white">
                Đang tải...
            </div>
        );

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
                {/* CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                {/* HEADER */}
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Chi tiết giao dịch
                </h2>

                {/* INFO BOX */}
                <div className="space-y-3 border border-[#FCE8E8] rounded-2xl p-4 bg-[#FFF6F6]">
                    {/* CATEGORY */}
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Danh mục:</span>
                        <span className="font-medium">
                            {transaction.category}
                        </span>
                    </div>

                    {/* TYPE */}
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Loại giao dịch:</span>
                        <span
                            className={`font-semibold ${
                                transaction.type === "expense"
                                    ? "text-[#AE1C28]"
                                    : "text-emerald-600"
                            }`}
                        >
                            {transaction.type === "expense"
                                ? "Chi tiêu"
                                : "Thu vào"}
                        </span>
                    </div>

                    {/* AMOUNT */}
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Số tiền:</span>
                        <span
                            className={`font-semibold text-lg ${
                                transaction.type === "expense"
                                    ? "text-[#AE1C28]"
                                    : "text-emerald-600"
                            }`}
                        >
                            {Number(transaction.amount).toLocaleString()}đ
                        </span>
                    </div>

                    {/* CREATOR */}
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Người tạo:</span>

                        <span className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700">
                                {transaction.user?.fullname
                                    ? transaction.user.fullname
                                          .charAt(0)
                                          .toUpperCase()
                                    : "?"}
                            </div>

                            <span className="font-medium text-gray-800">
                                {transaction.user?.fullname ||
                                    `User #${transaction.user_id}`}
                            </span>
                        </span>
                    </div>

                    {/* NOTE */}
                    {transaction.note && (
                        <div className="text-sm text-gray-600">
                            <span className="block mb-1">Ghi chú:</span>
                            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700">
                                {transaction.note}
                            </div>
                        </div>
                    )}
                </div>

                {/* SHARES */}
                <h3 className="mt-6 mb-3 font-semibold text-gray-800">
                    Chia tiền giữa thành viên
                </h3>

                {shares.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Giao dịch này không có chia tiền.
                    </p>
                ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {shares.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between bg-gray-50 
                                           border border-gray-200 px-3 py-2 rounded-xl"
                            >
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    {/* Avatar */}
                                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700">
                                        {s.user?.fullname
                                            ? s.user.fullname
                                                  .charAt(0)
                                                  .toUpperCase()
                                            : "?"}
                                    </div>

                                    {/* Fullname */}
                                    <span className="font-medium">
                                        {s.user?.fullname ||
                                            `User #${s.user_id}`}
                                    </span>
                                </div>

                                <div className="text-sm font-semibold text-[#AE1C28]">
                                    -{Number(s.amount).toLocaleString()}đ
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* FOOTER */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-[#AE1C28] text-white py-2.5 rounded-xl 
                               text-sm font-semibold hover:bg-[#8F1A20] transition"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
}
