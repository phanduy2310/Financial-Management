const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const SavingPlanAggregate = require("../src/domain/saving/savingPlan.aggregate");

describe("SavingPlanAggregate", () => {
    test("creates a new plan with zero progress", () => {
        const aggregate = SavingPlanAggregate.create({
            user_id: 10,
            title: "Emergency Fund",
            target_amount: 5000,
            start_date: "2026-04-01",
            end_date: "2026-12-31",
        });

        assert.equal(aggregate.current_amount, 0);
        assert.equal(aggregate.progress_percentage, 0);
        assert.equal(aggregate.completed, false);
        assert.equal(aggregate.start_date, "2026-04-01");
        assert.equal(aggregate.end_date, "2026-12-31");
    });

    test("rehydrates ISO dates and recomputes derived fields on update", () => {
        const aggregate = SavingPlanAggregate.rehydrate({
            id: 1,
            user_id: 10,
            title: "Emergency Fund",
            target_amount: "1000.00",
            current_amount: "500.00",
            start_date: "2026-04-01T00:00:00.000Z",
            end_date: "2026-12-31T00:00:00.000Z",
            completed: 0,
            progress_percentage: "50.00",
        });

        const result = aggregate.updateInfo({
            title: "Emergency Fund Updated",
            target_amount: 1200,
        });

        assert.equal(result.justCompleted, false);
        assert.equal(aggregate.title, "Emergency Fund Updated");
        assert.equal(aggregate.start_date, "2026-04-01");
        assert.equal(aggregate.end_date, "2026-12-31");
        assert.equal(aggregate.target_amount, 1200);
        assert.equal(aggregate.current_amount, 500);
        assert.equal(aggregate.progress_percentage, 41.67);
        assert.equal(aggregate.completed, false);
    });

    test("marks completion when an installment reaches the target", () => {
        const aggregate = SavingPlanAggregate.rehydrate({
            id: 2,
            user_id: 12,
            title: "Trip",
            target_amount: 1000,
            current_amount: 950,
            start_date: "2026-04-01",
            end_date: "2026-12-31",
            completed: false,
            progress_percentage: 95,
        });

        const result = aggregate.addInstallment(100);

        assert.equal(result.justCompleted, true);
        assert.equal(aggregate.current_amount, 1050);
        assert.equal(aggregate.progress_percentage, 100);
        assert.equal(aggregate.completed, true);
    });

    test("floors current amount at zero when removing installments", () => {
        const aggregate = SavingPlanAggregate.rehydrate({
            id: 3,
            user_id: 15,
            title: "Buffer",
            target_amount: 1000,
            current_amount: 50,
            start_date: "2026-04-01",
            end_date: "2026-12-31",
            completed: false,
            progress_percentage: 5,
        });

        aggregate.removeInstallment(200);

        assert.equal(aggregate.current_amount, 0);
        assert.equal(aggregate.progress_percentage, 0);
        assert.equal(aggregate.completed, false);
    });
});
