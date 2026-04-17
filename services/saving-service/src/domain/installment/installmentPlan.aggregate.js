const { createDomainError } = require("../common/domainError");
const { toDateOnlyString } = require("../common/dateValue");
const {
    assertInstallmentPlanInfo,
    computeActualPaymentAmount,
    computeInstallmentState,
} = require("./installmentPlan.policy");

class InstallmentPlanAggregate {
    constructor(plan) {
        this.id = plan.id;
        this.user_id = Number(plan.user_id);
        this.title = plan.title;
        this.total_amount = Number(plan.total_amount);
        this.paid_amount = Number(plan.paid_amount || 0);
        this.monthly_payment = Number(plan.monthly_payment);
        this.start_date = toDateOnlyString(plan.start_date) || plan.start_date;
        this.end_date = toDateOnlyString(plan.end_date) || plan.end_date;
        this.current_term = Number(plan.current_term || 0);
        this.total_terms = Number(plan.total_terms);
        this.completed = Boolean(plan.completed);
        this.progress_percentage = Number(plan.progress_percentage || 0);
    }

    static create(input) {
        const aggregate = new InstallmentPlanAggregate({
            ...input,
            id: undefined,
            paid_amount: 0,
            current_term: 0,
            completed: false,
            progress_percentage: 0,
        });

        assertInstallmentPlanInfo(aggregate.toPersistence());
        aggregate.recomputeDerivedState();
        return aggregate;
    }

    static rehydrate(plan) {
        return new InstallmentPlanAggregate(plan);
    }

    updateInfo(fields) {
        if (fields.title !== undefined) {
            this.title = fields.title;
        }

        if (fields.total_amount !== undefined) {
            this.total_amount = Number(fields.total_amount);
        }

        if (fields.monthly_payment !== undefined) {
            this.monthly_payment = Number(fields.monthly_payment);
        }

        if (fields.start_date !== undefined) {
            this.start_date = fields.start_date;
        }

        if (fields.end_date !== undefined) {
            this.end_date = fields.end_date;
        }

        if (fields.total_terms !== undefined) {
            this.total_terms = Number(fields.total_terms);
        }

        assertInstallmentPlanInfo(this.toPersistence());
        this.recomputeDerivedState();
    }

    payNextTerm() {
        if (this.completed || this.current_term >= this.total_terms) {
            throw createDomainError(
                400,
                "Khoản trả góp đã hoàn thành, không thể thanh toán thêm."
            );
        }

        const actualPaymentAmount = computeActualPaymentAmount(this.toPersistence());
        const wasCompleted = this.completed;

        this.paid_amount = Number(this.paid_amount) + actualPaymentAmount;
        this.current_term += 1;
        this.recomputeDerivedState();

        return {
            actualPaymentAmount,
            newTerm: this.current_term,
            justCompleted: !wasCompleted && this.completed,
        };
    }

    recomputeDerivedState() {
        const derived = computeInstallmentState(this.toPersistence());

        this.total_amount = derived.total_amount;
        this.paid_amount = derived.paid_amount;
        this.total_terms = derived.total_terms;
        this.current_term = derived.current_term;
        this.progress_percentage = derived.progress_percentage;
        this.completed = derived.completed;
    }

    toPersistence() {
        return {
            user_id: this.user_id,
            title: this.title,
            total_amount: this.total_amount,
            paid_amount: this.paid_amount,
            monthly_payment: this.monthly_payment,
            start_date: this.start_date,
            end_date: this.end_date,
            current_term: this.current_term,
            total_terms: this.total_terms,
            completed: this.completed,
            progress_percentage: this.progress_percentage,
        };
    }

    buildPaymentTransactionPayload(termNumber, actualPaymentAmount) {
        return {
            user_id: this.user_id,
            category: "Thanh toán khoản trả góp",
            type: "expense",
            amount: actualPaymentAmount,
            date: new Date().toISOString().slice(0, 10),
            note: `Thanh toán kỳ ${termNumber} cho khoản trả góp: ${this.title}`,
        };
    }

    buildNotificationPayload() {
        const remainingTerms = this.total_terms - this.current_term;

        if (this.completed) {
            return {
                event: "INSTALLMENT_DUE_SOON",
                userId: this.user_id,
                payload: {
                    title: this.title,
                    due_date: this.end_date,
                    message: `Khoản trả góp "${this.title}" đã hoàn thành!`,
                },
            };
        }

        if (remainingTerms <= 2) {
            return {
                event: "INSTALLMENT_DUE_SOON",
                userId: this.user_id,
                payload: {
                    title: this.title,
                    due_date: this.end_date,
                    message: `Còn ${remainingTerms} kỳ nữa là hoàn thành khoản trả góp "${this.title}"`,
                },
            };
        }

        return null;
    }
}

module.exports = InstallmentPlanAggregate;
