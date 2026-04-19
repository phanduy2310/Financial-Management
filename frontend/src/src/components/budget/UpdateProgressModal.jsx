import React, { useState } from "react";
import axios from "../../api/axios";
import { X } from "lucide-react";

export default function UpdateProgressModal({ budget, onClose, refresh }) {
    const [amount, setAmount] = useState(budget.spent_amount);

    const updateProgress = async () => {
        try {
            await axios.patch(`/budget/${budget.id}/progress`, {
                spent_amount: amount,
            });
            refresh();
            onClose();
        } catch (err) {
            console.log("Update progress error:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <X size={22} />
                </button>

                <h2 className="text-xl font-bold mb-4">Cập nhật tiến độ</h2>

                <p className="text-gray-600 mb-3">
                    Kế hoạch:{" "}
                    <span className="font-semibold">{budget.title}</span>
                </p>

                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Nhập số tiền đã chi"
                />

                <div className="flex justify-end mt-6">
                    <button
                        onClick={updateProgress}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>
    );
}
