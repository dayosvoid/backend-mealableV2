const express = require("express")
const Route = express.Router()

const { handleGetGroceryList } = require("../controllers/groceryList.controller")
const { authMiddleware } = require("../middlewares/auth.middleware");

Route.get("/", authMiddleware, handleGetGroceryList)

module.exports = Route