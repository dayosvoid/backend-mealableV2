const express = require("express")
const Route = express.Router()
const { upload } = require("../config/cloudinary.config");

const { handleCreateMeal,
    handleGetAllMeal,
    handleUpdateMeal,
    handleGetMealById,
    handleDeleteMeal
} = require("../controllers/meals.controller")

const { authMiddleware } = require("../middlewares/auth.middleware");

Route.post("/create", authMiddleware, upload.single("dishImage"), handleCreateMeal)
Route.get("/allMeals", authMiddleware, handleGetAllMeal)

Route.get("/:id", authMiddleware, handleGetMealById)
Route.put("/:id", authMiddleware, upload.single("dishImage"), handleUpdateMeal)
Route.delete("/:id", authMiddleware, handleDeleteMeal)

module.exports = Route