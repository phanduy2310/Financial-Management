const SavingPlan = require("../../models/saving.model");
const SavingInstallment = require("../../models/savingInstallment.model");
const transactionClient = require("../../clients/transaction.client");
const notifyClient = require("../../clients/notification.client");
const SavingPlanAggregate = require("../../domain/saving/savingPlan.aggregate");
const { createDomainError } = require("../../domain/common/domainError");
const { toSqlDateTime } = require("../../domain/common/dateValue");

function publishNotification(notificationPayload) {
    if (!notificationPayload) {
        return;
    }

    notifyClient.publish(
        notificationPayload.event,
        notificationPayload.userId,
        notificationPayload.payload
    );
}

async function createSavingPlan(input) {
    const aggregate = SavingPlanAggregate.create(input);
    return SavingPlan.query().insert(aggregate.toPersistence());
}

async function handleCompletionIfNeeded(aggregate, justCompleted, errorMessage, authToken) {
    if (!justCompleted) {
        return null;
    }

    try {
        await transactionClient.withAuth(authToken).post(
            "/api/transactions",
            aggregate.buildCompletionTransactionPayload()
        );
    } catch (err) {
        console.error("[TRANSACTION SERVICE ERROR]", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
        });
        throw createDomainError(500, errorMessage, err.message);
    }

    return aggregate.buildCompletionNotificationPayload();
}

async function updateSavingPlanProgress({ id, current_amount, authToken }) {
    let updated;
    let notificationPayload = null;

    await SavingPlan.transaction(async (trx) => {
        const plan = await SavingPlan.query(trx).findById(id).forUpdate();
        if (!plan) {
            throw createDomainError(404, "Không tìm thấy kế hoạch");
        }

        const aggregate = SavingPlanAggregate.rehydrate(plan);
        const { justCompleted } = aggregate.updateProgress(current_amount);
        notificationPayload = await handleCompletionIfNeeded(
            aggregate,
            justCompleted,
            "Cập nhật tiến độ nhưng tạo transaction thất bại",
            authToken
        );
        updated = await SavingPlan.query(trx).patchAndFetchById(id, {
            current_amount: aggregate.current_amount,
            progress_percentage: aggregate.progress_percentage,
            completed: aggregate.completed,
        });
    });

    publishNotification(notificationPayload);
    return updated;
}

async function markSavingPlanCompleted({ id, authToken }) {
    let updated;
    let notificationPayload = null;

    await SavingPlan.transaction(async (trx) => {
        const plan = await SavingPlan.query(trx).findById(id).forUpdate();
        if (!plan) {
            throw createDomainError(404, "Không tìm thấy kế hoạch");
        }

        const aggregate = SavingPlanAggregate.rehydrate(plan);
        const { justCompleted } = aggregate.markCompleted();
        notificationPayload = await handleCompletionIfNeeded(
            aggregate,
            justCompleted,
            "Hoàn thành kế hoạch nhưng tạo transaction thất bại",
            authToken
        );
        updated = await SavingPlan.query(trx).patchAndFetchById(id, {
            current_amount: aggregate.current_amount,
            progress_percentage: aggregate.progress_percentage,
            completed: aggregate.completed,
        });
    });

    publishNotification(notificationPayload);
    return updated;
}

async function updateSavingPlanInfo({ id, fields, authToken }) {
    let updated;
    let notificationPayload = null;

    await SavingPlan.transaction(async (trx) => {
        const plan = await SavingPlan.query(trx).findById(id).forUpdate();
        if (!plan) {
            throw createDomainError(404, "Không tìm thấy kế hoạch");
        }

        const aggregate = SavingPlanAggregate.rehydrate(plan);
        const { justCompleted } = aggregate.updateInfo(fields);
        notificationPayload = await handleCompletionIfNeeded(
            aggregate,
            justCompleted,
            "Cap nhat thong tin ke hoach nhung tao transaction that bai",
            authToken
        );
        updated = await SavingPlan.query(trx).patchAndFetchById(id, {
            title: aggregate.title,
            target_amount: aggregate.target_amount,
            start_date: aggregate.start_date,
            end_date: aggregate.end_date,
            current_amount: aggregate.current_amount,
            progress_percentage: aggregate.progress_percentage,
            completed: aggregate.completed,
        });
    });

    publishNotification(notificationPayload);
    return updated;
}

async function deleteSavingPlan({ id }) {
    const deleted = await SavingPlan.query().deleteById(id);
    if (!deleted) {
        throw createDomainError(404, "Không tìm thấy kế hoạch để xóa");
    }
}

async function addSavingInstallment({
    saving_plan_id,
    amount,
    note,
    payment_date,
    authToken,
}) {
    let installment;
    let updatedPlan;
    let notificationPayload = null;

    const normalizedPaymentDate = toSqlDateTime(payment_date);
    if (!normalizedPaymentDate) {
        throw createDomainError(400, "payment_date phai la ngay hop le");
    }

    await SavingPlan.transaction(async (trx) => {
        const plan = await SavingPlan.query(trx)
            .findById(saving_plan_id)
            .forUpdate();
        if (!plan) {
            throw createDomainError(404, "Không tìm thấy kế hoạch");
        }

        installment = await SavingInstallment.query(trx).insert({
            saving_plan_id,
            amount,
            note,
            payment_date: normalizedPaymentDate,
        });

        const aggregate = SavingPlanAggregate.rehydrate(plan);
        const { justCompleted } = aggregate.addInstallment(amount);
        notificationPayload = await handleCompletionIfNeeded(
            aggregate,
            justCompleted,
            "Thêm khoản tiết kiệm nhưng tạo transaction thất bại",
            authToken
        );
        updatedPlan = await SavingPlan.query(trx).patchAndFetchById(saving_plan_id, {
            current_amount: aggregate.current_amount,
            progress_percentage: aggregate.progress_percentage,
            completed: aggregate.completed,
        });
    });

    publishNotification(notificationPayload);

    return {
        installment,
        new_progress: Number(updatedPlan.progress_percentage),
    };
}

async function deleteSavingInstallment({ id }) {
    let newProgress = 0;

    await SavingPlan.transaction(async (trx) => {
        const installment = await SavingInstallment.query(trx)
            .findById(id)
            .forUpdate();

        if (!installment) {
            throw createDomainError(404, "Không tìm thấy khoản trả góp");
        }

        const plan = await SavingPlan.query(trx)
            .findById(installment.saving_plan_id)
            .forUpdate();

        if (!plan) {
            await SavingInstallment.query(trx).deleteById(id);
            return;
        }

        const aggregate = SavingPlanAggregate.rehydrate(plan);
        aggregate.removeInstallment(installment.amount);
        newProgress = aggregate.progress_percentage;

        await SavingPlan.query(trx).patchAndFetchById(plan.id, {
            current_amount: aggregate.current_amount,
            progress_percentage: aggregate.progress_percentage,
            completed: aggregate.completed,
        });
        await SavingInstallment.query(trx).deleteById(id);
    });

    return {
        new_progress: Number(newProgress),
    };
}

module.exports = {
    addSavingInstallment,
    createSavingPlan,
    deleteSavingInstallment,
    deleteSavingPlan,
    markSavingPlanCompleted,
    updateSavingPlanInfo,
    updateSavingPlanProgress,
};
