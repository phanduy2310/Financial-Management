import React from "react";
import axios from "../../api/axios";
import { Trash2 } from "lucide-react";

export default function InstallmentTable({ installments, onDeleteSuccess }) {
    const handleDelete = async (id) => {
        if (!window.confirm("Xóa khoản trả góp này?")) return;
        try {
            await axios.delete(`/saving/installments/${id}`);
            onDeleteSuccess();
        } catch (err) {
            console.error(err);
            alert("Không thể xóa khoản góp!");
        }
    };

    return (
        <div className="mt-6 bg-white shadow rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3">Lịch sử trả góp</h3>
            {installments.length === 0 ? (
                <p className="text-gray-500">Chưa có khoản trả góp nào.</p>
            ) : (
                <table className="w-full border-t border-gray-200">
                    <thead>
                        <tr className="text-left bg-gray-50">
                            <th className="py-2 px-3">Ngày góp</th>
                            <th className="py-2 px-3">Số tiền</th>
                            <th className="py-2 px-3">Ghi chú</th>
                            <th className="py-2 px-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {installments.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="py-2 px-3">
                                    {new Date(
                                        item.payment_date
                                    ).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="py-2 px-3 text-green-600 font-semibold">
                                    +{Number(item.amount).toLocaleString()}₫
                                </td>
                                <td className="py-2 px-3">
                                    {item.note || "-"}
                                </td>
                                <td className="py-2 px-3 text-right">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
