import React, { useState } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import { formatVND } from "../../utils/formatCurrency";

export default function UpdateProgressModal({
    open,
    onClose,
    plan,
    onSuccess,
}) {
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");

    if (!open || !plan) return null;

    const target = Number(plan.target_amount || 0);
    const current = Number(plan.current_amount || 0);
    const remaining = Math.max(target - current, 0); // số tiền còn thiếu

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const inputAmount = Number(amount);

        // Validate số tiền nhập
        if (!inputAmount || inputAmount <= 0) {
            setError("Số tiền phải lớn hơn 0");
            return;
        }

        if (current + inputAmount > target) {
            setError(
                `Tổng tiền sau khi cập nhật (${formatVND(
                    current + inputAmount
                )}) không được vượt quá mục tiêu (${formatVND(target)}).`
            );
            return;
        }

        try {
            const res = await axios.put(`/saving/${plan.id}/progress`, {
                current_amount: inputAmount + current,
            });

            toast.success(res.data.message || "Cập nhật thành công 🎉");
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Cập nhật thất bại, vui lòng thử lại!");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm transform transition-all animate-fadeIn">
                {/* Header Section */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <div className="flex items-center">
                        <h2 className="text-xl font-bold text-red-800">
                            Cập nhật tiến độ
                        </h2>
                    </div>

                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        {/* XMarkIcon hoặc SVG tương đương */}
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>

                {/* Plan Info Section */}
                <div className="mb-6 space-y-2">
                    <h3 className="text-lg font-semibold text-gray-700 truncate">
                        Kế hoạch: {plan.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <InfoBox
                            title="Mục tiêu"
                            value={formatVND(target)}
                            color="text-gray-600"
                        />
                        <InfoBox
                            title="Đã tiết kiệm"
                            value={formatVND(current)}
                            color="text-green-600 font-medium"
                        />
                    </div>

                    {/* Remaining Highlight */}
                    <div className="bg-blue-50 border-l-4 border-red-500 p-3 rounded-md mt-4">
                        <p className="text-sm text-red-700 flex justify-between items-center">
                            <span className="font-medium">Còn thiếu:</span>
                            <span className="text-lg font-bold text-red-800">
                                {formatVND(remaining)}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit}>
                    <label
                        htmlFor="amount-input"
                        className="block mb-2 text-sm font-medium text-gray-700"
                    >
                        Nhập số tiền muốn cộng thêm (₫)
                    </label>

                    <input
                        id="amount-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={1}
                        max={remaining}
                        placeholder={`Tối đa: ${formatVND(remaining)}`}
                        className={`border ${
                            error ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150`}
                        required
                    />

                    {error && (
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                            {/* Error Icon */}
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z"
                                ></path>
                            </svg>
                            {error}
                        </p>
                    )}

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition duration-150 shadow-sm"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-blue-700 text-white font-semibold transition duration-150 shadow-md hover:shadow-lg disabled:opacity-50"
                            disabled={remaining === 0}
                        >
                            Cập nhật
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Component phụ để hiển thị thông tin mục tiêu/hiện tại
const InfoBox = ({ title, value, color }) => (
    <div className="p-2 bg-gray-50 rounded-lg border">
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className={`text-base ${color} truncate`}>{value}</p>
    </div>
);
