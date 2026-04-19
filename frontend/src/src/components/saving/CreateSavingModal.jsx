import React, { useState } from "react";
import axios from "../../api/axios"; // Sử dụng instance axios đã cấu hình của bạn
import { X, Target, Calendar, DollarSign, Zap, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateSavingModal({
    open,
    onClose,
    onSuccess,
    user_id,
}) {
    const [formData, setFormData] = useState({
        title: "",
        target_amount: "",
        start_date: "",
        end_date: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post(`/saving`, {
                user_id,
                title: formData.title,
                target_amount: Number(formData.target_amount),
                start_date: formData.start_date,
                end_date: formData.end_date,
            });

            onSuccess();
            onClose();
            setFormData({
                title: "",
                target_amount: "",
                start_date: "",
                end_date: "",
            });
        } catch (err) {
            console.error("Lỗi khi tạo kế hoạch:", err);
            alert("Lỗi hệ thống: Không thể khởi tạo mục tiêu!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop với hiệu ứng mờ hiện đại */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
                    >
                        {/* Header của Modal */}
                        <div className="bg-red-900 px-8 py-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-700 rounded-lg">
                                    <Target size={20} />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">
                                    Thiết lập mục tiêu mới
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="hover:rotate-90 transition-transform text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Tên kế hoạch */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">
                                    Danh mục tiết kiệm
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Ví dụ: Mua Macbook Pro, Quỹ du lịch..."
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-700 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-slate-900"
                                        required
                                    />
                                    <Zap
                                        size={18}
                                        className="absolute right-4 top-4 text-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Số tiền mục tiêu */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">
                                    Số tiền cần đạt được (VND)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="target_amount"
                                        placeholder="0.00"
                                        value={formData.target_amount}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-700 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-black text-2xl text-red-700"
                                        required
                                    />
                                    <DollarSign
                                        size={20}
                                        className="absolute right-4 top-5 text-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Ngày bắt đầu & Kết thúc */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">
                                        Ngày khởi tạo
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-700 focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-bold text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">
                                        Thời hạn dự kiến
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-700 focus:bg-white rounded-2xl px-4 py-3 outline-none transition-all font-bold text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] px-6 py-4 rounded-2xl bg-red-700 text-white font-black uppercase text-[10px] tracking-widest hover:bg-red-800 shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {isSubmitting
                                        ? "Đang xử lý..."
                                        : "Kích hoạt mục tiêu"}
                                    {!isSubmitting && <Rocket size={14} />}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
