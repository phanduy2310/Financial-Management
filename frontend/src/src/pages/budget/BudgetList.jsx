import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Plus, CheckCircle, Calendar, PiggyBank } from "lucide-react";
import AddBudgetModal from "../../components/budget/AddBudgetModal";
import UpdateProgressModal from "../../components/budget/UpdateProgressModal";
import { useUserId } from "../../hooks/useUserId";

export default function BudgetList() {
    const user_id = useUserId();
    const [budgets, setBudgets] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [selected, setSelected] = useState(null);

    const fetchBudgets = async () => {
        const res = await axios.get(`/budget/${user_id}`);
        setBudgets(res.data.data || res.data);
    };

    useEffect(() => {
        if (user_id) {
            fetchBudgets();
        }
    }, [user_id]);

    return (
        <div className="max-w-5xl mx-auto px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                    Kế hoạch chi tiêu
                </h1>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 
                        text-white px-5 py-2.5 rounded-xl shadow hover:opacity-90"
                >
                    <Plus size={20} /> Tạo kế hoạch
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgets.map((b) => (
                    <div
                        key={b.id}
                        className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                        {/* Title + Status */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {b.title}
                            </h2>

                            {b.completed ? (
                                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                    <CheckCircle size={18} /> Hoàn thành
                                </span>
                            ) : null}
                        </div>

                        {/* Target */}
                        <p className="text-gray-500 mt-2 flex items-center gap-2">
                            <PiggyBank size={18} />
                            Mục tiêu:{" "}
                            <span className="font-semibold text-gray-700">
                                {Number(b.target_amount).toLocaleString()}đ
                            </span>
                        </p>

                        {/* Date */}
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Calendar size={18} /> {b.start_date} → {b.end_date}
                        </p>

                        {/* Progress bar */}
                        <div className="mt-5">
                            <div className="w-full h-3 rounded-full bg-gray-200">
                                <div
                                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                                    style={{
                                        width: `${b.progress_percentage}%`,
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-sm text-gray-600">
                                <span>
                                    Đã chi:{" "}
                                    <strong>
                                        {Number(
                                            b.spent_amount
                                        ).toLocaleString()}
                                        đ
                                    </strong>
                                </span>
                                <span>{b.progress_percentage}%</span>
                            </div>
                        </div>

                        {/* Update button */}
                        {!b.completed && (
                            <div className="flex justify-end mt-5">
                                <button
                                    onClick={() => {
                                        setSelected(b);
                                        setShowProgress(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    Cập nhật tiến độ →
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showAdd && (
                <AddBudgetModal
                    onClose={() => setShowAdd(false)}
                    refresh={fetchBudgets}
                />
            )}
            {showProgress && (
                <UpdateProgressModal
                    budget={selected}
                    onClose={() => setShowProgress(false)}
                    refresh={fetchBudgets}
                />
            )}
        </div>
    );
}
