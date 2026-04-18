const { createDomainError } = require("./domainError");

class Money {
    constructor(cents) {
        if (!Number.isInteger(cents)) {
            throw createDomainError(500, "Money phai duoc khoi tao bang cents hop le");
        }

        this.cents = cents;
    }

    static from(value, label = "amount") {
        const numeric =
            typeof value === "number"
                ? value
                : typeof value === "string" && value.trim() !== ""
                  ? Number(value)
                  : NaN;

        if (!Number.isFinite(numeric)) {
            throw createDomainError(400, `${label} phai la so hop le`);
        }

        return new Money(Math.round(numeric * 100));
    }

    static zero() {
        return new Money(0);
    }

    add(other) {
        return new Money(this.cents + other.cents);
    }

    subtract(other) {
        return new Money(this.cents - other.cents);
    }

    min(other) {
        return this.cents <= other.cents ? this : other;
    }

    isNegative() {
        return this.cents < 0;
    }

    isZero() {
        return this.cents === 0;
    }

    greaterThan(other) {
        return this.cents > other.cents;
    }

    greaterThanOrEqual(other) {
        return this.cents >= other.cents;
    }

    toNumber() {
        return this.cents / 100;
    }
}

module.exports = Money;
