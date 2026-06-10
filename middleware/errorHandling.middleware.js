const multer = require("multer")
const errorHandler = (err, req, res, next) => {

    let statusCode = err.statusCode || err.status || 500 
    let message = err.message || "internal server error"
    console.error(err.stack);
    console.error("Error message:", err.message);


    // Handle Multer specific errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.message   // "File too large", "Field name missing" etc
    });
  }

  // Handle custom file filter errors
  if (err.message.includes("Only jpg")) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: err.message
    });
  }

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