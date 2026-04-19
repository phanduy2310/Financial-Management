import React from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";

export default function SavingFilterBar({ filter, setFilter }) {
    // Hàm xóa nhanh nội dung tìm kiếm
    const clearSearch = () => setFilter({ ...filter, keyword: "" });

    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/50 p-2 rounded-2xl backdrop-blur-sm">
            {/* Search Input Group */}
            <div className="relative flex-1 group">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors"
                />
                <input
                    type="text"
                    placeholder="Tìm kiếm kế hoạch..."
                    value={filter.keyword}
                    onChange={(e) =>
                        setFilter({ ...filter, keyword: e.target.value })
                    }
                    className="
                        w-full pl-11 pr-12 py-3 rounded-xl
                        border border-slate-200 bg-white text-slate-800
                        placeholder:text-slate-400
                        shadow-sm shadow-slate-100
                        focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10
                        outline-none transition-all duration-200
                    "
                />

                {/* Nút Xóa nhanh hoặc Shortcut hint */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {filter.keyword ? (
                        <button
                            onClick={clearSearch}
                            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    ) : (
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-sans text-[10px] font-medium text-slate-400 opacity-100">
                            <span className="text-xs">/</span>
                        </kbd>
                    )}
                </div>
            </div>

            {/* Status Select Group */}
            <div className="relative w-full md:w-64">
                <Filter
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <select
                    value={filter.status}
                    onChange={(e) =>
                        setFilter({ ...filter, status: e.target.value })
                    }
                    className="
                        w-full pl-11 pr-10 py-3 rounded-xl
                        border border-slate-200 bg-white text-slate-700
                        shadow-sm shadow-slate-100
                        focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10
                        outline-none transition-all duration-200
                        appearance-none cursor-pointer
                    "
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">🎯 Đang thực hiện</option>
                    <option value="completed">✅ Đã hoàn thành</option>
                </select>
                {/* Custom Arrow Icon */}
                <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
            </div>
        </div>
    );
}
