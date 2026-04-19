import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Plus } from "lucide-react";
import ExpenseTable from "../components/Expense/ExpenseTable";
import FilterBar from "../components/Expense/FilterBar";
import ExpenseSummaryCard from "../components/Expense/ExpenseSummaryCard";
import AddExpenseModal from "../components/modals/AddExpenseModal";
import EditExpenseModal from "../components/modals/EditExpenseModal";
import { useUserId } from "../hooks/useUserId";

export default function ExpenseDashboard() {
    const userId = useUserId();
    const [expenses, setExpenses] = useState([]);
    const [filter, setFilter] = useState({ keyword: "", category: "all" });
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    // Fetch danh sách
    const fetchExpenses = async () => {
        try {
            const res = await axios.get(`/transactions`);
            const list = res.data.data.filter((t) => t.type === "expense");
            setExpenses(list);
        } catch (err) {
            console.error("Error fetching expenses:", err);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchExpenses();
        }
    }, [userId, openAdd, openEdit]);

    // Lọc danh sách
    const filtered = expenses.filter((e) => {
        const matchCategory =
            filter.category === "all" || e.category === filter.category;
        const matchKeyword =
            e.note?.toLowerCase().includes(filter.keyword.toLowerCase()) ||
            e.category?.toLowerCase().includes(filter.keyword.toLowerCase());
        return matchCategory && matchKeyword;
    });

    const totalExpense = filtered.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
    );

    // Xóa
    const handleDelete = async (expense) => {
        if (
            !window.confirm(
                `Xóa khoản chi: ${expense.note || expense.category}?`
            )
        )
            return;
        try {
            await axios.delete(`/transactions/${expense.id}`);
            fetchExpenses();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Không thể xóa khoản chi!");
        }
    };

    // Sửa
    const handleEdit = (expense) => {
        setSelectedExpense(expense);
        setOpenEdit(true);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-red-700">
                    💸 Quản lý khoản chi
                </h1>
                <button
                    onClick={() => setOpenAdd(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl shadow"
                >
                    <Plus size={18} /> Thêm khoản chi
                </button>
            </div>

            {/* Modals */}
            <AddExpenseModal
                isOpen={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={fetchExpenses}
                userId={userId}
            />
            <EditExpenseModal
                isOpen={openEdit}
                onClose={() => setOpenEdit(false)}
                onSuccess={fetchExpenses}
                expense={selectedExpense}
            />

            {/* Bộ lọc + Thống kê + Bảng */}
            <FilterBar filter={filter} setFilter={setFilter} />
            <ExpenseSummaryCard totalExpense={totalExpense} />
            <ExpenseTable
                data={filtered}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
