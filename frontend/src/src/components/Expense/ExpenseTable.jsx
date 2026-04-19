import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function ExpenseTable({ data, onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
            <table className="min-w-full border text-sm text-gray-700">
                <thead className="bg-red-500 text-white text-left">
                    <tr>
                        <th className="px-4 py-2 border">#</th>
                        <th className="px-4 py-2 border">Ngày</th>
                        <th className="px-4 py-2 border">Số tiền</th>
                        <th className="px-4 py-2 border">Danh mục</th>
                        <th className="px-4 py-2 border">Ghi chú</th>
                        <th className="px-4 py-2 border text-center">
                            Hành động
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((expense, index) => (
                            <tr
                                key={expense.id}
                                className="hover:bg-gray-50 text-center"
                            >
                                <td className="px-4 py-2 border">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-2 border">
                                    {new Date(
                                        expense.date || expense.created_at
                                    ).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="px-4 py-2 border text-red-600 font-semibold">
                                    {Number(expense.amount).toLocaleString(
                                        "vi-VN"
                                    )}{" "}
                                    ₫
                                </td>
                                <td className="px-4 py-2 border">
                                    {expense.category}
                                </td>
                                <td className="px-4 py-2 border text-gray-600">
                                    {expense.note || "-"}
                                </td>
                                <td className="px-4 py-2 border flex justify-center gap-3">
                                    <button
                                        onClick={() => onEdit(expense)}
                                        className="text-blue-500 hover:text-blue-700 transition"
                                        title="Chỉnh sửa"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(expense)}
                                        className="text-red-500 hover:text-red-700 transition"
                                        title="Xóa"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="6"
                                className="text-center text-gray-400 py-4 italic"
                            >
                                Không có khoản chi nào được tìm thấy.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
