import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
    Users,
    PlusCircle,
    ArrowLeft,
    Wallet,
    TrendingDown,
    TrendingUp,
    Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AddGroupTransactionModal from "../../components/group/AddGroupTransactionModal";
import ManageMemberModal from "../../components/group/ManageMemberModal";
import TransactionDetailModal from "../../components/group/TransactionDetailModal";

export default function GroupDetail() {
    const { groupId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [group, setGroup] = useState(location.state?.group || null);
    const [members, setMembers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        income: 0,
        expense: 0,
        balance: 0,
    });

    const [openAddTrans, setOpenAddTrans] = useState(false);
    const [openMemberModal, setOpenMemberModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    const [activeTab, setActiveTab] = useState("expense");
    const filtered = transactions.filter((t) => t.type === activeTab);

    // =====================
    // FETCH DATA
    // =====================
    const refreshAll = useCallback(async () => {
        try {
            const [memRes, transRes, sumRes] = await Promise.all([
                axios.get(`/group-members/${groupId}`),
                axios.get(`/group-transactions/${groupId}`),
                axios.get(`/group-transactions/${groupId}/summary`),
            ]);
            setMembers(memRes.data.data || memRes.data);
            setTransactions(transRes.data.data || transRes.data);
            setSummary(sumRes.data.data || sumRes.data);
        } catch (err) {
            console.error("Error refreshing group data:", err);
        }
    }, [groupId]);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
            {/* HEADER: GLASSMORPHISM STYLE */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-red-900/20"
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-700/20 blur-[80px] -mr-32 -mt-32 rounded-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 blur-[60px] -ml-24 -mb-24 rounded-full" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-4 rounded-2xl bg-white/10 hover:bg-red-700 transition-all border border-white/10 group"
                        >
                            <ArrowLeft
                                size={24}
                                className="group-hover:-translate-x-1 transition-transform"
                            />
                        </button>

                        <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-inner">
                            <Users size={32} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">
                                {group?.name || "Chi tiết nhóm"}
                            </h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">
                                {members.length} Thành viên đang tham gia
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setOpenAddTrans(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-lg shadow-red-900/40"
                        >
                            <PlusCircle size={18} strokeWidth={3} /> Thêm chi
                            tiêu
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    label="Tổng thu nhập"
                    value={summary.income}
                    icon={<TrendingUp className="text-emerald-500" />}
                    color="emerald"
                />
                <SummaryCard
                    label="Tổng chi tiêu"
                    value={summary.expense}
                    icon={<TrendingDown className="text-red-500" />}
                    color="red"
                />
                <SummaryCard
                    label="Số dư hiện tại"
                    value={summary.balance}
                    icon={<Wallet className="text-slate-500" />}
                    color="slate"
                    isBalance
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* MEMBERS COLUMN */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Users size={20} className="text-red-700" />{" "}
                                Thành viên
                            </h2>
                            <button
                                onClick={() => setOpenMemberModal(true)}
                                className="p-2 bg-slate-50 text-slate-400 hover:text-red-700 rounded-xl transition-colors"
                            >
                                <Settings2 size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {members.map((m) => (
                                <div
                                    key={m.id || m.user_id}
                                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md">
                                            {m.user?.fullname
                                                ?.charAt(0)
                                                .toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-sm leading-none uppercase">
                                                {m.user?.fullname || "PTITer"}
                                            </p>
                                            <span
                                                className={`text-[9px] font-black uppercase tracking-tighter ${
                                                    m.role === "owner"
                                                        ? "text-amber-600"
                                                        : "text-slate-400"
                                                }`}
                                            >
                                                {m.role === "owner"
                                                    ? "Chủ sở hữu"
                                                    : "Thành viên"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TRANSACTIONS COLUMN */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h2 className="font-black text-slate-900 uppercase tracking-tight text-xl">
                            Lịch sử giao dịch
                        </h2>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
                            <TabButton
                                active={activeTab === "expense"}
                                onClick={() => setActiveTab("expense")}
                                label="Chi tiêu"
                            />
                            <TabButton
                                active={activeTab === "income"}
                                onClick={() => setActiveTab("income")}
                                label="Thu vào"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {filtered.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200"
                                >
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                                        Không tìm thấy dữ liệu
                                    </p>
                                </motion.div>
                            ) : (
                                filtered.map((t) => (
                                    <TransactionItem
                                        key={
                                            t.id ||
                                            t.transaction_id ||
                                            t.group_transaction_id
                                        }
                                        data={t}
                                        onClick={(id) => {
                                            setSelectedTransactionId(id);
                                            setOpenDetailModal(true);
                                        }}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {openAddTrans && (
                <AddGroupTransactionModal
                    groupId={groupId}
                    members={members}
                    onClose={() => setOpenAddTrans(false)}
                    refresh={refreshAll}
                />
            )}
            {openMemberModal && (
                <ManageMemberModal
                    groupId={groupId}
                    members={members}
                    onClose={() => setOpenMemberModal(false)}
                    refresh={refreshAll}
                />
            )}
            {openDetailModal && (
                <TransactionDetailModal
                    transactionId={selectedTransactionId}
                    onClose={() => setOpenDetailModal(false)}
                />
            )}
        </div>
    );
}

// Sub-components for cleaner code
function SummaryCard({ label, value, icon, color, isBalance }) {
    const colorClasses = {
        emerald: "text-emerald-600 bg-emerald-50",
        red: "text-red-600 bg-red-50",
        slate: "text-slate-900 bg-slate-50",
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${colorClasses[color]}`}
            >
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                    {label}
                </p>
                <p
                    className={`text-xl font-black tracking-tight ${
                        isBalance && value < 0
                            ? "text-red-600"
                            : "text-slate-900"
                    }`}
                >
                    {value?.toLocaleString()}đ
                </p>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                active
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
            }`}
        >
            {label}
        </button>
    );
}

function TransactionItem({ data, onClick }) {
    const id =
        data.id ||
        data.transaction_id ||
        data.group_transaction_id ||
        data.group_transaction?.id ||
        data.transaction?.id;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => onClick(Number(id))}
            className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-red-200 hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                        data.type === "income"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                    }`}
                >
                    {data.type === "income" ? (
                        <TrendingUp size={20} />
                    ) : (
                        <TrendingDown size={20} />
                    )}
                </div>
                <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">
                        {data.category || "Giao dịch nhóm"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                        {new Date(data.created_at).toLocaleDateString("vi-VN")}{" "}
                        • ID: {id}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p
                    className={`text-lg font-black tracking-tighter ${
                        data.type === "income"
                            ? "text-emerald-600"
                            : "text-red-600"
                    }`}
                >
                    {data.type === "income" ? "+" : "-"}
                    {Number(data.amount).toLocaleString()}đ
                </p>
                {data.note && (
                    <p className="text-[10px] text-slate-400 italic max-w-[150px] truncate">
                        {data.note}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
