import React from "react";
import { History, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";

const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(val);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
    }).format(date);
};

export default function RecentTransactions({ transactions }) {
    const displayTransactions = transactions.slice(0, 6);

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-[480px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                    <History className="text-red-700" size={20} />
                    Giao dịch gần đây
                </h3>
                <button className="text-[10px] font-black text-red-700 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider hover:bg-red-700 hover:text-white transition-all">
                    Xem tất cả
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                {displayTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <p className="text-xs font-bold uppercase tracking-widest">
                            Trống
                        </p>
                    </div>
                ) : (
                    displayTransactions.map((t, idx) => {
                        const isExpense = t.type === "expense";
                        return (
                            <div
                                key={idx}
                                className="flex items-center justify-between group cursor-default"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-3 rounded-2xl transition-all ${
                                            isExpense
                                                ? "bg-red-50 text-red-600"
                                                : "bg-emerald-50 text-emerald-600"
                                        }`}
                                    >
                                        {isExpense ? (
                                            <ArrowDownLeft size={18} />
                                        ) : (
                                            <ArrowUpRight size={18} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1">
                                            {t.category || "Khác"}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            {formatDate(t.date)}
                                        </p>
                                    </div>
                                </div>
                                <p
                                    className={`text-sm font-black ${
                                        isExpense
                                            ? "text-red-600"
                                            : "text-emerald-600"
                                    }`}
                                >
                                    {isExpense ? "-" : "+"}
                                    {Math.abs(t.amount).toLocaleString()}₫
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
