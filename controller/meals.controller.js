const MEAL = require("../model/meals.schema");
const customError = require("../utilis/CustomError");

const handleCreateMeal = async (req, res, next) => {
  const user = req.user?.id;
  if (!user) {
    return next(new customError("Unauthorised", 401));
  }

  const {
    name,
    weekDay,
    category,
    prepNotes,
    dishImage,
    description,
    ingredients,
    calories,
  } = req.body;
  if (!name || !weekDay || !category) {
    return next(
      new customError("Name, weekDay, and category are required fields", 400),
    );
  }

  try {
    const newMeal = await MEAL.create({
      user: user,
      name,
      weekDay: weekDay.toLowerCase().trim(),
      category,
      prepNotes,
      dishImage,
      description,
      ingredients,
      calories,
    });
    res.status(201).json({
      success: true,
      data: newMeal,
    });
  } catch (err) {
    // if (err.name === "ValidationError") {
    //   const messages = Object.values(err.errors).map((e) => e.message);
    //   return next(new customError(messages.join(", "), 400));
    // }

    next(new customError(err.message, 500));
  }
};

const handleGetAllMeal = async (req, res, next) => {
  //   const { weekday } = req.query;
  //   if(!weekday){
  //     return next(new customError("specific weekday not provided",400))
  //   }

  const user = req.user?.id;

  if (!user) {
    return next(new customError("User ID is required", 400));
  }
  try {
    const userMeals = await MEAL.find(
      { user: user },
      //   { weekDay: weekday },
    ).sort({
      weekDayOrder: 1,
      CategoryOrder: 1,
    });

    if (!userMeals || userMeals.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No meals found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: userMeals,
    });
  } catch (err) {
    next(new customError(err.message, 500));
  }
};

const handleGetMealById = async (req, res, next) => {
  const user = req.user?.id;
  if (!user) {
    return next(new customError("unauthorized:userId is required", 401));
  }

  const { id } = req.params;
  if (!id) {
    return next(new customError("Meal id is required", 400));
  }

  try {
    const singleMeal = await MEAL.findById(id);
    if (!singleMeal) {
      return next(new customError("Meal not found", 404));
    }
    // Security check: Ensure this meal belongs to the logged-in user
    if (singleMeal.user.toString() !== user) {
      return next(
        new customError("Unauthorized: You do not own this meal resource", 403),
      );
    }
    return res.status(200).json({
      success: true,
      data: singleMeal,
    });
  } catch (error) {
    next(new customError(error.message, 500));
  }
};

const handleUpdateMeal = async (req, res, next) => {
  const user = req.user?.id;
  if (!user) {
    return next(new customError("Unauthorized: User ID is required", 401));
  }

  const { id } = req.params;
  if (!id) {
    return next(new customError("Meal Id is required", 400));
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new customError("No update fields provided", 400));
  }

  try {
    const meal = await MEAL.findById(id);
    if (!meal) {
      return next(new customError("Meal doesn't exist", 404));
    }

    // Security check: Ensure the user owns this meal before applying edits
    if (meal.user.toString() !== user) {
      return next(new customError("Unauthorized: Access denied", 403));
    }

    const updatedMeal = await MEAL.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true },
    );
    if (!updatedMeal) {
      return next(new customError("An error occur while updating", 400));
    }
    return res.status(200).json({
      success: true,
      message: "meal updated succesfully",
      data: updatedMeal,
    });
  } catch (error) {
    next(new customError(error.message, 500));
  }
};

const handleDeleteMeal = async (req, res, next) => {
  const { mealId } = req.params;
  if (!mealId) {
    return next(new customError("Bad request: Meal ID is required", 400));
  }

  const user = req.user?.id;
  if (!user) {
    return next(new customError("Unauthorized: User ID is required", 401));
  }

  try {
    const meal = await MEAL.findById(mealId);
    if (!meal) {
      return next(new customError("Meal not found or already deleted", 404));
    }

    // 2. Security Check: Prevent malicious users from deleting someone else's meals via ID guessing
    if (meal.user.toString() !== user) {
      return next(
        new customError(
          "Unauthorized: You cannot delete this meal resource",
          403,
        ),
      );
    }

    // 3. Document ownership confirmed, proceed with deletion
    await MEAL.findByIdAndDelete(mealId);

    return res.status(200).json({
      success: true,
      message: "Meal deleted successfully",
      meal: meal.name,
    });
  } catch (error) {
    next(new customError(error.message, 500));
  }
};

module.exports = {
  handleCreateMeal,
  handleGetAllMeal,
  handleGetMealById,
  handleUpdateMeal,
  handleDeleteMeal,
};
