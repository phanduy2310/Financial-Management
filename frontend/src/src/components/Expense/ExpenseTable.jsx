import { Pencil, Trash2, Calendar, Inbox } from "lucide-react";

export default function ExpenseTable({ data, onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">#</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Ngày</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Danh mục</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Ghi chú</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Số tiền</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {data.length > 0 ? (
                        data.map((expense, index) => (
                            <tr
                                key={expense.id}
                                className="hover:bg-rose-50/30 transition-colors group"
                            >
                                <td className="px-6 py-4 text-slate-400 font-medium">
                                    {String(index + 1).padStart(2, "0")}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                                        <Calendar size={14} className="text-slate-300" />
                                        {new Date(expense.date || expense.created_at).toLocaleDateString("vi-VN")}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold uppercase tracking-tighter border border-rose-100">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 italic max-w-[200px] truncate">
                                    {expense.note || "-"}
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                                    {Number(expense.amount).toLocaleString("vi-VN")}
                                    <span className="ml-1 text-[10px] text-rose-700">₫</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <button
                                            onClick={() => onEdit(expense)}
                                            className="p-2 text-slate-400 hover:text-rose-700 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-rose-100 transition-all"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(expense)}
                                            className="p-2 text-slate-400 hover:text-rose-700 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-rose-100 transition-all"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="py-24 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Inbox size={48} className="text-slate-100" />
                                    <p className="text-slate-400 font-medium">
                                        Chưa có dữ liệu giao dịch
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
