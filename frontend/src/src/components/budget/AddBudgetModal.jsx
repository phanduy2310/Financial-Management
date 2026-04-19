import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { X } from "lucide-react";
import { useUserId } from "../../hooks/useUserId";

export default function AddBudgetModal({ onClose, refresh }) {
    const userId = useUserId();
    const [form, setForm] = useState({
        user_id: userId,
        title: "",
        category: "",
        target_amount: "",
        start_date: "",
        end_date: "",
    });

    // Update form when userId changes
    useEffect(() => {
        if (userId) {
            setForm((prev) => ({ ...prev, user_id: userId }));
        }
    }, [userId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await axios.post("/budget", {
                ...form,
                user_id: userId,
            });
            refresh();
            onClose();
        } catch (err) {
            console.log("Add budget error:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <X size={22} />
                </button>

                <h2 className="text-xl font-bold mb-4">
                    Tạo kế hoạch chi tiêu
                </h2>

                <div className="space-y-4">
                    <input
                        name="title"
                        placeholder="Tên kế hoạch"
                        className="w-full p-3 border rounded-lg"
                        onChange={handleChange}
                    />
                    <input
                        name="category"
                        placeholder="Danh mục"
                        className="w-full p-3 border rounded-lg"
                        onChange={handleChange}
                    />
                    <input
                        name="target_amount"
                        placeholder="Mục tiêu chi (VNĐ)"
                        type="number"
                        className="w-full p-3 border rounded-lg"
                        onChange={handleChange}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="start_date"
                            type="date"
                            className="w-full p-3 border rounded-lg"
                            onChange={handleChange}
                        />
                        <input
                            name="end_date"
                            type="date"
                            className="w-full p-3 border rounded-lg"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Tạo kế hoạch
                    </button>
                </div>
            </div>
        </div>
    );
}
