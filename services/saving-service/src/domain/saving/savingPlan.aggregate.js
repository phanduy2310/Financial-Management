const Money = require("../common/money");
const { createDomainError } = require("../common/domainError");
const { toDateOnlyString } = require("../common/dateValue");
const {
    assertSavingPlanInfo,
    computeSavingPlanState,
} = require("./savingPlan.policy");

class SavingPlanAggregate {
    constructor(plan) {
        this.id = plan.id;
        this.user_id = Number(plan.user_id);
        this.title = plan.title;
        this.target_amount = Number(plan.target_amount);
        this.current_amount = Number(plan.current_amount || 0);
        this.start_date = toDateOnlyString(plan.start_date) || plan.start_date;
        this.end_date = toDateOnlyString(plan.end_date) || plan.end_date;
        this.completed = Boolean(plan.completed);
        this.progress_percentage = Number(plan.progress_percentage || 0);
    }

    static create(input) {
        const aggregate = new SavingPlanAggregate({
            ...input,
            id: undefined,
            current_amount: 0,
            completed: false,
            progress_percentage: 0,
        });

        assertSavingPlanInfo(aggregate.toPersistence());
        aggregate.recomputeState(0);
        return aggregate;
    }

    static rehydrate(plan) {
        return new SavingPlanAggregate(plan);
    }

    updateProgress(nextCurrentAmount) {
        return this.recomputeState(nextCurrentAmount);
    }

    markCompleted() {
        if (this.completed) {
            throw createDomainError(400, "Kế hoạch đã hoàn thành trước đó");
        }

        return this.recomputeState(this.target_amount);
    }

    updateInfo(fields) {
        if (fields.title !== undefined) {
            this.title = fields.title;
        }

        if (fields.target_amount !== undefined) {
            this.target_amount = Number(fields.target_amount);
        }

        if (fields.start_date !== undefined) {
            this.start_date = fields.start_date;
        }

        if (fields.end_date !== undefined) {
            this.end_date = fields.end_date;
        }

        assertSavingPlanInfo(this.toPersistence());
        return this.recomputeState(this.current_amount);
    }

    addInstallment(amount) {
        const nextAmount = Money.from(this.current_amount, "current_amount")
            .add(Money.from(amount, "amount"))
            .toNumber();

        return this.recomputeState(nextAmount);
    }

    removeInstallment(amount) {
        const nextAmount = Money.from(this.current_amount, "current_amount")
            .subtract(Money.from(amount, "amount"));

        return this.recomputeState(
            nextAmount.isNegative() ? 0 : nextAmount.toNumber()
        );
    }

    recomputeState(nextCurrentAmount) {
        const wasCompleted = this.completed;
        const derived = computeSavingPlanState({
            target_amount: this.target_amount,
            current_amount: nextCurrentAmount,
        });

        this.target_amount = derived.target_amount;
        this.current_amount = derived.current_amount;
        this.progress_percentage = derived.progress_percentage;
        this.completed = derived.completed;

        return {
            justCompleted: !wasCompleted && this.completed,
        };
    }

    toPersistence() {
        return {
            user_id: this.user_id,
            title: this.title,
            target_amount: this.target_amount,
            current_amount: this.current_amount,
            start_date: this.start_date,
            end_date: this.end_date,
            completed: this.completed,
            progress_percentage: this.progress_percentage,
        };
    }

    buildCompletionTransactionPayload() {
        return {
            user_id: this.user_id,
            category: "Thực hiện kế hoạch tiết kiệm",
            type: "expense",
            amount: Number(this.target_amount),
            date: new Date().toISOString().slice(0, 10),
            note: `Hoàn thành kế hoạch tiết kiệm: ${this.title}`,
        };
    }

    buildCompletionNotificationPayload() {
        return {
            event: "SAVING_PLAN_COMPLETED",
            userId: this.user_id,
            payload: {
                title: this.title,
            },
        };
    }
}

module.exports = SavingPlanAggregate;
