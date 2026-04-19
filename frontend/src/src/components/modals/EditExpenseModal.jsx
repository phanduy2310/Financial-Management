import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function EditExpenseModal({
    isOpen,
    onClose,
    expense,
    onSuccess,
}) {
    const [form, setForm] = useState({
        category: "",
        amount: "",
        date: "",
        note: "",
    });

    useEffect(() => {
        if (expense) {
            setForm({
                category: expense.category || "",
                amount: expense.amount || "",
                date: expense.date?.split("T")[0] || "",
                note: expense.note || "",
            });
        }
    }, [expense]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/transactions/${expense.id}`, {
                ...form,
                amount: Number(form.amount),
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Cập nhật khoản chi thất bại!");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-red-600 mb-4">
                    ✏️ Chỉnh sửa khoản chi
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Danh mục
                        </label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none"
                        >
                            <option value="food">Ăn uống</option>
                            <option value="transport">Di chuyển</option>
                            <option value="shopping">Mua sắm</option>
                            <option value="entertainment">Giải trí</option>
                            <option value="others">Khác</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Số tiền
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Ngày
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Ghi chú
                        </label>
                        <input
                            type="text"
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
