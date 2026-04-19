import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import {
    Wallet,
    TrendingUp,
    ListChecks,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Zap,
    PieChart as PieIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserId } from "../hooks/useUserId";
import { motion } from "framer-motion";

export default function InstallmentDashboard() {
    const user_id = useUserId();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [topPlans, setTopPlans] = useState([]);

    const fetchData = async () => {
        try {
            const [sRes, cRes, tRes] = await Promise.all([
                axios.get(`/installment/stats/${user_id}`),
                axios.get(`/installment/payments/chart/${user_id}`),
                axios.get(`/installment/top/${user_id}`),
            ]);
            setStats(sRes.data);
            setChartData(cRes.data);
            setTopPlans(tRes.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        }
    };

    useEffect(() => {
        if (user_id) fetchData();
    }, [user_id]);

    if (!stats)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">
                    Đang đồng bộ dữ liệu PTIT...
                </p>
            </div>
        );

    return (
        <div className="p-4 md:p-8 bg-[#FDFDFD] min-h-screen font-sans">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                        <span className="bg-red-700 text-white p-2.5 rounded-2xl shadow-lg shadow-red-700/20">
                            <Wallet size={28} strokeWidth={2.5} />
                        </span>
                        TỔNG QUAN
                    </h2>
                    <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-wider">
                        Hệ thống kiểm soát dư nợ thông minh
                    </p>
                </motion.div>

                <button
                    onClick={() => navigate("/app/installments")}
                    className="flex items-center gap-2 bg-red-900 hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.15em] px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                >
                    <ListChecks size={18} /> Danh sách chi tiết
                </button>
            </div>

            {/* --- QUICK STATS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Tổng kế hoạch"
                    value={stats.total_plans}
                    icon={<PieIcon size={20} />}
                    sub="Kế hoạch đang chạy"
                />
                <StatCard
                    title="Đã hoàn tất"
                    value={stats.completed}
                    icon={<CheckCircle2 size={20} />}
                    isSuccess
                    sub="Khoản nợ đã xóa"
                />
                <StatCard
                    title="Đã chi trả"
                    value={`${Number(stats.total_paid).toLocaleString()}₫`}
                    icon={<TrendingUp size={20} />}
                    sub="Tổng tiền đã đóng"
                />
                <StatCard
                    title="Dư nợ hiện tại"
                    value={`${Number(stats.total_debt).toLocaleString()}₫`}
                    icon={<AlertCircle size={20} />}
                    isDanger
                    sub="Cần thanh toán tiếp"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- CHART SECTION --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                            <Zap
                                size={18}
                                className="text-red-700 fill-red-700"
                            />{" "}
                            Xu hướng thanh toán
                        </h3>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-700"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">
                                Dòng tiền/Tháng
                            </span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f8fafc"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#cbd5e1",
                                            fontSize: 11,
                                            fontWeight: 700,
                                        }}
                                        dy={15}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: "#FEF2F2", radius: 12 }}
                                        contentStyle={{
                                            borderRadius: "16px",
                                            border: "none",
                                            boxShadow:
                                                "0 20px 25px -5px rgba(0,0,0,0.1)",
                                            padding: "12px",
                                        }}
                                        itemStyle={{
                                            color: "#b91c1c",
                                            fontWeight: 900,
                                        }}
                                        formatter={(value) => Number(value).toLocaleString("vi-VN") + "đ"}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        name="Đã chi trả"
                                        radius={[10, 10, 10, 10]}
                                        barSize={32}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    index ===
                                                    chartData.length - 1
                                                        ? "#b91c1c"
                                                        : "#f1f5f9"
                                                }
                                                className="hover:fill-red-700 transition-all duration-300"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-bold uppercase text-xs tracking-[0.2em]">
                                Không có dữ liệu giao dịch
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* --- SIDEBAR SECTION --- */}
                <div className="space-y-8">
                    {/* Average Progress Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <TrendingUp size={80} strokeWidth={3} />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
                            Tiến độ trung bình
                        </p>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">
                                {stats.avg_progress}%
                            </span>
                            <span className="text-emerald-600 font-black text-xs uppercase italic">
                                On Track
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.avg_progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="bg-gradient-to-r from-red-800 to-red-600 h-full rounded-full shadow-lg"
                            />
                        </div>
                    </motion.div>

                    {/* Top Debts Card */}
                    <div className="bg-red-900 rounded-[2.5rem] p-8 shadow-2xl shadow-red-900/20 text-white">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                <AlertCircle
                                    size={16}
                                    className="text-red-500"
                                />{" "}
                                Top khoản trả góp lớn
                            </h3>
                            <ArrowUpRight
                                size={18}
                                className="text-slate-500"
                            />
                        </div>
                        <div className="space-y-6">
                            {topPlans.length > 0 ? (
                                topPlans.map((plan, idx) => (
                                    <div
                                        key={plan.id}
                                        onClick={() =>
                                            navigate(
                                                `/app/installments/${plan.id}`
                                            )
                                        }
                                        className="group cursor-pointer flex items-center gap-4"
                                    >
                                        <div className="text-slate-300 font-black text-xl italic group-hover:text-red-600 transition-colors">
                                            0{idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm uppercase tracking-tight truncate group-hover:text-red-500 transition-colors">
                                                {plan.title}
                                            </p>
                                            <p className="text-[10px] text-slate-300 font-bold uppercase mt-0.5">
                                                Còn:{" "}
                                                {(
                                                    plan.total_amount -
                                                    plan.paid_amount
                                                ).toLocaleString()}
                                                ₫
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-lg">
                                                {plan.progress_percentage}%
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-600 text-[10px] font-black uppercase text-center py-4">
                                    Sổ nợ trống
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, isSuccess, isDanger, sub }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div
                    className={`p-3 rounded-2xl transition-colors ${
                        isSuccess
                            ? "bg-emerald-50 text-emerald-600"
                            : isDanger
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-50 text-slate-900 group-hover:bg-red-700 group-hover:text-white"
                    }`}
                >
                    {icon}
                </div>
                <div className="h-1 w-8 bg-slate-100 rounded-full mt-4"></div>
            </div>
            <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    {title}
                </p>
                <h3
                    className={`text-2xl font-black tracking-tighter ${
                        isSuccess
                            ? "text-emerald-600"
                            : isDanger
                            ? "text-red-700"
                            : "text-slate-900"
                    }`}
                >
                    {value}
                </h3>
                <p className="text-[10px] font-bold text-slate-300 uppercase mt-2 tracking-tighter italic">
                    {sub}
                </p>
            </div>
        </motion.div>
    );
}
