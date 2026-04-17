const SavingPlan = require("../models/saving.model");
const transactionClient = require("../clients/transaction.client");
const notifyClient = require("../clients/notification.client");

function buildHttpError(status, message, details) {
    const err = new Error(message);
    err.status = status;
    err.details = details;
    return err;
}

function buildPlanCompletedTransactionPayload(plan) {
    return {
        user_id: plan.user_id,
        category: "Thực hiện kế hoạch tiết kiệm",
        type: "expense",
        amount: Number(plan.target_amount),
        date: new Date().toISOString().slice(0, 10),
        note: `Hoàn thành kế hoạch tiết kiệm: ${plan.title}`,
    };
}

async function loadSavingPlanForUpdate(trx, planId) {
    const plan = await SavingPlan.query(trx).findById(planId).forUpdate();

    if (!plan) {
        throw buildHttpError(404, "Không tìm thấy kế hoạch");
    }

    return plan;
}

async function applySavingPlanState({
    trx,
    plan,
    nextCurrentAmount,
    completionErrorMessage,
    additionalPatch = {},
}) {
    const currentAmount = Number(nextCurrentAmount);
    const targetAmount = Number(plan.target_amount);

    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
        throw buildHttpError(400, "current_amount phai la so khong am");
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
        throw buildHttpError(400, "target_amount phai la so duong");
    }

    const progressPercentage =
        targetAmount > 0
            ? Math.min((currentAmount / targetAmount) * 100, 100)
            : 0;
    const isNowCompleted = currentAmount >= targetAmount;
    const justCompleted = !plan.completed && isNowCompleted;

    if (justCompleted) {
        try {
            await transactionClient.post(
                "/api/transactions",
                buildPlanCompletedTransactionPayload(plan)
            );
        } catch (err) {
            console.error("[TRANSACTION SERVICE ERROR]", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            throw buildHttpError(500, completionErrorMessage, err.message);
        }
    }

    const updated = await SavingPlan.query(trx).patchAndFetchById(plan.id, {
        ...additionalPatch,
        current_amount: currentAmount,
        progress_percentage: Number(progressPercentage.toFixed(2)),
        completed: isNowCompleted,
    });

    return {
        updated,
        notificationPayload: justCompleted
            ? {
                  userId: plan.user_id,
                  title: plan.title,
              }
            : null,
    };
}

function publishSavingPlanCompleted(notificationPayload) {
    if (!notificationPayload) {
        return;
    }

    notifyClient.publish("SAVING_PLAN_COMPLETED", notificationPayload.userId, {
        title: notificationPayload.title,
    });
}

module.exports = {
    applySavingPlanState,
    buildHttpError,
    loadSavingPlanForUpdate,
    publishSavingPlanCompleted,
};
