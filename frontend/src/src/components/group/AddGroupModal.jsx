import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "../../api/axios";
import { useUserId } from "../../hooks/useUserId";

export default function AddGroupModal({ onClose, refresh }) {
    const userId = useUserId();
    const [form, setForm] = useState({
        name: "",
        description: "",
        owner_id: userId,
    });

    useEffect(() => {
        if (userId) {
            setForm((prev) => ({ ...prev, owner_id: userId }));
        }
    }, [userId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await axios.post("/groups", {
                ...form,
                owner_id: userId,
            });
            refresh();
            onClose();
        } catch (err) {
            console.error("Create group error:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Tạo nhóm chi tiêu
                </h2>

                <div className="space-y-3">
                    <input
                        name="name"
                        placeholder="Tên nhóm"
                        className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={handleChange}
                    />
                    <textarea
                        name="description"
                        placeholder="Mô tả (tùy chọn)"
                        className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        rows={3}
                        onChange={handleChange}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90"
                >
                    Tạo nhóm
                </button>
            </div>
        </div>
    );
}
