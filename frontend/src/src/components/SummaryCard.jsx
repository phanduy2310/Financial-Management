import React from "react";

export default function SummaryCard({
    title,
    value,
    icon,
    bgColor,
    textColor,
}) {
    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
            {/* Icon Wrapper với màu nền nhẹ (Soft Background) */}
            <div
                className={`w-12 h-12 rounded-2xl ${
                    bgColor || "bg-slate-50"
                } flex items-center justify-center transition-transform group-hover:scale-110`}
            >
                {React.cloneElement(icon, {
                    size: 24,
                    className: textColor || "text-slate-600",
                })}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                    {title}
                </p>
                <h2 className="text-xl font-black text-slate-800 truncate leading-none">
                    {value ?? 0}
                </h2>
            </div>
        </div>
    );
}
