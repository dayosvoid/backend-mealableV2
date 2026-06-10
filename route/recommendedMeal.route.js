const Route = require("express").Router()
const {handleGetSingleRecommendMeal,
    handleCreateRecommendedMeal,
    handleGetAllRecommendedMeal
} = require("../controller/recommendedMeals")

const { upload } = require("../config/cloudinary.config");
const {authMiddleware} = require("../middleware/auth.middleware")

Route.post("/create",authMiddleware,upload.single("dishImage"), handleCreateRecommendedMeal )
Route.get("/all",authMiddleware, handleGetAllRecommendedMeal)
Route.get("/:id", authMiddleware, handleGetSingleRecommendMeal)

module.exports = Route