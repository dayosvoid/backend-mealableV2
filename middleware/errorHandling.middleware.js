const errorHandler = (err, req, res, next) => {

    let statusCode = err.statusCode || err.status || 500 
    let message = err.message || "internal server error"
    console.error(err.stack);
    console.error("Error message:", err.message);

     // incase user input an already existing email while registering
    if(err.code === 11000){
            statusCode = 400;
            message = "Email address already exist. please login"
    }

    // Handle Mongoose Validation Errors (missing fields in schema)
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(", ");
    }


    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message
        });
    }

    return res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: message
    });
};


module.exports = errorHandler;