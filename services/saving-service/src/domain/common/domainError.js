function createDomainError(status, message, details) {
    const err = new Error(message);
    err.status = status;
    err.details = details;
    return err;
}

module.exports = {
    createDomainError,
};
