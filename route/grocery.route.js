const express = require("express")
const Route = express.Router()

const {handleGetGroceryList} = require("../controller/groceryLIst.controller")
const { authMiddleware } = require("../middleware/auth.middleware");

Route.get("/", authMiddleware, handleGetGroceryList)

module.exports = Route