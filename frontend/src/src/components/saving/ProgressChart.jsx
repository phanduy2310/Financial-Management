import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function ProgressChart({ installments, plan }) {
    // Dữ liệu biểu đồ: cộng dồn tiền góp
    let total = 0;
    const data = installments
        .map((i) => ({
            date: new Date(i.payment_date).toLocaleDateString("vi-VN"),
            amount: (total += Number(i.amount)),
        }))
        .reverse();

    return (
        <div className="bg-white shadow rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3">
                Biểu đồ tiến độ tiết kiệm
            </h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3b82f6"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>

            <p className="text-center text-sm text-gray-500 mt-2">
                Tiến độ hiện tại:{" "}
                <span className="font-semibold text-blue-600">
                    {plan.progress_percentage}% (
                    {plan.current_amount.toLocaleString()}₫ /{" "}
                    {plan.target_amount.toLocaleString()}₫)
                </span>
            </p>
        </div>
    );
}
