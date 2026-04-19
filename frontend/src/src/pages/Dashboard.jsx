import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import SummaryCards from "../components/Dashboard/SummaryCards";
import RecentTransactions from "../components/Dashboard/RecentTransactions";
import ExpenseChart from "../components/Dashboard/ExpenseChart";
import { useUserId } from "../hooks/useUserId";
import { LayoutDashboard, Calendar, RefreshCcw } from "lucide-react";

export default function Dashboard() {
    const userId = useUserId();
    const [summary, setSummary] = useState({
        income: 0,
        expense: 0,
        balance: 0,
    });
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const year = new Date().getFullYear();
            const [summaryRes, chartRes, transRes] = await Promise.all([
                axios.get(`/transactions/stats/summary/${userId}`),
                axios.get(`/transactions/stats/year/${userId}/${year}`),
                axios.get(`/transactions/${userId}`),
            ]);

            setSummary(summaryRes.data.data);

            const formatted = Object.keys(chartRes.data.data).map((m) => ({
                name: `Tháng ${m}`,
                thu: chartRes.data.data[m].income,
                chi: chartRes.data.data[m].expense,
            }));
            setChartData(formatted);

            const sorted = transRes.data.data
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 6);
            setTransactions(sorted);
        } catch (err) {
            console.error("Lỗi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-red-600 rounded-lg text-white">
                                <LayoutDashboard size={24} />
                            </div>
                            <h1 className="text-2xl text-red-900 md:text-3xl font-black tracking-tighter uppercase">
                                Tổng quan tài chính
                            </h1>
                        </div>
                        <p className="text-slate-500 font-medium ml-1">
                            Hệ thống quản lý tài chính cá nhân PTIT Finance.
                        </p>
                    </div>

                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all font-bold text-sm"
                    >
                        <RefreshCcw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        LÀM MỚI DỮ LIỆU
                    </button>
                </div>

                {/* 1️⃣ Summary Cards */}
                <SummaryCards summary={summary} loading={loading} />

                {/* 2️⃣ Main Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8">
                        <ExpenseChart data={chartData} />
                    </div>
                    <div className="lg:col-span-4 h-full">
                        <RecentTransactions transactions={transactions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
