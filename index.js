const express = require("express")
const app = express()
const dotenv = require("dotenv")
dotenv.config()
const PORT = process.env.PORT || 5000
const mongoose = require("mongoose")
const customError = require("./utilis/CustomError")
const errorHandler = require("./middleware/errorHandling.middleware")

app.use(express.json())



app.use(errorHandler)

startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (err) {
        console.error("Error starting server:", err.message);
        process.exit(1);
    }
}

startServer()
