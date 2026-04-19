import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export default function ExpenseChart({ data }) {
    return (
        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                    Biến động thu chi tháng
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[350px] text-slate-300">
                        <p className="italic font-medium text-sm text-slate-400 font-bold uppercase tracking-widest">
                            Không có dữ liệu báo cáo
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#F1F5F9"
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94A3B8",
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94A3B8",
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                            />
                            <Tooltip
                                cursor={{ stroke: "#E2E8F0", strokeWidth: 2 }}
                                contentStyle={{
                                    borderRadius: "16px",
                                    border: "none",
                                    boxShadow:
                                        "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                    padding: "12px",
                                }}
                                formatter={(value) => Number(value).toLocaleString("vi-VN") + "đ"}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                            />
                            <Line
                                type="smooth"
                                dataKey="thu"
                                name="Thu nhập"
                                stroke="#10B981"
                                strokeWidth={4}
                                dot={false}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                            <Line
                                type="smooth"
                                dataKey="chi"
                                name="Chi tiêu"
                                stroke="#EF4444"
                                strokeWidth={4}
                                dot={false}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
