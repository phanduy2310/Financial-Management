const assert = require("node:assert/strict");
const { describe, test } = require("node:test");

const {
    toDateOnlyString,
    toDateOnlyTimestamp,
    toSqlDateTime,
} = require("../src/domain/common/dateValue");

describe("dateValue", () => {
    test("normalizes ISO-like inputs to date-only strings", () => {
        assert.equal(
            toDateOnlyString("2026-04-17T08:09:10.000Z"),
            "2026-04-17"
        );
        assert.equal(
            toDateOnlyString(new Date("2026-04-17T23:59:59.000Z")),
            "2026-04-17"
        );
    });

    test("builds stable day-level timestamps", () => {
        assert.equal(
            toDateOnlyTimestamp("2026-04-17"),
            Date.UTC(2026, 3, 17)
        );
        assert.equal(
            toDateOnlyTimestamp("2026-04-17T15:45:00.000Z"),
            Date.UTC(2026, 3, 17)
        );
    });

    test("normalizes SQL datetime strings", () => {
        assert.equal(
            toSqlDateTime("2026-04-17T05:06:07.000Z"),
            "2026-04-17 05:06:07"
        );
        assert.equal(
            toSqlDateTime("2026-04-17 05:06:07"),
            "2026-04-17 05:06:07"
        );
    });

    test("returns null-like values for invalid dates", () => {
        assert.equal(toDateOnlyString("not-a-date"), null);
        assert.equal(Number.isNaN(toDateOnlyTimestamp("not-a-date")), true);
        assert.equal(toSqlDateTime("not-a-date"), null);
    });
});
