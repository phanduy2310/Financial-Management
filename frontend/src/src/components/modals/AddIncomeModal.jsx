import React, { useState, useEffect } from "react";
import ModalBase from "./ModalBase";
import axios from "../../api/axios";
import { useUserId } from "../../hooks/useUserId";

export default function AddIncomeModal({ isOpen, onClose, onSuccess }) {
    const userId = useUserId();
    const [form, setForm] = useState({
        user_id: userId,
        type: "income",
        category: "",
        amount: "",
        date: "",
        note: "",
    });

    // Update form when userId changes
    useEffect(() => {
        if (userId) {
            setForm((prev) => ({ ...prev, user_id: userId }));
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("Payload khoản thu:", form);
            await axios.post("/transactions", {
                ...form,
                user_id: userId,
                amount: Number(form.amount),
            });
            alert("Tạo khoản thu thành công!");
            onSuccess?.();
            onClose();
            setForm({
                user_id: userId,
                type: "income",
                category: "",
                amount: "",
                date: "",
                note: "",
            });
        } catch (error) {
            console.error("Lỗi khi tạo khoản thu:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="Tạo khoản thu mới">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Danh mục
                    </label>
                    <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        placeholder="VD: Lương, học bổng..."
                        className="w-full border rounded p-2 focus:outline-red-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Số tiền
                    </label>
                    <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        required
                        className="w-full border rounded p-2 focus:outline-red-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Ngày nhận
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        className="w-full border rounded p-2 focus:outline-red-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Ghi chú
                    </label>
                    <textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        className="w-full border rounded p-2 focus:outline-red-500"
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Lưu
                    </button>
                </div>
            </form>
        </ModalBase>
    );
}
