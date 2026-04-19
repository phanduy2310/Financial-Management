import React from "react";

export default function ExpenseSummaryCard({ totalExpense }) {
    return (
        <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-lg text-red-800 font-medium shadow-sm mb-6">
            Tổng chi tiêu hiện tại:{" "}
            <span className="font-bold text-lg">
                {totalExpense.toLocaleString("vi-VN")} ₫
            </span>
        </div>
    );
}
