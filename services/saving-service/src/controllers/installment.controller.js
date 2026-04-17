const InstallmentPlan = require("../models/installment.model");
const InstallmentPayment = require("../models/installment_payment.model");
const transactionClient = require("../clients/transaction.client");
const notifyClient = require("../clients/notification.client");
const {
    validateInstallmentCreateInput,
    validateInstallmentUpdateInput,
} = require("../utils/requestValidators");

function buildHttpError(status, message, details) {
    const err = new Error(message);
    err.status = status;
    err.details = details;
    return err;
}

function sendError(res, err) {
    if (err.status) {
        const body = { message: err.message };
        if (err.details) {
            body.error = err.details;
        }
        return res.status(err.status).json(body);
    }

    return res.status(500).json({ error: err.message });
}

function calculateActualPaymentAmount(plan) {
    const remainingAmount = Math.max(
        Number(plan.total_amount) - Number(plan.paid_amount),
        0
    );

    return Math.min(Number(plan.monthly_payment), remainingAmount);
}

function computeInstallmentDerivedFields({
    totalAmount,
    paidAmount,
    totalTerms,
    currentTerm,
}) {
    const progressPercentage =
        totalAmount > 0
            ? Math.min((paidAmount / totalAmount) * 100, 100)
            : 0;
    const completed = paidAmount >= totalAmount || currentTerm >= totalTerms;

    return {
        progress_percentage: Number(progressPercentage.toFixed(2)),
        completed,
    };
}

function assertInstallmentPlanStateIsValid({
    totalAmount,
    paidAmount,
    totalTerms,
    currentTerm,
}) {
    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
        throw buildHttpError(400, "paid_amount hien tai khong hop le");
    }

    if (!Number.isInteger(currentTerm) || currentTerm < 0) {
        throw buildHttpError(400, "current_term hien tai khong hop le");
    }

    if (paidAmount > totalAmount) {
        throw buildHttpError(
            400,
            "total_amount khong the nho hon paid_amount hien tai"
        );
    }

    if (currentTerm > totalTerms) {
        throw buildHttpError(
            400,
            "total_terms khong the nho hon current_term hien tai"
        );
    }
}

// 🆕 1. Tạo kế hoạch trả góp
exports.create = async (req, res) => {
    try {
        const {
            user_id,
            title,
            total_amount,
            monthly_payment,
            start_date,
            end_date,
            total_terms,
        } = validateInstallmentCreateInput(req.body);

        const plan = await InstallmentPlan.query().insert({
            user_id: Number(user_id),
            title,
            total_amount: parseFloat(total_amount),
            monthly_payment: parseFloat(monthly_payment),
            start_date,
            end_date,
            total_terms: parseInt(total_terms),
            paid_amount: 0,
            current_term: 0,
            completed: false,
        });

        res.status(201).json({ message: "Tạo khoản trả góp thành công", plan });
    } catch (err) {
        return sendError(res, err);
    }
};

// 📄 2. Cập nhật khi thanh toán 1 kỳ
exports.payInstallment = async (req, res) => {
    try {
        const { id } = req.params;
        let updated;
        let responseMessage;
        let notificationPayload = null;

        await InstallmentPlan.transaction(async (trx) => {
            const plan = await InstallmentPlan.query(trx).findById(id).forUpdate();

            if (!plan) {
                throw buildHttpError(404, "Không tìm thấy khoản trả góp");
            }

            if (plan.completed || plan.current_term >= plan.total_terms) {
                throw buildHttpError(
                    400,
                    "Khoản trả góp đã hoàn thành, không thể thanh toán thêm."
                );
            }

            const actualPaymentAmount = calculateActualPaymentAmount(plan);
            let newPaidAmount = Number(plan.paid_amount) + actualPaymentAmount;
            const newTerm = plan.current_term + 1;

            if (newPaidAmount > plan.total_amount) {
                newPaidAmount = Number(plan.total_amount);
            }

            const progressPercentage = Math.min(
                (newPaidAmount / plan.total_amount) * 100,
                100
            );
            const isCompleted =
                newPaidAmount >= plan.total_amount ||
                newTerm >= plan.total_terms;
            const today = new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
            const note = `Thanh toán kỳ ${newTerm} (${new Date().toLocaleDateString(
                "vi-VN"
            )})`;
            const transactionPayload = {
                user_id: plan.user_id,
                category: "Thanh toán khoản trả góp",
                type: "expense",
                amount: actualPaymentAmount,
                date: new Date().toISOString().slice(0, 10),
                note: `Thanh toán kỳ ${newTerm} cho khoản trả góp: ${plan.title}`,
            };

            try {
                console.log(
                    "[TRANSACTION SERVICE] Gửi payload:",
                    transactionPayload
                );
                await transactionClient.post(
                    "/api/transactions",
                    transactionPayload
                );
            } catch (err) {
                console.error("[TRANSACTION SERVICE ERROR]", {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                });
                throw buildHttpError(
                    500,
                    "Thanh toán kỳ nhưng tạo transaction thất bại",
                    err.message
                );
            }

            updated = await InstallmentPlan.query(trx).patchAndFetchById(id, {
                paid_amount: newPaidAmount,
                current_term: newTerm,
                progress_percentage: Number(progressPercentage.toFixed(2)),
                completed: isCompleted,
            });

            await InstallmentPayment.query(trx).insert({
                plan_id: Number(id),
                term_number: newTerm,
                amount: actualPaymentAmount,
                note,
                pay_date: today,
            });

            const remainingTerms = plan.total_terms - newTerm;
            if (isCompleted) {
                notificationPayload = {
                    event: "INSTALLMENT_DUE_SOON",
                    userId: plan.user_id,
                    payload: {
                        title: plan.title,
                        due_date: plan.end_date,
                        message: `Khoản trả góp "${plan.title}" đã hoàn thành!`,
                    },
                };
            } else if (remainingTerms <= 2) {
                notificationPayload = {
                    event: "INSTALLMENT_DUE_SOON",
                    userId: plan.user_id,
                    payload: {
                        title: plan.title,
                        due_date: plan.end_date,
                        message: `Còn ${remainingTerms} kỳ nữa là hoàn thành khoản trả góp "${plan.title}"`,
                    },
                };
            }

            responseMessage = isCompleted
                ? "Khoản trả góp đã hoàn thành"
                : "Đã thanh toán kỳ mới thành công";
        });

        if (notificationPayload) {
            notifyClient.publish(
                notificationPayload.event,
                notificationPayload.userId,
                notificationPayload.payload
            );
        }

        res.json({
            message: responseMessage,
            plan: updated,
        });
    } catch (err) {
        return sendError(res, err);
    }
};

// 📄 3. Lấy tất cả kế hoạch trả góp của 1 user
exports.getAllByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await InstallmentPlan.query()
            .where("user_id", user_id)
            .orderBy("created_at", "desc");
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📊 4. Thống kê tổng quan kế hoạch trả góp của 1 user
exports.getStats = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await InstallmentPlan.query().where("user_id", user_id);
        if (!plans.length)
            return res.json({
                total_plans: 0,
                completed: 0,
                total_debt: 0,
                total_paid: 0,
                avg_progress: 0,
            });

        const total_plans = plans.length;
        const completed = plans.filter((p) => p.completed).length;

        // ✅ Ép kiểu rõ ràng
        const total_debt = plans.reduce(
            (sum, p) => sum + (Number(p.total_amount) - Number(p.paid_amount)),
            0
        );

        const total_paid = plans.reduce(
            (sum, p) => sum + Number(p.paid_amount || 0),
            0
        );

        const avg_progress =
            plans.reduce(
                (sum, p) => sum + Number(p.progress_percentage || 0),
                0
            ) / total_plans;

        res.json({
            total_plans,
            completed,
            total_debt: Number(total_debt.toFixed(2)),
            total_paid: Number(total_paid.toFixed(2)),
            avg_progress: Number(avg_progress.toFixed(2)),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📝 5. Cập nhật thông tin kế hoạch trả góp
exports.updateInfo = async (req, res) => {
    try {
        const { id } = req.params;
        let updated;

        await InstallmentPlan.transaction(async (trx) => {
            const plan = await InstallmentPlan.query(trx).findById(id).forUpdate();
            if (!plan) {
                throw buildHttpError(404, "Không tìm thấy khoản trả góp");
            }

            const fields = validateInstallmentUpdateInput(req.body, plan);
            const nextTotalAmount = Number(
                fields.total_amount !== undefined
                    ? fields.total_amount
                    : plan.total_amount
            );
            const nextTotalTerms = Number(
                fields.total_terms !== undefined
                    ? fields.total_terms
                    : plan.total_terms
            );
            const paidAmount = Number(plan.paid_amount);
            const currentTerm = Number(plan.current_term);

            assertInstallmentPlanStateIsValid({
                totalAmount: nextTotalAmount,
                paidAmount,
                totalTerms: nextTotalTerms,
                currentTerm,
            });

            const derivedFields = computeInstallmentDerivedFields({
                totalAmount: nextTotalAmount,
                paidAmount,
                totalTerms: nextTotalTerms,
                currentTerm,
            });

            updated = await InstallmentPlan.query(trx).patchAndFetchById(id, {
                ...fields,
                ...derivedFields,
            });
        });

        res.json({ message: "Cập nhật thông tin thành công", plan: updated });
    } catch (err) {
        return sendError(res, err);
    }
};

// ❌ 6. Xóa kế hoạch trả góp
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        await InstallmentPlan.transaction(async (trx) => {
            const plan = await InstallmentPlan.query(trx).findById(id).forUpdate();

            if (!plan) {
                throw buildHttpError(
                    404,
                    "Không tìm thấy khoản trả góp để xóa"
                );
            }

            await InstallmentPayment.query(trx).where("plan_id", id).delete();
            await InstallmentPlan.query(trx).deleteById(id);
        });

        res.json({ message: "Đã xóa khoản trả góp và lịch sử liên quan" });
    } catch (err) {
        return sendError(res, err);
    }
};

// 📈 7. Lấy top 3 kế hoạch trả góp theo tiến độ
exports.getTopPlans = async (req, res) => {
    try {
        const { user_id } = req.params;
        const plans = await InstallmentPlan.query()
            .where("user_id", user_id)
            .orderBy("progress_percentage", "desc")
            .limit(3);
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📈 8. Lịch sử thanh toán thật cho 1 kế hoạch
exports.getPaymentHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const payments = await InstallmentPayment.query()
            .where("plan_id", id)
            .orderBy("pay_date", "asc");

        const formatted = payments.map((p) => ({
            date: new Date(p.pay_date).toLocaleDateString("vi-VN"),
            amount: Number(p.amount),
            term: p.term_number,
            note: p.note || "",
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📘 Lấy chi tiết 1 khoản trả góp theo ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await InstallmentPlan.query().findById(id);

        if (!plan) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy khoản trả góp" });
        }

        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📊 9. Biểu đồ thanh toán theo ngày của 1 user
exports.getPaymentChart = async (req, res) => {
    try {
        const { user_id } = req.params;
        const payments = await InstallmentPayment.query()
            .join(
                "installment_plans",
                "installment_plans.id",
                "=",
                "installment_payments.plan_id"
            )
            .where("installment_plans.user_id", user_id)
            .orderBy("pay_date", "asc");

        const grouped = payments.reduce((acc, p) => {
            const date = new Date(p.pay_date).toLocaleDateString("vi-VN");
            acc[date] = (acc[date] || 0) + Number(p.amount);
            return acc;
        }, {});

        const result = Object.entries(grouped).map(([date, amount]) => ({
            date,
            amount,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
