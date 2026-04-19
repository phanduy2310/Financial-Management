import { CreditCard } from "lucide-react";

export default function ExpenseSummaryCard({ totalExpense, className }) {
    return (
        <div
            className={`bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 h-full ${className}`}
        >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-700 shrink-0">
                <CreditCard size={24} />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                    Tổng chi tiêu
                </p>
                <h2 className="text-xl font-black text-slate-800 truncate">
                    {totalExpense?.toLocaleString("vi-VN")}
                    <span className="ml-1 text-sm font-bold text-rose-700/60">₫</span>
                </h2>
            </div>
        </div>
    );
}
