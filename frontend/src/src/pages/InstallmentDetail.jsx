import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
    ArrowLeft,
    CreditCard,
    Trash2,
    TrendingUp,
    CalendarDays,
    CheckCircle2,
    History,
} from "lucide-react";
import PayInstallmentModal from "../components/modals/PayInstallmentModal";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { motion } from "framer-motion";

export default function InstallmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [plan, setPlan] = useState(null);
    const [history, setHistory] = useState([]);
    const [openPay, setOpenPay] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [detailRes, historyRes] = await Promise.all([
                axios.get(`/installment/detail/${id}`),
                axios.get(`/installment/history/${id}`),
            ]);
            setPlan(detailRes.data);
            setHistory(historyRes.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading || !plan)
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
            </div>
        );

    const total = Number(plan.total_amount);
    const paid = Number(plan.paid_amount);
    const remain = Math.max(total - paid, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-[#FDFDFD] pb-12"
        >
            <div className="max-w-6xl mx-auto px-4 py-6 md:px-8">
                {/* --- NAVIGATION & ACTIONS --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-slate-400 hover:text-red-700 font-bold transition-all text-sm uppercase tracking-widest"
                    >
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-red-50 transition-colors">
                            <ArrowLeft size={18} />
                        </div>
                        Quay lại danh sách
                    </button>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {!plan.completed && (
                            <button
                                onClick={() => setOpenPay(true)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all active:scale-95"
                            >
                                <CreditCard size={16} /> Thanh toán ngay
                            </button>
                        )}
                        <button
                            onClick={async () => {
                                if (
                                    window.confirm(
                                        "Xác nhận xóa vĩnh viễn khoản trả góp này?"
                                    )
                                ) {
                                    await axios.delete(`/installment/${id}`);
                                    navigate("/app/installments");
                                }
                            }}
                            className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                {/* --- MAIN CARD --- */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                        {plan.title}
                                    </h2>
                                    {plan.completed && (
                                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <CheckCircle2 size={14} /> Hoàn tất
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                    <CalendarDays
                                        size={16}
                                        className="text-red-700"
                                    />
                                    <span>
                                        {new Date(
                                            plan.start_date
                                        ).toLocaleDateString("vi-VN")}{" "}
                                        —{" "}
                                        {new Date(
                                            plan.end_date
                                        ).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 text-left md:text-right">
                                    Tiến độ tổng thể
                                </p>
                                <span className="text-4xl font-black text-red-700 tracking-tighter">
                                    {plan.progress_percentage}%
                                </span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                            {[
                                {
                                    label: "Tổng khoản vay",
                                    val: total,
                                    color: "text-slate-900",
                                },
                                {
                                    label: "Đã thanh toán",
                                    val: paid,
                                    color: "text-emerald-600",
                                },
                                {
                                    label: "Dư nợ hiện tại",
                                    val: remain,
                                    color: "text-red-700",
                                },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-50"
                                >
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        {s.label}
                                    </p>
                                    <p
                                        className={`text-xl font-black ${s.color}`}
                                    >
                                        {s.val.toLocaleString()}₫
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Big Progress Bar */}
                        <div className="relative w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${plan.progress_percentage}%`,
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute h-full bg-gradient-to-r from-red-800 to-red-600 rounded-full shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* --- CHART SECTION --- */}
                    <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={18} className="text-red-700" />
                            Dòng tiền thanh toán
                        </h3>

                        <div className="h-[300px] w-full">
                            {history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history}>
                                        <defs>
                                            <linearGradient
                                                id="colorAmount"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#b91c1c"
                                                    stopOpacity={0.1}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#b91c1c"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#f1f5f9"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                fill: "#94a3b8",
                                            }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                fill: "#94a3b8",
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "16px",
                                                border: "none",
                                                boxShadow:
                                                    "0 10px 15px -3px rgba(0,0,0,0.1)",
                                                padding: "12px",
                                            }}
                                            itemStyle={{
                                                color: "#b91c1c",
                                                fontWeight: 900,
                                            }}
                                            formatter={(value) => Number(value).toLocaleString("vi-VN") + "đ"}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            name="Đã chi trả"
                                            stroke="#b91c1c"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorAmount)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <TrendingUp size={48} strokeWidth={1} />
                                    <p className="text-xs font-bold uppercase mt-4 tracking-widest">
                                        Chưa có dữ liệu giao dịch
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- HISTORY TABLE --- */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <History size={18} className="text-red-700" />
                                Nhật ký kỳ hạn
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[400px]">
                            {history.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <tbody className="divide-y divide-slate-50">
                                        {history.map((p, i) => (
                                            <tr
                                                key={i}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="py-5 px-8">
                                                    <p className="text-xs font-black text-slate-900 mb-1">
                                                        Kỳ {p.term}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {p.date}
                                                    </p>
                                                </td>
                                                <td className="py-5 px-8 text-right">
                                                    <p className="text-sm font-black text-red-700">
                                                        +
                                                        {Number(
                                                            p.amount
                                                        ).toLocaleString()}
                                                        ₫
                                                    </p>
                                                    <p className="text-[10px] italic text-slate-400 truncate max-w-[100px] ml-auto">
                                                        {p.note ||
                                                            "Thanh toán định kỳ"}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center text-slate-300">
                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                        Sổ lệnh trống
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {openPay && (
                <PayInstallmentModal
                    setOpen={setOpenPay}
                    plan={plan}
                    onSuccess={fetchData}
                />
            )}
        </motion.div>
    );
}
