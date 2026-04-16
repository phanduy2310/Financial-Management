exports.success = (res, data, message = "Success") => {
    res.json({ message, data });
};

exports.error = (res, message = "Internal server error", status = 500) => {
    res.status(status).json({ error: message });
};
