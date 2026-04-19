import React from "react";
import { Landmark } from "lucide-react";

export default function IncomeSummaryCard({ totalIncome, className }) {
    return (
        <div
            className={`bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 h-full ${className}`}
        >
            {/* Icon với sắc đỏ Bách Khoa nhạt ở nền và đậm ở icon */}
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-700 shrink-0">
                <Landmark size={24} />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                    Tổng thu nhập
                </p>
                <h2 className="text-xl font-black text-slate-800 truncate">
                    {totalIncome?.toLocaleString("vi-VN")}
                    <span className="ml-1 text-sm font-bold text-red-700/60">
                        ₫
                    </span>
                </h2>
            </div>
        </div>
    );
}
