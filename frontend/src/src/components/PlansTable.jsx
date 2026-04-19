import { toNum } from "../utils/numberify";
import {
    Calendar,
    TrendingUp,
    MoreVertical,
    Eye,
    Edit3,
    Trash2,
    CheckCircle2,
} from "lucide-react";
import { useState } from "react";

export default function PlansTable({ data, onEdit, onDelete, onView }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 p-12 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={24} className="text-slate-300" />
                </div>
                <h3 className="text-slate-600 font-bold">
                    Chưa có kế hoạch nào
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                    Hãy bắt đầu tạo kế hoạch tiết kiệm đầu tiên của bạn!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={20} className="text-red-500" />
                    Danh sách kế hoạch
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">
                        {data.filter((p) => p.completed).length} Hoàn thành
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                Thông tin kế hoạch
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] hidden md:table-cell">
                                Mục tiêu tích lũy
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                Tiến độ
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] hidden sm:table-cell">
                                Trạng thái
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((plan) => {
                            const target = toNum(plan.target_amount);
                            const current = toNum(plan.current_amount);
                            const progress = Math.min(
                                toNum(plan.progress_percentage),
                                100
                            );

                            return (
                                <tr
                                    key={plan.id}
                                    className="group hover:bg-slate-50/50 transition-all"
                                >
                                    {/* Tên & Ngày */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 group-hover:text-red-600 transition-colors">
                                                {plan.title}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1 text-slate-400 text-[11px]">
                                                <Calendar size={12} />
                                                {plan.end_date
                                                    ? new Date(
                                                          plan.end_date
                                                      ).toLocaleDateString(
                                                          "vi-VN"
                                                      )
                                                    : "Không thời hạn"}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Số tiền - Ẩn trên mobile để đỡ chật */}
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">
                                                {current.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                ₫
                                            </span>
                                            <span className="text-[10px] text-slate-400 uppercase font-medium">
                                                mục tiêu:{" "}
                                                {target.toLocaleString("vi-VN")}{" "}
                                                ₫
                                            </span>
                                        </div>
                                    </td>

                                    {/* Thanh tiến độ */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 max-w-[140px]">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${
                                                        progress >= 100
                                                            ? "bg-emerald-500"
                                                            : "bg-red-500"
                                                    }`}
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-500">
                                                {progress.toFixed(0)}%
                                            </span>
                                        </div>
                                    </td>

                                    {/* Badge Trạng thái */}
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        {plan.completed ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                                                <CheckCircle2 size={14} /> Hoàn
                                                thành
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-orange-500 font-bold text-[11px]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />{" "}
                                                Đang chạy
                                            </div>
                                        )}
                                    </td>

                                    {/* Nút hành động */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onView(plan)}
                                                className="p-2 hover:bg-white hover:text-blue-600 rounded-lg text-slate-400 shadow-sm transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(plan)}
                                                className="p-2 hover:bg-white hover:text-amber-600 rounded-lg text-slate-400 shadow-sm transition-all"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onDelete(plan.id)
                                                }
                                                className="p-2 hover:bg-white hover:text-red-600 rounded-lg text-slate-400 shadow-sm transition-all"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {/* Hiển thị More trên Mobile */}
                                        <button className="md:hidden p-2 text-slate-400">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
