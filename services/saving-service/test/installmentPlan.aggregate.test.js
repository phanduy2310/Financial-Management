const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const InstallmentPlanAggregate = require("../src/domain/installment/installmentPlan.aggregate");

describe("InstallmentPlanAggregate", () => {
    test("rehydrates ISO dates and recomputes derived fields on update", () => {
        const aggregate = InstallmentPlanAggregate.rehydrate({
            id: 1,
            user_id: 20,
            title: "Laptop",
            total_amount: "1000.00",
            paid_amount: "500.00",
            monthly_payment: "250.00",
            start_date: "2026-04-01T00:00:00.000Z",
            end_date: "2026-12-31T00:00:00.000Z",
            current_term: 2,
            total_terms: 5,
            completed: 0,
            progress_percentage: "50.00",
        });

        aggregate.updateInfo({
            total_amount: 1200,
            total_terms: 6,
        });

        assert.equal(aggregate.start_date, "2026-04-01");
        assert.equal(aggregate.end_date, "2026-12-31");
        assert.equal(aggregate.total_amount, 1200);
        assert.equal(aggregate.total_terms, 6);
        assert.equal(aggregate.progress_percentage, 41.67);
        assert.equal(aggregate.completed, false);
    });

    test("caps the final payment to the remaining amount", () => {
        const aggregate = InstallmentPlanAggregate.rehydrate({
            id: 2,
            user_id: 21,
            title: "Phone",
            total_amount: 1000,
            paid_amount: 700,
            monthly_payment: 400,
            start_date: "2026-04-01",
            end_date: "2026-12-31",
            current_term: 1,
            total_terms: 3,
            completed: false,
            progress_percentage: 70,
        });

        const result = aggregate.payNextTerm();

        assert.equal(result.actualPaymentAmount, 300);
        assert.equal(result.newTerm, 2);
        assert.equal(result.justCompleted, true);
        assert.equal(aggregate.paid_amount, 1000);
        assert.equal(aggregate.progress_percentage, 100);
        assert.equal(aggregate.completed, true);
    });

    test("builds a due-soon notification when two terms remain", () => {
        const aggregate = InstallmentPlanAggregate.rehydrate({
            id: 3,
            user_id: 22,
            title: "Bike",
            total_amount: 900,
            paid_amount: 300,
            monthly_payment: 150,
            start_date: "2026-04-01",
            end_date: "2026-12-31",
            current_term: 4,
            total_terms: 6,
            completed: false,
            progress_percentage: 33.33,
        });

        const notification = aggregate.buildNotificationPayload();

        assert.equal(notification.event, "INSTALLMENT_DUE_SOON");
        assert.equal(notification.userId, 22);
        assert.equal(notification.payload.title, "Bike");
        assert.equal(notification.payload.due_date, "2026-12-31");
    });
});
