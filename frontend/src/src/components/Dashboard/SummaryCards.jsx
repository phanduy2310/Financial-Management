import React from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

// Hàm format tiền tệ (có thể tách ra utils)
const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(val);

export default function SummaryCards({ summary, loading = false }) {
    const cards = [
        {
            name: "Số dư hiện tại",
            value: summary.balance,
            icon: Wallet,
            // Indigo: Tượng trưng cho sự ổn định, tin cậy
            colorClass: "text-indigo-600",
            bgClass: "bg-indigo-50",
            borderClass: "border-indigo-100",
            shadowClass: "shadow-indigo-100",
        },
        {
            name: "Tổng thu nhập",
            value: summary.income,
            icon: TrendingUp,
            // Emerald: Tượng trưng cho tài lộc, tăng trưởng
            colorClass: "text-emerald-600",
            bgClass: "bg-emerald-50",
            borderClass: "border-emerald-100",
            shadowClass: "shadow-emerald-100",
        },
        {
            name: "Tổng chi tiêu",
            value: summary.expense,
            icon: TrendingDown,
            // Rose: Màu cảnh báo nhưng nhẹ nhàng, hiện đại
            colorClass: "text-rose-600",
            bgClass: "bg-rose-50",
            borderClass: "border-rose-100",
            shadowClass: "shadow-rose-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((item, index) => {
                const Icon = item.icon;

                return (
                    <div
                        key={index}
                        className={`
                            relative overflow-hidden bg-white p-6 rounded-[2rem] 
                            border-2 ${item.borderClass} 
                            shadow-lg ${item.shadowClass} 
                            hover:-translate-y-1 hover:shadow-xl transition-all duration-300
                        `}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                                    {item.name}
                                </p>
                                {loading ? (
                                    // Skeleton Loader khi đang tải dữ liệu
                                    <div className="h-8 w-32 bg-slate-200 animate-pulse rounded-md"></div>
                                ) : (
                                    <h3
                                        className={`text-2xl lg:text-3xl font-black tracking-tight ${item.colorClass}`}
                                    >
                                        {formatCurrency(item.value)}
                                    </h3>
                                )}
                            </div>

                            {/* Icon Wrapper */}
                            <div
                                className={`p-4 rounded-2xl ${item.bgClass} ${item.colorClass}`}
                            >
                                <Icon size={28} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
