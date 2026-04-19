import React, { useState } from "react";
import axios from "../../api/axios";
import { useUserId } from "../../hooks/useUserId";
import { X, Landmark, Calendar, CircleDollarSign } from "lucide-react";

export default function AddInstallmentModal({ setOpen, onSuccess }) {
    const [form, setForm] = useState({
        title: "",
        total_amount: "",
        monthly_payment: "",
        start_date: "",
        end_date: "",
        total_terms: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user_id = useUserId();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        if (!form.title || !form.total_amount) {
            alert("Vui lòng nhập các thông tin cơ bản!");
            return;
        }
        setIsSubmitting(true);
        try {
            await axios.post("/installment/", {
                ...form,
                user_id,
                total_amount: parseFloat(form.total_amount),
                monthly_payment: parseFloat(form.monthly_payment),
                total_terms: parseInt(form.total_terms),
            });
            onSuccess();
            setOpen(false);
        } catch (err) {
            alert("Lỗi khi thêm khoản trả góp");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-red-700 px-8 py-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Landmark size={20} />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest">
                            Thiết lập trả góp
                        </h3>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Tên khoản góp - Full Width */}
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                                Tên khoản góp
                            </label>
                            <input
                                type="text"
                                name="title"
                                placeholder="Ví dụ: Laptop Gaming, iPhone 15..."
                                value={form.title}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-700/20 outline-none transition-all"
                            />
                        </div>

                        {/* Tổng số tiền */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                                Tổng số tiền
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="total_amount"
                                    value={form.total_amount}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-700/20 outline-none transition-all pl-10"
                                />
                                <CircleDollarSign
                                    className="absolute left-3 top-3 text-slate-300"
                                    size={18}
                                />
                            </div>
                        </div>

                        {/* Số kỳ góp */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                                Số kỳ (tháng)
                            </label>
                            <input
                                type="number"
                                name="total_terms"
                                value={form.total_terms}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-700/20 outline-none transition-all"
                            />
                        </div>

                        {/* Số tiền mỗi kỳ */}
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                                Số tiền mỗi tháng
                            </label>
                            <input
                                type="number"
                                name="monthly_payment"
                                value={form.monthly_payment}
                                onChange={handleChange}
                                className="w-full bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-700/20 outline-none transition-all font-bold text-red-700"
                            />
                        </div>

                        {/* Ngày bắt đầu */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                                Ngày bắt đầu
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="start_date"
                                    value={form.start_date}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-700/20 outline-none transition-all pl-10"
                                />
                                <Calendar
                                    className="absolute left-3 top-3 text-slate-300"
                                    size={18}
                                />
                            </div>
                        </div>

                        {/* Ngày kết thúc */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">
                                Ngày kết thúc
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="end_date"
                                    value={form.end_date}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-700/20 outline-none transition-all pl-10"
                                />
                                <Calendar
                                    className="absolute left-3 top-3 text-slate-300"
                                    size={18}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={() => setOpen(false)}
                            className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-2 px-10 py-3.5 bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-800 shadow-lg shadow-red-700/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
