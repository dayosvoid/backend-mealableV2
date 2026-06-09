const RECOMMENDED_MEAL = require("../model/recommendedMeals.Schema");
const mongoose = require("mongoose")
const customError = require("../utilis/CustomError");

const handleCreateRecommendedMeal = async (req, res, next) => {
  const {
    name,
    prepNotes,
    dishImage,
    description,
    ingredients,
    calories,
    difficulty,
    tags,
    isFeatured,
  } = req.body;

  // WeekDay removed from validation since it does not exist in this schema
  if (!name || !prepNotes || !description) {
    return next(
      new customError(
        "Name/description/prepNotes are required fields",
        400,
      ),
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
      isFeatured,
    });

    res.status(201).json({
      success: true,
      message: "recommended meal created successfully",
    });
  } catch (err) {
    next(new customError(err.message, 500));
  }
};

const handleGetAllRecommendedMeal = async (req, res, next) => {
  const user = req.user?.id;

  if (!user) {
    return next(new customError("User ID is required", 401));
  }

  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;


    const query = search ? {
      $or: [
        { name:        { $regex: search, $options: "i" } },
        { tags:        { $regex: search, $options: "i" } },
        { difficulty:  { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    } : {};
    

    const recommendedMeals = RECOMMENDED_MEAL.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const count = RECOMMENDED_MEAL.countDocuments(query);

    // storing the pipeline results in the array
    const [allRecommendedMeals, totalRecommendedMeal] = await Promise.all([
      recommendedMeals,
      count,
    ]);

    if (!allRecommendedMeals || allRecommendedMeals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No recommended meals yet",
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalMeals: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    let totalPages = Math.ceil(totalRecommendedMeal/limit)

    res.status(200).json({
      success: true,
      total: allRecommendedMeals.length,
      data: allRecommendedMeals,
      pagination: {
          currentPage: 0,
          totalPages: totalPages,
          totalMeals: totalRecommendedMeal,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
    });
  } catch (error) {
    next(new customError(error.message, 500));
  }
};

const handleGetSingleRecommendMeal = async(req,res,next) =>{
    const user = req.user?.id
    if(!user){
        return next(new customError("unauthorized", 401))
    }

    const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new customError("Invalid meal ID", 400));
  }

  try {
    const recommendedMealDetails = await RECOMMENDED_MEAL.findById(id)
    if(!recommendedMealDetails){
        return next(new customError("Meal not found", 404))
    }

    res.status(200).json({
        success:true,
        data: recommendedMealDetails
    })
  } catch (error) {
    next(new customError(error.message, 500))
  }
}

module.exports = {
  handleCreateRecommendedMeal,
  handleGetAllRecommendedMeal,
  handleGetSingleRecommendMeal
};
