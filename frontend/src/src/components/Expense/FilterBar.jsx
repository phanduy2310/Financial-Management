import React from "react";
import { Search, Filter } from "lucide-react";

export default function FilterBar({ filter, setFilter }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Tìm kiếm */}
            <div className="flex items-center gap-2">
                <Search className="text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm ghi chú hoặc danh mục..."
                    value={filter.keyword}
                    onChange={(e) =>
                        setFilter({ ...filter, keyword: e.target.value })
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none w-64"
                />
            </div>

            {/* Lọc danh mục */}
            <div className="flex items-center gap-2">
                <Filter className="text-gray-500" size={20} />
                <select
                    value={filter.category}
                    onChange={(e) =>
                        setFilter({ ...filter, category: e.target.value })
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-400 outline-none"
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
