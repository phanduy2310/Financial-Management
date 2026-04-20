const InstallmentPlan = require("../../models/installment.model");
const InstallmentPayment = require("../../models/installment_payment.model");
const transactionClient = require("../../clients/transaction.client");
const notifyClient = require("../../clients/notification.client");
const InstallmentPlanAggregate = require("../../domain/installment/installmentPlan.aggregate");
const { createDomainError } = require("../../domain/common/domainError");

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

async function createInstallmentPlan(input) {
    const aggregate = InstallmentPlanAggregate.create(input);
    return InstallmentPlan.query().insert(aggregate.toPersistence());
}

async function payInstallment({ id, authToken }) {
    let updated;
    let responseMessage;
    let notificationPayload = null;

    await InstallmentPlan.transaction(async (trx) => {
        const plan = await InstallmentPlan.query(trx).findById(id).forUpdate();
        if (!plan) {
            throw createDomainError(404, "Không tìm thấy khoản trả góp");
        }

        const aggregate = InstallmentPlanAggregate.rehydrate(plan);
        const { actualPaymentAmount, newTerm } = aggregate.payNextTerm();
        const note = `Thanh toán kỳ ${newTerm} (${new Date().toLocaleDateString(
            "vi-VN"
        )})`;

        try {
            const transactionPayload = aggregate.buildPaymentTransactionPayload(
                newTerm,
                actualPaymentAmount
            );
            console.log("[TRANSACTION SERVICE] Gửi payload:", transactionPayload);
            await transactionClient.withAuth(authToken).post(
                "/api/transactions",
                transactionPayload
            );
        } catch (err) {
            console.error("[TRANSACTION SERVICE ERROR]", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            throw createDomainError(
                500,
                "Thanh toán kỳ nhưng tạo transaction thất bại",
                err.message
            );
        }

        updated = await InstallmentPlan.query(trx).patchAndFetchById(id, {
            paid_amount: aggregate.paid_amount,
            current_term: aggregate.current_term,
            progress_percentage: aggregate.progress_percentage,
            completed: aggregate.completed,
        });

        await InstallmentPayment.query(trx).insert({
            plan_id: Number(id),
            term_number: newTerm,
            amount: actualPaymentAmount,
            note,
            pay_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        });

        notificationPayload = aggregate.buildNotificationPayload();
        responseMessage = aggregate.completed
            ? "Khoản trả góp đã hoàn thành"
            : "Đã thanh toán kỳ mới thành công";
    });

    publishNotification(notificationPayload);

    return {
        plan: updated,
        message: responseMessage,
    };
}

async function updateInstallmentPlan({ id, fields }) {
    let updated;

    await InstallmentPlan.transaction(async (trx) => {
        const plan = await InstallmentPlan.query(trx).findById(id).forUpdate();
        if (!plan) {
            throw createDomainError(404, "Không tìm thấy khoản trả góp");
        }

        const aggregate = InstallmentPlanAggregate.rehydrate(plan);
        aggregate.updateInfo(fields);
        updated = await InstallmentPlan.query(trx).patchAndFetchById(id, {
            title: aggregate.title,
            total_amount: aggregate.total_amount,
            monthly_payment: aggregate.monthly_payment,
            start_date: aggregate.start_date,
            end_date: aggregate.end_date,
            total_terms: aggregate.total_terms,
            progress_percentage: aggregate.progress_percentage,
            completed: aggregate.completed,
        });
    });

    return updated;
}

async function deleteInstallmentPlan({ id }) {
    await InstallmentPlan.transaction(async (trx) => {
        const plan = await InstallmentPlan.query(trx).findById(id).forUpdate();
        if (!plan) {
            throw createDomainError(404, "Không tìm thấy khoản trả góp để xóa");
        }

        await InstallmentPayment.query(trx).where("plan_id", id).delete();
        await InstallmentPlan.query(trx).deleteById(id);
    });
}

module.exports = {
    createInstallmentPlan,
    deleteInstallmentPlan,
    payInstallment,
    updateInstallmentPlan,
};
