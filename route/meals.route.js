const express = require("express")
const Route = express.Router()

const {handleCreateMeal,
    handleGetAllMeal,
    handleUpdateMeal,
    handleGetMealById,
    handleDeleteMeal
} = require("../controller/meals.controller")

const { authMiddleware } = require("../middleware/auth.middleware");

Route.post("/create", authMiddleware, handleCreateMeal)
Route.get("/allMeals",authMiddleware, handleGetAllMeal)

Route.get("/:id",authMiddleware, handleGetMealById)
Route.put("/:id",authMiddleware, handleUpdateMeal)
Route.delete("/:id",authMiddleware, handleDeleteMeal)

module.exports = Route