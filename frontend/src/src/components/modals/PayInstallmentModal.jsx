import React from "react";
import axios from "../../api/axios";

export default function PayInstallmentModal({ setOpen, plan, onSuccess }) {
    const handlePay = async () => {
        try {
            await axios.patch(`/installment/${plan.id}/pay`);
            onSuccess();
            setOpen(false);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Lỗi khi thanh toán";
            alert(message);
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="w-96 rounded-xl bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-bold">
                    Thanh toán kỳ tiếp theo cho {plan.title}
                </h3>
                <p className="mb-2">
                    <strong>Kỳ hiện tại:</strong> {plan.current_term}/
                    {plan.total_terms}
                </p>
                <p className="mb-4">
                    <strong>Số tiền mỗi kỳ:</strong>{" "}
                    {Number(plan.monthly_payment).toLocaleString()}₫
                </p>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-lg border px-4 py-2"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handlePay}
                        className="rounded-lg bg-green-500 px-4 py-2 text-white"
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
}
