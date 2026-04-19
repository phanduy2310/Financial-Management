import React from "react";
import { Users, UserCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function GroupCard({ group, onClick }) {
    // Chỉ giữ lại các dải màu Gradient tinh tế hơn
    const gradients = [
        "from-red-600 to-red-800",
        "from-slate-700 to-slate-900",
        "from-blue-700 to-blue-900",
        "from-emerald-700 to-emerald-900",
    ];
    const gradientIndex = (group.id || 0) % gradients.length;
    const selectedGradient = gradients[gradientIndex];

    return (
        <motion.div
            whileHover={{ y: -8 }}
            onClick={onClick}
            className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
        >
            {/* Top Accent Gradient Bar */}
            <div
                className={`h-2 w-full bg-gradient-to-r ${selectedGradient} opacity-80`}
            />

            <div className="p-8 flex flex-col h-full">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-red-700 transition-colors uppercase tracking-tight">
                            {group.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <Users size={12} strokeWidth={3} />
                                {group.member_count ?? 0} Thành viên
                            </span>
                        </div>
                    </div>

                    <div
                        className={`p-4 rounded-2xl bg-gradient-to-br ${selectedGradient} shadow-lg shadow-slate-200 group-hover:rotate-12 transition-transform duration-500`}
                    >
                        <Users size={24} className="text-white" />
                    </div>
                </div>

                {/* Body Section */}
                <p className="text-slate-400 text-sm font-bold leading-relaxed line-clamp-2 mb-8 flex-1 italic px-1">
                    "{group.description || "Không có mô tả cho nhóm này."}"
                </p>

                {/* Footer Section */}
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 group/owner">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover/owner:bg-red-50 group-hover/owner:text-red-600 transition-colors">
                            <UserCircle size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                                Trưởng nhóm
                            </span>
                            <span className="text-xs font-black text-slate-700 truncate max-w-[100px]">
                                {group.owner_name ?? "PTITer"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-red-700 font-black text-[11px] uppercase tracking-widest group-hover:gap-4 transition-all">
                        Truy cập
                        <ArrowRight size={18} strokeWidth={3} />
                    </div>
                </div>
            </div>

            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 rounded-[2.5rem] border border-white/20 pointer-events-none" />
        </motion.div>
    );
}
