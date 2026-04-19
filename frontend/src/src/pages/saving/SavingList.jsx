import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "../../api/axios";
import { Plus, PiggyBank, Search, Filter, Target, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import SavingTable from "../../components/saving/SavingTable";
import SavingFilterBar from "../../components/saving/SavingFilterBar";
import SavingSummaryCard from "../../components/saving/SavingSummaryCard";
import CreateSavingModal from "../../components/saving/CreateSavingModal";
import UpdateProgressModal from "../../components/saving/UpdateProgressModal";
import { useUserId } from "../../hooks/useUserId";

export default function SavingDashboard() {
    const userId = useUserId();
    const [plans, setPlans] = useState([]);
    const [filter, setFilter] = useState({ keyword: "", status: "all" });
    const [openAdd, setOpenAdd] = useState(false);
    const [openProgress, setOpenProgress] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPlans = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await axios.get(`/saving/${userId}`);
            setPlans(res.data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách:", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            const keyword = filter.keyword.toLowerCase();
            const matchKeyword = plan.title?.toLowerCase().includes(keyword);
            const matchStatus =
                filter.status === "all" ||
                (filter.status === "completed" && plan.completed) ||
                (filter.status === "active" && !plan.completed);
            return matchKeyword && matchStatus;
        });
    }, [plans, filter]);

    const totalSaved = useMemo(() => {
        return filteredPlans.reduce(
            (sum, p) => sum + Number(p.current_amount || 0),
            0
        );
    }, [filteredPlans]);

    const handleDelete = async (plan) => {
        if (
            !window.confirm(
                `Xác nhận xóa mục tiêu: "${plan.title.toUpperCase()}"?`
            )
        )
            return;
        try {
            await axios.delete(`/saving/${plan.id}`);
            fetchPlans();
        } catch (err) {
            alert("Lỗi hệ thống: Không thể xóa.");
        }
    };

    const handleMarkCompleted = async (plan) => {
        if (!window.confirm("Xác nhận hoàn thành mục tiêu này?")) return;
        try {
            await axios.put(`/saving/${plan.id}/complete`);
            fetchPlans();
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
        }
    };

    const handleUpdateProgress = (plan) => {
        setSelectedPlan(plan);
        setOpenProgress(true);
    };

    return (
        <div className="min-h-screen bg-white px-4 py-8 md:px-10">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* --- HEADER: BOLD & TECH --- */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-red-900 text-white rounded-2xl shadow-xl shadow-slate-200">
                                <Target size={28} strokeWidth={2.5} />
                            </div>
                            <h1 className="text-3xl md:text-4xl text-red-900 font-black uppercase tracking-tighter">
                                Mục tiêu tiết kiệm
                            </h1>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Zap
                                size={12}
                                className="text-amber-500 fill-amber-500"
                            />
                            {loading
                                ? "System Synchronizing..."
                                : `Active Plans: ${plans.length}`}
                        </p>
                    </div>

                    <button
                        onClick={() => setOpenAdd(true)}
                        className="group flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95 text-xs"
                    >
                        <Plus
                            size={18}
                            strokeWidth={3}
                            className="group-hover:rotate-90 transition-transform"
                        />
                        Thiết lập mục tiêu
                    </button>
                </div>

                {/* --- ANALYTICS & FILTERS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-4">
                        <SavingSummaryCard totalSaved={totalSaved} />
                    </div>

                    <div className="lg:col-span-8 bg-slate-50 rounded-[2rem] border border-slate-100 p-2 flex items-center shadow-inner">
                        <div className="w-full">
                            <SavingFilterBar
                                filter={filter}
                                setFilter={setFilter}
                            />
                        </div>
                    </div>
                </div>

                {/* --- MAIN DATA TABLE --- */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-red-700 rounded-full" />
                            Tiến độ thực hiện
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">
                                Kết quả lọc:
                            </span>
                            <span className="text-xs font-black bg-red-900 text-white px-3 py-1 rounded-lg">
                                {filteredPlans.length}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <div className="space-y-4 p-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-20 bg-slate-50 animate-pulse rounded-2xl w-full"
                                        />
                                    ))}
                                </div>
                            ) : filteredPlans.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200"
                                >
                                    <Search
                                        size={48}
                                        className="mx-auto text-slate-200 mb-4"
                                    />
                                    <p className="text-slate-500 font-black uppercase text-xs tracking-widest">
                                        Không tìm thấy kế hoạch khả dụng
                                    </p>
                                </motion.div>
                            ) : (
                                <SavingTable
                                    data={filteredPlans}
                                    onUpdate={handleUpdateProgress}
                                    onComplete={handleMarkCompleted}
                                    onDelete={handleDelete}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            <CreateSavingModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={fetchPlans}
                user_id={userId}
            />
            {selectedPlan && (
                <UpdateProgressModal
                    open={openProgress}
                    onClose={() => setOpenProgress(false)}
                    plan={selectedPlan}
                    onSuccess={fetchPlans}
                />
            )}
        </div>
    );
}
