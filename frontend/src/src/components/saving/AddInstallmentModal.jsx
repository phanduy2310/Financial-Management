import React, { useState } from "react";
import axios from "../../api/axios";

export default function AddInstallmentModal({ planId, onClose, onSuccess }) {
    const [form, setForm] = useState({
        amount: "",
        note: "",
        payment_date: new Date().toISOString().split("T")[0],
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`/saving/${planId}/installments`, form);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi thêm khoản góp!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
                <h3 className="text-lg font-bold mb-4">Thêm khoản trả góp</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-600 text-sm mb-1">
                            Số tiền
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm mb-1">
                            Ghi chú
                        </label>
                        <input
                            type="text"
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm mb-1">
                            Ngày góp
                        </label>
                        <input
                            type="date"
                            name="payment_date"
                            value={form.payment_date}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {loading ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
