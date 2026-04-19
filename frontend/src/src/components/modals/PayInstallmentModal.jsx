import React from "react";
import axios from "../../api/axios";

export default function PayInstallmentModal({ setOpen, plan, onSuccess }) {
    const handlePay = async () => {
        try {
            await axios.patch(`/installment/${plan.id}/pay`);
            onSuccess();
            setOpen(false);
        } catch (err) {
            alert("Lỗi khi thanh toán");
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-xl w-96 shadow-md">
                <h3 className="text-lg font-bold mb-4">
                    Thanh toán kỳ tiếp theo cho {plan.title}
                </h3>
                <p className="mb-2">
                    <strong>Kỳ hiện tại:</strong> {plan.current_term}/
                    {plan.total_terms}
                </p>
                <p className="mb-4">
                    <strong>Số tiền mỗi kỳ:</strong>{" "}
                    {plan.monthly_payment.toLocaleString()}₫
                </p>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handlePay}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg"
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
}
