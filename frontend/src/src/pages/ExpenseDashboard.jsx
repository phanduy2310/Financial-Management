import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "../api/axios";
import { Plus, CreditCard, Search, History } from "lucide-react";
import ExpenseTable from "../components/Expense/ExpenseTable";
import FilterBar from "../components/Expense/FilterBar";
import ExpenseSummaryCard from "../components/Expense/ExpenseSummaryCard";
import AddExpenseModal from "../components/modals/AddExpenseModal";
import EditExpenseModal from "../components/modals/EditExpenseModal";
import MonthPicker from "../components/ui/MonthPicker";
import { useUserId } from "../hooks/useUserId";

export default function ExpenseDashboard() {
    const userId = useUserId();
    const [expenses, setExpenses] = useState([]);
    const [filter, setFilter] = useState({ keyword: "", category: "all" });
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    const handleMonthChange = ({ month: m, year: y }) => {
        setMonth(m);
        setYear(y);
    };

    const fetchExpenses = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await axios.get(`/transactions?month=${month}&year=${year}`);
            const list = (res.data.data || []).filter((t) => t.type === "expense");
            setExpenses(list);
        } catch (err) {
            console.error("Error fetching expenses:", err);
        } finally {
            setLoading(false);
        }
    }, [userId, month, year]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter((e) => {
            const matchCategory = filter.category === "all" || e.category === filter.category;
            const keyword = filter.keyword.toLowerCase();
            const matchKeyword =
                e.note?.toLowerCase().includes(keyword) ||
                e.category?.toLowerCase().includes(keyword);
            return matchCategory && matchKeyword;
        });
    }, [expenses, filter]);

    const totalExpense = useMemo(
        () => filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
        [filteredExpenses]
    );

    const handleDelete = async (expense) => {
        if (!window.confirm(`Xóa khoản chi: ${expense.note || expense.category}?`)) return;
        try {
            await axios.delete(`/transactions/${expense.id}`);
            fetchExpenses();
        } catch {
            alert("Không thể xóa khoản chi!");
        }
    };

    const handleEdit = (expense) => {
        setSelectedExpense(expense);
        setOpenEdit(true);
    };

    return (
        <div className="min-h-screen bg-[#FCFCFD] px-4 py-4 md:px-8 md:py-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl">
                            <CreditCard size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Quản lý chi tiêu
                            </h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                                {loading
                                    ? "Đang đồng bộ..."
                                    : `${expenses.length} giao dịch tháng này`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <MonthPicker month={month} year={year} onChange={handleMonthChange} />
                        <button
                            onClick={() => setOpenAdd(true)}
                            className="flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-rose-700/20 transition-all active:scale-95 text-sm"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Thêm khoản chi
                        </button>
                    </div>
                </div>

                {/* --- SUMMARY & FILTER --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-stretch">
                    <div className="lg:col-span-1">
                        <ExpenseSummaryCard totalExpense={totalExpense} />
                    </div>
                    <div className="lg:col-span-3">
                        <FilterBar filter={filter} setFilter={setFilter} />
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                            <History size={18} className="text-rose-700" />
                            Lịch sử chi tiêu
                        </h2>
                        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                            <span className="text-[11px] font-black text-rose-700">
                                {filteredExpenses.length}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Bản ghi
                            </span>
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="h-16 bg-slate-50 animate-pulse rounded-2xl w-full"
                                    />
                                ))}
                            </div>
                        ) : filteredExpenses.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-slate-200" />
                                </div>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                                    Không có dữ liệu trùng khớp
                                </p>
                            </div>
                        ) : (
                            <ExpenseTable
                                data={filteredExpenses}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            <AddExpenseModal
                isOpen={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={fetchExpenses}
                userId={userId}
            />
            {selectedExpense && (
                <EditExpenseModal
                    isOpen={openEdit}
                    onClose={() => setOpenEdit(false)}
                    onSuccess={fetchExpenses}
                    expense={selectedExpense}
                />
            )}
        </div>
    );
}
