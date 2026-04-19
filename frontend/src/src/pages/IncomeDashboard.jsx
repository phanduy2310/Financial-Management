import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "../api/axios";
import { Plus, Wallet, Search, ArrowUpCircle, History } from "lucide-react";
import IncomeTable from "../components/Income/IncomeTable";
import FilterBar from "../components/Income/FilterBar";
import IncomeSummaryCard from "../components/Income/IncomeSummaryCard";
import AddIncomeModal from "../components/modals/AddIncomeModal";
import EditIncomeModal from "../components/modals/EditIncomeModal";
import { useUserId } from "../hooks/useUserId";

export default function IncomeDashboard() {
    const userId = useUserId();
    const [incomes, setIncomes] = useState([]);
    const [filter, setFilter] = useState({ keyword: "", category: "all" });
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchIncomes = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await axios.get(`/transactions/${userId}`);
            const list = (res.data.data || []).filter(
                (t) => t.type === "income"
            );
            setIncomes(list);
        } catch (err) {
            console.error("Error fetching incomes:", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchIncomes();
    }, [fetchIncomes]);

    const filteredIncomes = useMemo(() => {
        return incomes.filter((i) => {
            const matchCategory =
                filter.category === "all" || i.category === filter.category;
            const keyword = filter.keyword.toLowerCase();
            return (
                i.note?.toLowerCase().includes(keyword) ||
                i.category?.toLowerCase().includes(keyword)
            );
        });
    }, [incomes, filter]);

    const totalIncome = useMemo(() => {
        return filteredIncomes.reduce(
            (sum, i) => sum + Number(i.amount || 0),
            0
        );
    }, [filteredIncomes]);

    const handleDelete = async (income) => {
        if (!window.confirm(`Xóa thu nhập: ${income.note || income.category}?`))
            return;
        try {
            await axios.delete(`/transactions/${income.id}`);
            fetchIncomes();
        } catch (err) {
            alert("Không thể xóa!");
        }
    };

    const handleEdit = (income) => {
        setSelectedIncome(income);
        setOpenEdit(true);
    };

    return (
        <div className="min-h-screen bg-[#FCFCFD] px-4 py-4 md:px-8 md:py-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Icon Wallet với màu đỏ Bách Khoa */}
                        <div className="p-3 bg-red-50 text-red-700 rounded-2xl">
                            <Wallet size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Quản lý thu nhập
                            </h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                {loading
                                    ? "Đang đồng bộ..."
                                    : `${incomes.length} Giao dịch hệ thống`}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setOpenAdd(true)}
                        className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-red-700/20 transition-all active:scale-95 text-sm"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Thêm thu nhập
                    </button>
                </div>

                {/* --- SUMMARY & FILTER --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-stretch">
                    <div className="lg:col-span-1">
                        <IncomeSummaryCard totalIncome={totalIncome} />
                    </div>

                    <div className="lg:col-span-3">
                        <FilterBar filter={filter} setFilter={setFilter} />
                    </div>
                </div>

                {/* --- TABLE SECTION --- */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                            <History size={18} className="text-red-700" />
                            Lịch sử dòng tiền
                        </h2>
                        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                            <span className="text-[11px] font-black text-red-700">
                                {filteredIncomes.length}
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
                        ) : filteredIncomes.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search
                                        size={32}
                                        className="text-slate-200"
                                    />
                                </div>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                                    Không có dữ liệu trùng khớp
                                </p>
                            </div>
                        ) : (
                            <IncomeTable
                                data={filteredIncomes}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            <AddIncomeModal
                isOpen={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={fetchIncomes}
                userId={userId}
            />
            {selectedIncome && (
                <EditIncomeModal
                    isOpen={openEdit}
                    onClose={() => setOpenEdit(false)}
                    onSuccess={fetchIncomes}
                    income={selectedIncome}
                />
            )}
        </div>
    );
}
