function buildValidationError(details) {
    const err = new Error("Du lieu khong hop le");
    err.status = 400;
    err.details = details;
    return err;
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function toNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : NaN;
    }

    if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
    }

    return NaN;
}

function parseDateOnly(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString().slice(0, 10) === value ? date : null;
}

function parseDateTimeLike(value) {
    if (typeof value !== "string" || value.trim() === "") {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function pushForbiddenFieldErrors(payload, forbiddenFields, errors) {
    forbiddenFields.forEach((field) => {
        if (hasOwn(payload, field)) {
            errors.push(`Khong duoc gui truong '${field}'`);
        }
    });
}

function validateRequiredString(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        errors.push(`${label} la bat buoc`);
        return;
    }

    if (typeof payload[field] !== "string" || payload[field].trim() === "") {
        errors.push(`${label} phai la chuoi khong rong`);
        return;
    }

    output[field] = payload[field].trim();
}

function validateOptionalString(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        return;
    }

    if (typeof payload[field] !== "string" || payload[field].trim() === "") {
        errors.push(`${label} phai la chuoi khong rong`);
        return;
    }

    output[field] = payload[field].trim();
}

function validateRequiredPositiveInteger(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        errors.push(`${label} la bat buoc`);
        return;
    }

    const value = toNumber(payload[field]);
    if (!Number.isInteger(value) || value <= 0) {
        errors.push(`${label} phai la so nguyen duong`);
        return;
    }

    output[field] = value;
}

function validateRequiredPositiveNumber(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        errors.push(`${label} la bat buoc`);
        return;
    }

    const value = toNumber(payload[field]);
    if (!Number.isFinite(value) || value <= 0) {
        errors.push(`${label} phai la so duong`);
        return;
    }

    output[field] = value;
}

function validateRequiredNonNegativeNumber(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        errors.push(`${label} la bat buoc`);
        return;
    }

    const value = toNumber(payload[field]);
    if (!Number.isFinite(value) || value < 0) {
        errors.push(`${label} phai la so khong am`);
        return;
    }

    output[field] = value;
}

function validateOptionalPositiveNumber(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        return;
    }

    const value = toNumber(payload[field]);
    if (!Number.isFinite(value) || value <= 0) {
        errors.push(`${label} phai la so duong`);
        return;
    }

    output[field] = value;
}

function validateOptionalPositiveInteger(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        return;
    }

    const value = toNumber(payload[field]);
    if (!Number.isInteger(value) || value <= 0) {
        errors.push(`${label} phai la so nguyen duong`);
        return;
    }

    output[field] = value;
}

function validateRequiredDateOnly(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        errors.push(`${label} la bat buoc`);
        return;
    }

    const parsed = parseDateOnly(payload[field]);
    if (!parsed) {
        errors.push(`${label} phai theo dinh dang YYYY-MM-DD`);
        return;
    }

    output[field] = payload[field];
}

function validateOptionalDateOnly(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        return;
    }

    const parsed = parseDateOnly(payload[field]);
    if (!parsed) {
        errors.push(`${label} phai theo dinh dang YYYY-MM-DD`);
        return;
    }

    output[field] = payload[field];
}

function validateOptionalDateTime(payload, field, label, errors, output) {
    if (!hasOwn(payload, field)) {
        return;
    }

    if (payload[field] === "") {
        return;
    }

    const parsed = parseDateTimeLike(payload[field]);
    if (!parsed) {
        errors.push(`${label} phai la ngay hop le`);
        return;
    }

    output[field] = payload[field];
}

function validateOptionalFreeText(payload, field, output) {
    if (!hasOwn(payload, field)) {
        return;
    }

    if (typeof payload[field] !== "string") {
        return;
    }

    output[field] = payload[field];
}

function validateDateRange(startDate, endDate, errors) {
    if (!startDate || !endDate) {
        return;
    }

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (!start || !end) {
        return;
    }

    if (start.getTime() > end.getTime()) {
        errors.push("start_date phai nho hon hoac bang end_date");
    }
}

function assertValidPayload(errors, output) {
    if (errors.length > 0) {
        throw buildValidationError(errors);
    }

    return output;
}

function validateSavingCreateInput(payload) {
    const errors = [];
    const output = {};
    const body = isPlainObject(payload) ? payload : {};

    pushForbiddenFieldErrors(
        body,
        ["current_amount", "completed", "progress_percentage"],
        errors
    );
    validateRequiredPositiveInteger(body, "user_id", "user_id", errors, output);
    validateRequiredString(body, "title", "title", errors, output);
    validateRequiredPositiveNumber(
        body,
        "target_amount",
        "target_amount",
        errors,
        output
    );
    validateRequiredDateOnly(body, "start_date", "start_date", errors, output);
    validateRequiredDateOnly(body, "end_date", "end_date", errors, output);
    validateDateRange(output.start_date, output.end_date, errors);

    return assertValidPayload(errors, output);
}

function validateSavingProgressInput(payload) {
    const errors = [];
    const output = {};
    const body = isPlainObject(payload) ? payload : {};

    pushForbiddenFieldErrors(body, ["completed", "progress_percentage"], errors);
    validateRequiredNonNegativeNumber(
        body,
        "current_amount",
        "current_amount",
        errors,
        output
    );

    return assertValidPayload(errors, output);
}

function validateSavingUpdateInput(payload, currentPlan) {
    const errors = [];
    const output = {};
    const body = isPlainObject(payload) ? payload : {};

    pushForbiddenFieldErrors(
        body,
        ["current_amount", "completed", "progress_percentage"],
        errors
    );
    validateOptionalString(body, "title", "title", errors, output);
    validateOptionalPositiveNumber(
        body,
        "target_amount",
        "target_amount",
        errors,
        output
    );
    validateOptionalDateOnly(body, "start_date", "start_date", errors, output);
    validateOptionalDateOnly(body, "end_date", "end_date", errors, output);

    if (Object.keys(output).length === 0 && errors.length === 0) {
        errors.push("Khong co thong tin hop le de cap nhat");
    }

    validateDateRange(
        output.start_date || currentPlan.start_date,
        output.end_date || currentPlan.end_date,
        errors
    );

    return assertValidPayload(errors, output);
}

function validateSavingInstallmentCreateInput({ params, body }) {
    const errors = [];
    const output = {};
    const payload = isPlainObject(body) ? body : {};
    const routeParams = isPlainObject(params) ? params : {};
    const rawPlanId =
        routeParams.saving_plan_id !== undefined
            ? routeParams.saving_plan_id
            : payload.saving_plan_id;

    const planId = toNumber(rawPlanId);
    if (!Number.isInteger(planId) || planId <= 0) {
        errors.push("saving_plan_id phai la so nguyen duong");
    } else {
        output.saving_plan_id = planId;
    }

    validateRequiredPositiveNumber(payload, "amount", "amount", errors, output);
    validateOptionalFreeText(payload, "note", output);
    validateOptionalDateTime(payload, "payment_date", "payment_date", errors, output);

    return assertValidPayload(errors, output);
}

function validateInstallmentCreateInput(payload) {
    const errors = [];
    const output = {};
    const body = isPlainObject(payload) ? payload : {};

    pushForbiddenFieldErrors(
        body,
        ["paid_amount", "current_term", "completed", "progress_percentage"],
        errors
    );
    validateRequiredPositiveInteger(body, "user_id", "user_id", errors, output);
    validateRequiredString(body, "title", "title", errors, output);
    validateRequiredPositiveNumber(
        body,
        "total_amount",
        "total_amount",
        errors,
        output
    );
    validateRequiredPositiveNumber(
        body,
        "monthly_payment",
        "monthly_payment",
        errors,
        output
    );
    validateRequiredDateOnly(body, "start_date", "start_date", errors, output);
    validateRequiredDateOnly(body, "end_date", "end_date", errors, output);
    validateRequiredPositiveInteger(
        body,
        "total_terms",
        "total_terms",
        errors,
        output
    );
    validateDateRange(output.start_date, output.end_date, errors);

    return assertValidPayload(errors, output);
}

function validateInstallmentUpdateInput(payload, currentPlan) {
    const errors = [];
    const output = {};
    const body = isPlainObject(payload) ? payload : {};

    pushForbiddenFieldErrors(
        body,
        ["paid_amount", "current_term", "completed", "progress_percentage"],
        errors
    );
    validateOptionalString(body, "title", "title", errors, output);
    validateOptionalPositiveNumber(
        body,
        "total_amount",
        "total_amount",
        errors,
        output
    );
    validateOptionalPositiveNumber(
        body,
        "monthly_payment",
        "monthly_payment",
        errors,
        output
    );
    validateOptionalDateOnly(body, "start_date", "start_date", errors, output);
    validateOptionalDateOnly(body, "end_date", "end_date", errors, output);
    validateOptionalPositiveInteger(
        body,
        "total_terms",
        "total_terms",
        errors,
        output
    );

    if (Object.keys(output).length === 0 && errors.length === 0) {
        errors.push("Khong co thong tin hop le de cap nhat");
    }

    validateDateRange(
        output.start_date || currentPlan.start_date,
        output.end_date || currentPlan.end_date,
        errors
    );

    return assertValidPayload(errors, output);
}

module.exports = {
    validateInstallmentCreateInput,
    validateInstallmentUpdateInput,
    validateSavingCreateInput,
    validateSavingInstallmentCreateInput,
    validateSavingProgressInput,
    validateSavingUpdateInput,
};
