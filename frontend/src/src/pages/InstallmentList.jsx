import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
    Plus,
    Wallet,
    Trash2,
    CreditCard,
    ChevronRight,
    Calendar,
} from "lucide-react";
import AddInstallmentModal from "../components/modals/AddInstallmentModal";
import PayInstallmentModal from "../components/modals/PayInstallmentModal";
import { useUserId } from "../hooks/useUserId";

export default function InstallmentList() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const [openPay, setOpenPay] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const user_id = useUserId();

    const fetchPlans = useCallback(async () => {
        if (!user_id) return;
        setLoading(true);
        try {
            const res = await axios.get(`/installment/${user_id}`);
            setPlans(res.data);
        } catch (err) {
            console.error("Lỗi tải danh sách:", err);
        } finally {
            setLoading(false);
        }
    }, [user_id]);

    const handleDelete = async (e, id, title) => {
        e.stopPropagation(); // Ngăn navigate
        if (!window.confirm(`Xác nhận xóa khoản trả góp: ${title}?`)) return;
        try {
            await axios.delete(`/installment/${id}`);
            fetchPlans();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return (
        <div className="min-h-screen bg-[#FCFCFD] px-4 py-4 md:px-8 md:py-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-red-700 rounded-2xl">
                            <Wallet size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Sổ tay trả góp
                            </h1>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                                Hệ thống quản lý dư nợ
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpenAdd(true)}
                        className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-red-700/20 transition-all active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} /> Thêm khoản mới
                    </button>
                </div>

                {/* --- DANH SÁCH --- */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-48 bg-white animate-pulse rounded-[2rem] border border-slate-100"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() =>
                                    navigate(`/app/installments/${plan.id}`)
                                }
                                className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                {/* Trang trí góc card */}
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors" />

                                <div className="relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-black text-lg text-slate-800 leading-tight pr-8 capitalize">
                                            {plan.title}
                                        </h3>
                                        <ChevronRight
                                            size={20}
                                            className="text-slate-300 group-hover:text-red-700 transition-colors"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-4">
                                        <Calendar size={14} />
                                        <span>
                                            Kỳ hạn: {plan.current_term}/
                                            {plan.total_terms} tháng
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Đã tất toán
                                            </span>
                                            <span className="font-bold text-slate-700">
                                                {Number(
                                                    plan.paid_amount
                                                ).toLocaleString()}
                                                ₫
                                            </span>
                                        </div>
                                        {/* Progress Bar PTIT Style */}
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-red-700 h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${plan.progress_percentage}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-black">
                                            <span className="text-slate-400 font-bold uppercase text-[10px]">
                                                Dư nợ còn lại
                                            </span>
                                            <span className="text-red-700">
                                                {(
                                                    Number(plan.total_amount) -
                                                    Number(plan.paid_amount)
                                                ).toLocaleString()}
                                                ₫
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-slate-50">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPlan(plan);
                                                setOpenPay(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-900 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                                        >
                                            <CreditCard size={14} /> Trả góp
                                        </button>
                                        <button
                                            onClick={(e) =>
                                                handleDelete(
                                                    e,
                                                    plan.id,
                                                    plan.title
                                                )
                                            }
                                            className="p-3 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- EMPTY STATE --- */}
                {!loading && plans.length === 0 && (
                    <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="text-red-700" size={32} />
                        </div>
                        <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">
                            Chưa có kế hoạch trả góp nào
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {openAdd && (
                <AddInstallmentModal
                    setOpen={setOpenAdd}
                    onSuccess={fetchPlans}
                />
            )}
            {openPay && (
                <PayInstallmentModal
                    setOpen={setOpenPay}
                    plan={selectedPlan}
                    onSuccess={fetchPlans}
                />
            )}
        </div>
    );
}
