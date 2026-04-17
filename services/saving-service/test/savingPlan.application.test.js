const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const loadWithMocks = require("../testing/loadWithMocks");

describe("savingPlan.application", () => {
    test("publishes completion side effects when progress reaches the target", async () => {
        const trx = { id: "saving-trx" };
        const plan = {
            id: 1,
            user_id: 9,
            title: "Trip",
            target_amount: 1000,
            current_amount: 900,
            start_date: "2026-04-01",
            end_date: "2026-12-31",
            completed: false,
            progress_percentage: 90,
        };

        let patchArgs;
        let transactionPayload;
        let notificationArgs;

        const SavingPlan = {
            transaction: async (handler) => handler(trx),
            query: (receivedTrx) => {
                assert.equal(receivedTrx, trx);
                return {
                    findById(id) {
                        assert.equal(id, 1);
                        return {
                            forUpdate: async () => plan,
                        };
                    },
                    patchAndFetchById: async (id, patch) => {
                        patchArgs = { id, patch };
                        return { ...plan, ...patch };
                    },
                };
            },
        };
        const SavingInstallment = {};
        const transactionClient = {
            post: async (path, payload) => {
                assert.equal(path, "/api/transactions");
                transactionPayload = payload;
                return { data: { ok: true } };
            },
        };
        const notifyClient = {
            publish: (...args) => {
                notificationArgs = args;
            },
        };

        const { updateSavingPlanProgress } = loadWithMocks(
            "../src/application/saving/savingPlan.application",
            {
                "../../models/saving.model": SavingPlan,
                "../../models/savingInstallment.model": SavingInstallment,
                "../../clients/transaction.client": transactionClient,
                "../../clients/notification.client": notifyClient,
            }
        );

        const updated = await updateSavingPlanProgress({
            id: 1,
            current_amount: 1000,
        });

        assert.deepEqual(patchArgs, {
            id: 1,
            patch: {
                current_amount: 1000,
                progress_percentage: 100,
                completed: true,
            },
        });
        assert.equal(transactionPayload.amount, 1000);
        assert.equal(transactionPayload.user_id, 9);
        assert.deepEqual(notificationArgs, [
            "SAVING_PLAN_COMPLETED",
            9,
            { title: "Trip" },
        ]);
        assert.equal(updated.completed, true);
        assert.equal(updated.progress_percentage, 100);
    });

    test("normalizes installment payment_date before persisting", async () => {
        const trx = { id: "saving-installment-trx" };
        const plan = {
            id: 2,
            user_id: 10,
            title: "Emergency Fund",
            target_amount: 1000,
            current_amount: 100,
            start_date: "2026-04-01",
            end_date: "2026-12-31",
            completed: false,
            progress_percentage: 10,
        };

        let insertedPayload;
        let patchPayload;
        let transactionCallCount = 0;
        let notificationCallCount = 0;

        const SavingPlan = {
            transaction: async (handler) => handler(trx),
            query: (receivedTrx) => {
                assert.equal(receivedTrx, trx);
                return {
                    findById(id) {
                        assert.equal(id, 2);
                        return {
                            forUpdate: async () => plan,
                        };
                    },
                    patchAndFetchById: async (id, patch) => {
                        assert.equal(id, 2);
                        patchPayload = patch;
                        return { ...plan, ...patch };
                    },
                };
            },
        };
        const SavingInstallment = {
            query: (receivedTrx) => {
                assert.equal(receivedTrx, trx);
                return {
                    insert: async (payload) => {
                        insertedPayload = payload;
                        return { id: 99, ...payload };
                    },
                };
            },
        };
        const transactionClient = {
            post: async () => {
                transactionCallCount += 1;
                return { data: { ok: true } };
            },
        };
        const notifyClient = {
            publish: () => {
                notificationCallCount += 1;
            },
        };

        const { addSavingInstallment } = loadWithMocks(
            "../src/application/saving/savingPlan.application",
            {
                "../../models/saving.model": SavingPlan,
                "../../models/savingInstallment.model": SavingInstallment,
                "../../clients/transaction.client": transactionClient,
                "../../clients/notification.client": notifyClient,
            }
        );

        const result = await addSavingInstallment({
            saving_plan_id: 2,
            amount: 50,
            note: "top up",
            payment_date: "2026-04-17T00:00:00.000Z",
        });

        assert.equal(insertedPayload.payment_date, "2026-04-17 00:00:00");
        assert.deepEqual(patchPayload, {
            current_amount: 150,
            progress_percentage: 15,
            completed: false,
        });
        assert.equal(transactionCallCount, 0);
        assert.equal(notificationCallCount, 0);
        assert.equal(result.installment.id, 99);
        assert.equal(result.new_progress, 15);
    });
});
