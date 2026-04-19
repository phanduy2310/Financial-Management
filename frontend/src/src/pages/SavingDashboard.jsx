import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../api/axios";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Plus,
    PiggyBank,
    Target,
    PieChart,
    TrendingUp,
    Sparkles,
} from "lucide-react";

import SummaryCard from "../components/SummaryCard";
import TopPlans from "../components/TopPlans";
import CreateSavingModal from "../components/saving/CreateSavingModal";
import { useUserId } from "../hooks/useUserId";

export default function SavingDashboard() {
    const [stats, setStats] = useState({
        total_plans: 0,
        completed: 0,
        total_saving: 0,
        avg_progress: 0,
    });
    const [topPlans, setTopPlans] = useState([]);
    const [plans, setPlans] = useState([]);
    const [history, setHistory] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const user_id = useUserId();

    const fetchData = useCallback(async () => {
        if (!user_id) return;
        try {
            setLoading(true);
            const [resStats, resTop, resAll] = await Promise.all([
                axios.get(`/saving/${user_id}/stats`),
                axios.get(`/saving/${user_id}/top`),
                axios.get(`/saving/${user_id}`),
            ]);
            setStats(resStats.data || {});
            setTopPlans(resTop.data || []);
            const allPlans = resAll.data || [];
            setPlans(allPlans);
            // Build chart data from plans: each plan is a data point
            const chartData = allPlans.map((p) => ({
                date: p.title?.replace(/^mục\s+/i, ""),
                progress: Number(p.progress_percentage || 0),
            }));
            setHistory(chartData);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    }, [user_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        /* Giảm padding top/bottom của container chính */
        <div className="px-4 md:px-8 py-4 bg-[#F8FAFC] min-h-screen">
            {/* --- HEADER: Thu hẹp mb-8 thành mb-5 --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                        <PiggyBank className="text-red-600" size={28} />
                        Tiết kiệm
                    </h1>
                    <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                        <Sparkles
                            size={14}
                            className="text-yellow-500 fill-yellow-500"
                        />
                        {loading
                            ? "Đang tải..."
                            : `Đã hoàn thành ${stats.completed || 0} mục tiêu`}
                    </p>
                </div>

                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-sm"
                >
                    <Plus size={18} strokeWidth={3} />
                    Tạo mới
                </button>
            </div>

            {/* --- SUMMARY CARDS: Giảm gap và margin --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
                <SummaryCard
                    title="Tổng kế hoạch"
                    value={loading ? "..." : stats.total_plans}
                    icon={<Target size={18} className="text-blue-500" />}
                    bgColor="bg-blue-50"
                />
                <SummaryCard
                    title="Hoàn thành"
                    value={loading ? "..." : stats.completed}
                    icon={<Sparkles size={18} className="text-emerald-500" />}
                    bgColor="bg-emerald-50"
                />
                <SummaryCard
                    title="Tổng tích lũy"
                    value={
                        loading
                            ? "..."
                            : (stats.total_saving || 0).toLocaleString(
                                  "vi-VN"
                              ) + " ₫"
                    }
                    icon={<PiggyBank size={18} className="text-indigo-500" />}
                    bgColor="bg-indigo-50"
                />
                <SummaryCard
                    title="Tiến độ"
                    value={loading ? "..." : `${stats.avg_progress || 0}%`}
                    icon={<TrendingUp size={18} className="text-red-500" />}
                    bgColor="bg-red-50"
                />
            </div>

            {/* --- TRUNG TÂM (CHART & TOP): Sử dụng items-stretch để xóa khoảng hở --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 items-stretch">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <PieChart size={16} className="text-red-500" />
                            Phân tích tăng trưởng
                        </h2>
                    </div>

                    <div className="flex-1 min-h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={history}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorProgress"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#ef4444"
                                            stopOpacity={0.1}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#ef4444"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#F1F5F9"
                                />
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.05)",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="progress"
                                    name="Tiến độ"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    fill="url(#colorProgress)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Plans Section */}
                <div className="lg:col-span-1 flex flex-col">
                    <TopPlans data={topPlans} loading={loading} />
                </div>
            </div>

            <CreateSavingModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSuccess={fetchData}
                user_id={user_id}
            />
        </div>
    );
}
