import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import AddInstallmentModal from "../../components/saving/AddInstallmentModal";
import InstallmentTable from "../../components/saving/InstallmentTable";
import ProgressChart from "../../components/saving/ProgressChart";
import { useParams } from "react-router-dom";
import { PlusCircle } from "lucide-react";

export default function SavingDetail() {
    const { id } = useParams(); // id kế hoạch
    const [plan, setPlan] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [openModal, setOpenModal] = useState(false);

    const fetchData = async () => {
        try {
            const planRes = await axios.get(`/saving/detail/${id}`);
            setPlan(planRes.data);

            const instRes = await axios.get(`/saving/${id}/installments`);
            setInstallments(instRes.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (!plan) return <p className="text-center">Đang tải dữ liệu...</p>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {plan.title}
                    </h2>
                    <p className="text-gray-500">
                        Mục tiêu:{" "}
                        <span className="font-semibold text-green-600">
                            {Number(plan.target_amount).toLocaleString()}₫
                        </span>
                    </p>
                </div>
                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                >
                    <PlusCircle className="mr-2" /> Thêm khoản góp
                </button>
            </div>

            {/* Biểu đồ tiến độ */}
            <ProgressChart installments={installments} plan={plan} />

            {/* Bảng lịch sử trả góp */}
            <InstallmentTable
                installments={installments}
                onDeleteSuccess={fetchData}
            />

            {/* Modal thêm khoản góp */}
            {openModal && (
                <AddInstallmentModal
                    planId={plan.id}
                    onClose={() => setOpenModal(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
