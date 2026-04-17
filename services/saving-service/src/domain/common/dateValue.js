function pad(value) {
    return String(value).padStart(2, "0");
}

function parseDateValue(value) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    if (typeof value !== "string" || value.trim() === "") {
        return null;
    }

    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const date = new Date(`${trimmed}T00:00:00.000Z`);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
}

function toDateOnlyTimestamp(value) {
    const date = parseDateValue(value);
    if (!date) {
        return NaN;
    }

    return Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    );
}

function toDateOnlyString(value) {
    const date = parseDateValue(value);
    if (!date) {
        return null;
    }

    return [
        date.getUTCFullYear(),
        pad(date.getUTCMonth() + 1),
        pad(date.getUTCDate()),
    ].join("-");
}

function toSqlDateTime(value = new Date()) {
    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value.trim())
    ) {
        return value.trim();
    }

    const date = parseDateValue(value);
    if (!date) {
        return null;
    }

    return `${toDateOnlyString(date)} ${pad(date.getUTCHours())}:${pad(
        date.getUTCMinutes()
    )}:${pad(date.getUTCSeconds())}`;
}

module.exports = {
    toDateOnlyString,
    toDateOnlyTimestamp,
    toSqlDateTime,
};
