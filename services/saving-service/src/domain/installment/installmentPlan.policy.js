const Money = require("../common/money");
const { createDomainError } = require("../common/domainError");
const { toDateOnlyTimestamp } = require("../common/dateValue");

function assertInstallmentPlanInfo({
    title,
    total_amount,
    monthly_payment,
    start_date,
    end_date,
    total_terms,
    paid_amount,
    current_term,
}) {
    if (typeof title !== "string" || title.trim() === "") {
        throw createDomainError(400, "title phai la chuoi khong rong");
    }

    const totalAmount = Money.from(total_amount, "total_amount");
    const monthlyPayment = Money.from(monthly_payment, "monthly_payment");
    const paidAmount = Money.from(paid_amount, "paid_amount");
    const totalTerms = Number(total_terms);
    const currentTerm = Number(current_term);

    if (!totalAmount.greaterThan(Money.zero())) {
        throw createDomainError(400, "total_amount phai la so duong");
    }

    if (!monthlyPayment.greaterThan(Money.zero())) {
        throw createDomainError(400, "monthly_payment phai la so duong");
    }

    if (!Number.isInteger(totalTerms) || totalTerms <= 0) {
        throw createDomainError(400, "total_terms phai la so nguyen duong");
    }

    if (!Number.isInteger(currentTerm) || currentTerm < 0) {
        throw createDomainError(400, "current_term hien tai khong hop le");
    }

    if (paidAmount.isNegative()) {
        throw createDomainError(400, "paid_amount hien tai khong hop le");
    }

    if (paidAmount.greaterThan(totalAmount)) {
        throw createDomainError(
            400,
            "total_amount khong the nho hon paid_amount hien tai"
        );
    }

    if (currentTerm > totalTerms) {
        throw createDomainError(
            400,
            "total_terms khong the nho hon current_term hien tai"
        );
    }

    const startDate = toDateOnlyTimestamp(start_date);
    const endDate = toDateOnlyTimestamp(end_date);
    if (
        Number.isNaN(startDate) ||
        Number.isNaN(endDate) ||
        startDate > endDate
    ) {
        throw createDomainError(400, "start_date phai nho hon hoac bang end_date");
    }
}

function computeInstallmentState({
    total_amount,
    paid_amount,
    total_terms,
    current_term,
}) {
    const totalAmount = Money.from(total_amount, "total_amount");
    const paidAmount = Money.from(paid_amount, "paid_amount");
    const totalTerms = Number(total_terms);
    const currentTerm = Number(current_term);
    const progressPercentage = Math.min(
        (paidAmount.toNumber() / totalAmount.toNumber()) * 100,
        100
    );

    return {
        total_amount: totalAmount.toNumber(),
        paid_amount: paidAmount.toNumber(),
        total_terms: totalTerms,
        current_term: currentTerm,
        progress_percentage: Number(progressPercentage.toFixed(2)),
        completed:
            paidAmount.greaterThanOrEqual(totalAmount) || currentTerm >= totalTerms,
    };
}

function computeActualPaymentAmount({
    total_amount,
    paid_amount,
    monthly_payment,
}) {
    const totalAmount = Money.from(total_amount, "total_amount");
    const paidAmount = Money.from(paid_amount, "paid_amount");
    const monthlyPayment = Money.from(monthly_payment, "monthly_payment");
    const remainingAmount = totalAmount.subtract(paidAmount);

    if (remainingAmount.isNegative() || remainingAmount.isZero()) {
        throw createDomainError(
            400,
            "Khoản trả góp đã đủ số tiền, không thể thanh toán thêm"
        );
    }

    return monthlyPayment.min(remainingAmount).toNumber();
}

module.exports = {
    assertInstallmentPlanInfo,
    computeActualPaymentAmount,
    computeInstallmentState,
};
