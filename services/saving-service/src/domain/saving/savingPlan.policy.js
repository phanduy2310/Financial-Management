const Money = require("../common/money");
const { createDomainError } = require("../common/domainError");
const { toDateOnlyTimestamp } = require("../common/dateValue");

function assertSavingPlanInfo({ title, start_date, end_date, target_amount }) {
    if (typeof title !== "string" || title.trim() === "") {
        throw createDomainError(400, "title phai la chuoi khong rong");
    }

    const targetAmount = Money.from(target_amount, "target_amount");
    if (!targetAmount.greaterThan(Money.zero())) {
        throw createDomainError(400, "target_amount phai la so duong");
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

function computeSavingPlanState({ target_amount, current_amount }) {
    const targetAmount = Money.from(target_amount, "target_amount");
    const currentAmount = Money.from(current_amount, "current_amount");

    if (currentAmount.isNegative()) {
        throw createDomainError(400, "current_amount phai la so khong am");
    }

    const completed = currentAmount.greaterThanOrEqual(targetAmount);
    const progressPercentage = Math.min(
        (currentAmount.toNumber() / targetAmount.toNumber()) * 100,
        100
    );

    return {
        target_amount: targetAmount.toNumber(),
        current_amount: currentAmount.toNumber(),
        progress_percentage: Number(progressPercentage.toFixed(2)),
        completed,
    };
}

module.exports = {
    assertSavingPlanInfo,
    computeSavingPlanState,
};
