import { Search, Filter } from "lucide-react";

export default function FilterBar({ filter, setFilter, className }) {
    return (
        <div
            className={`bg-white rounded-3xl border border-slate-100 shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-4 h-full ${className}`}
        >
            <div className="flex flex-1 items-center gap-3 min-w-[240px]">
                <Search className="text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Tìm kiếm ghi chú hoặc danh mục..."
                    value={filter.keyword}
                    onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-600/10 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                />
            </div>

            <div className="flex items-center gap-3">
                <div className="w-[1px] h-8 bg-slate-100 hidden md:block mx-2" />
                <Filter className="text-slate-400" size={18} />
                <select
                    value={filter.category}
                    onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                    className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-rose-600/10 outline-none cursor-pointer hover:bg-rose-50 transition-all"
                >
                    <option value="all">Tất cả danh mục</option>
                    <option value="food">Ăn uống</option>
                    <option value="transport">Di chuyển</option>
                    <option value="shopping">Mua sắm</option>
                    <option value="entertainment">Giải trí</option>
                    <option value="others">Khác</option>
                </select>
            </div>
        </div>
    );
}
