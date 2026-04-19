import React from "react";
import { PiggyBank } from "lucide-react";

export default function SavingSummaryCard({ totalSaved }) {
    return (
        <div
            className="
                relative h-full overflow-hidden
                bg-white rounded-2xl
                border border-slate-100 shadow-sm
                p-6 transition
                hover:shadow-md
            "
        >
            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-pink-50 rounded-full opacity-60" />

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="p-3 bg-pink-100 rounded-xl text-pink-600">
                        <PiggyBank size={28} strokeWidth={2.2} />
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Tổng đã tiết kiệm
                        </h3>

                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                {Number(totalSaved || 0).toLocaleString(
                                    "vi-VN"
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Optional badge */}
                <div className="mt-4">
                    <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">
                        Đang tăng trưởng
                    </span>
                </div>
            </div>
        </div>
    );
}
