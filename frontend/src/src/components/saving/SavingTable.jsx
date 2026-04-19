import React from "react";
import { Trash2, CheckCircle, TrendingUp, Target, Rocket } from "lucide-react";
import { formatVND } from "../../utils/formatCurrency";
import { motion } from "framer-motion";

export default function SavingTable({ data, onUpdate, onComplete, onDelete }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((plan, index) => {
                const target = Number(plan.target_amount || 0);
                const current = Number(plan.current_amount || 0);

                // Tính toán phần trăm tiến độ
                let progress = Number(plan.progress_percentage);
                if (isNaN(progress) || progress < 0) {
                    progress = target > 0 ? (current / target) * 100 : 0;
                }
                progress = Math.min(100, progress);

                const isCompleted = plan.completed || progress >= 100;

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={plan.id}
                        className="relative group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6">
                            {isCompleted ? (
                                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-100">
                                    <CheckCircle size={12} strokeWidth={3} />{" "}
                                    Finished
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-100">
                                    <Rocket size={12} strokeWidth={3} /> In
                                    Progress
                                </span>
                            )}
                        </div>

                        {/* Title & Info */}
                        <div className="mb-6">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-red-700 transition-colors">
                                {plan.title?.replace(/^mục\s+/i, "")}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Target size={14} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-400">
                                    Mục tiêu: {formatVND(target)}
                                </span>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Hiện có
                                    </p>
                                    <p className="text-xl font-black text-slate-900">
                                        {formatVND(current)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-red-700 italic">
                                        {progress.toFixed(0)}
                                        <span className="text-sm ml-0.5">
                                            %
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Custom Progress Bar */}
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-50">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{
                                        duration: 1,
                                        ease: "easeOut",
                                    }}
                                    className={`h-full rounded-full ${
                                        isCompleted
                                            ? "bg-emerald-500"
                                            : "bg-red-700"
                                    } shadow-[0_0_12px_rgba(185,28,28,0.3)]`}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-100">
                            <div className="flex gap-2">
                                {!isCompleted && (
                                    <>
                                        <button
                                            onClick={() => onUpdate(plan)}
                                            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-slate-200"
                                            title="Cập nhật tiến độ"
                                        >
                                            <TrendingUp
                                                size={18}
                                                strokeWidth={2.5}
                                            />
                                        </button>
                                        <button
                                            onClick={() => onComplete(plan)}
                                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                            title="Hoàn thành mục tiêu"
                                        >
                                            <CheckCircle
                                                size={18}
                                                strokeWidth={2.5}
                                            />
                                        </button>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => onDelete(plan)}
                                className="p-3 text-slate-300 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                                title="Xóa mục tiêu"
                            >
                                <Trash2 size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
