exports.success = (res, data = null, message = "Success", status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

exports.error = (res, message = "Internal server error", status = 500, code = null) => {
    return res.status(status).json({
        success: false,
        message,
        code
    });
};