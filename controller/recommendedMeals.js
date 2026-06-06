const RECOMMENDED_MEAL = require("../model/recommendedMeals.Schema")

const customError = require("../utilis/CustomError");

const handleCreateRecommendedMeal = async (req, res, next) => {
  const {
    name,
    // category,
    prepNotes,
    dishImage,
    description,
    ingredients,
    calories,
    difficulty,
    tags,
    isFeatured
  } = req.body;

  // WeekDay removed from validation since it does not exist in this schema
  if (!name || !prepNotes || !description) {
    return next(
      new customError("Name and category are required fields", 400),
    );
  }

  try {
    // Removed 'user: user' because templates are global and user-agnostic
    const newRecommendedMeal = await RECOMMENDED_MEAL.create({
      name,
    //   category,
      prepNotes,
      dishImage,
      description,
      ingredients,
      calories,
      difficulty,
      tags,
      isFeatured
    });

    res.status(201).json({
      success: true,
      data: newRecommendedMeal,
    });
  } catch (err) {
    next(new customError(err.message, 500));
  }
};

module.exports = {
  handleCreateRecommendedMeal
};