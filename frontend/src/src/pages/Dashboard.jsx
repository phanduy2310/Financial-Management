import { useEffect, useState } from "react";
import axios from "../api/axios";
import SummaryCards from "../components/Dashboard/SummaryCards";
import RecentTransactions from "../components/Dashboard/RecentTransactions";
import ExpenseChart from "../components/Dashboard/ExpenseChart";
import MonthPicker from "../components/ui/MonthPicker";
import { useUserId } from "../hooks/useUserId";
import { LayoutDashboard, RefreshCcw } from "lucide-react";

export default function Dashboard() {
    const userId = useUserId();
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    const handleMonthChange = ({ month: m, year: y }) => {
        setMonth(m);
        setYear(y);
    };

    const fetchData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [summaryRes, chartRes, transRes] = await Promise.all([
                axios.get(`/transactions/stats/summary?period=month&month=${month}&year=${year}`),
                axios.get(`/transactions/stats/monthly-summary?months=6`),
                axios.get(`/transactions?month=${month}&year=${year}`),
            ]);

            const s = summaryRes.data.data;
            setSummary({
                income: s.total_income,
                expense: s.total_expense,
                balance: s.closing_balance,
            });

            const formatted = (chartRes.data.data?.data || []).map((m) => ({
                name: `Tháng ${m.month}`,
                thu: m.total_income,
                chi: m.total_expense,
            }));
            setChartData(formatted);

            const sorted = (transRes.data.data || [])
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
    }, [userId, month, year]);

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

                    <div className="flex items-center gap-3 flex-wrap">
                        <MonthPicker month={month} year={year} onChange={handleMonthChange} />
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all font-bold text-sm"
                        >
                            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                            LÀM MỚI
                        </button>
                    </div>
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
