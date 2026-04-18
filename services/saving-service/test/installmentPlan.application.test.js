const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const loadWithMocks = require("../testing/loadWithMocks");

describe("installmentPlan.application", () => {
    test("uses the actual final payment amount everywhere", async () => {
        const trx = { id: "installment-trx" };
        const plan = {
            id: 5,
            user_id: 7,
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
        };

        let patchArgs;
        let paymentInsertPayload;
        let transactionPayload;
        let notificationArgs;

        const InstallmentPlan = {
            transaction: async (handler) => handler(trx),
            query: (receivedTrx) => {
                assert.equal(receivedTrx, trx);
                return {
                    findById(id) {
                        assert.equal(id, 5);
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
        const InstallmentPayment = {
            query: (receivedTrx) => {
                assert.equal(receivedTrx, trx);
                return {
                    insert: async (payload) => {
                        paymentInsertPayload = payload;
                        return payload;
                    },
                };
            },
        };
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
        const originalLog = console.log;
        const originalError = console.error;

        const { payInstallment } = loadWithMocks(
            "../src/application/installment/installmentPlan.application",
            {
                "../../models/installment.model": InstallmentPlan,
                "../../models/installment_payment.model": InstallmentPayment,
                "../../clients/transaction.client": transactionClient,
                "../../clients/notification.client": notifyClient,
            }
        );

        console.log = () => {};
        console.error = () => {};

        let result;
        try {
            result = await payInstallment({ id: 5 });
        } finally {
            console.log = originalLog;
            console.error = originalError;
        }

        assert.deepEqual(patchArgs, {
            id: 5,
            patch: {
                paid_amount: 1000,
                current_term: 2,
                progress_percentage: 100,
                completed: true,
            },
        });
        assert.equal(transactionPayload.amount, 300);
        assert.equal(paymentInsertPayload.amount, 300);
        assert.equal(paymentInsertPayload.term_number, 2);
        assert.equal(notificationArgs[0], "INSTALLMENT_DUE_SOON");
        assert.equal(notificationArgs[1], 7);
        assert.equal(notificationArgs[2].title, "Phone");
        assert.equal(result.plan.paid_amount, 1000);
        assert.equal(result.plan.completed, true);
    });
});
