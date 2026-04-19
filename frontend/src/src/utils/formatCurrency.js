// utils/formatCurrency.js
export const formatVND = (value) => {
    const num = Number(value || 0);
    if (isNaN(num)) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(num);
};
