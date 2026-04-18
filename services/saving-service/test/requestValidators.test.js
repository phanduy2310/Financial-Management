const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const {
    validateInstallmentUpdateInput,
    validateSavingInstallmentCreateInput,
    validateSavingUpdateInput,
} = require("../src/utils/requestValidators");

describe("requestValidators", () => {
    test("accepts saving updates when current plan dates come from MySQL/ISO", () => {
        const result = validateSavingUpdateInput(
            { target_amount: 1200 },
            {
                start_date: "2026-04-01T00:00:00.000Z",
                end_date: "2026-12-31T00:00:00.000Z",
            }
        );

        assert.deepEqual(result, { target_amount: 1200 });
    });

    test("accepts ISO datetime for saving installments", () => {
        const result = validateSavingInstallmentCreateInput({
            params: { saving_plan_id: "15" },
            body: {
                amount: "250",
                note: "top up",
                payment_date: "2026-04-17T00:00:00.000Z",
            },
        });

        assert.equal(result.saving_plan_id, 15);
        assert.equal(result.amount, 250);
        assert.equal(result.note, "top up");
        assert.equal(result.payment_date, "2026-04-17T00:00:00.000Z");
    });

    test("rejects forbidden installment update fields", () => {
        assert.throws(
            () =>
                validateInstallmentUpdateInput(
                    { completed: true },
                    {
                        start_date: "2026-04-01T00:00:00.000Z",
                        end_date: "2026-12-31T00:00:00.000Z",
                    }
                ),
            (error) => {
                assert.equal(error.status, 400);
                assert.match(
                    error.details.join(" "),
                    /Khong duoc gui truong 'completed'/
                );
                return true;
            }
        );
    });
});
