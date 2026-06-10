const MEAL = require("../model/meals.schema");
const customError = require("../utilis/CustomError");
const { uploadToCloudinary } = require("../config/cloudinary.config");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

const handleCreateMeal = async (req, res, next) => {
  const user = req.user?.id;
  if (!user) {
    return next(new customError("Unauthorised", 401));
  }

  let {
    name,
    weekDay,
    category,
    prepNotes,
    // dishImage,
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
    if (ingredients && typeof ingredients === "string") {
      ingredients = JSON.parse(req.body.ingredients);
    }

    const mealExist = await MEAL.findOne({
      user: user,
      weekDay: weekDay,
      category: category,
    });
    if (mealExist) {
      return next(
        new customError(
          `meal already exist on ${weekDay} for ${category}`,
          400,
        ),
      );
    }

    let dishImage = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      dishImage = result.secure_url;
    }

    const newMeal = await MEAL.create({
      user: user,
      name,
      weekDay: weekDay.toLowerCase().trim(),
      category: category.toLowerCase().trim(),
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
      categoryOrder: 1,
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
      total: userMeals.length,
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new customError("Invalid meal ID", 400));
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

  const {id} = req.params

  const { name, weekDay, category, prepNotes, description, calories } =
    req.body;

  if (!name || !weekDay || !category) {
    return next(
      new customError("Name,Weekday,Category are perioritized fields", 400),
    );
  }

  let ingredients = req.body.ingredients;
  if (typeof ingredients === "string") {
    try {
      ingredients = JSON.parse(ingredients);
    } catch {
      return next(new customError("ingredients must be valid JSON", 400));
    }
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

    let dishImage = meal.dishImage;
    // if theres a req.file check if it the same with old one, if not remove the old one
    if (req.file) {
      // removing the old picture from cloudinary
      if (dishImage) {
        const publicId = dishImage.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      // upload new image
      const result = await uploadToCloudinary(req.file.buffer);
      dishImage = result.secure_url;
    }

    meal.name = name;
    meal.weekDay = weekDay.toLowerCase().trim();
    meal.category = category.toLowerCase().trim();
    meal.prepNotes = prepNotes;
    meal.description = description;
    meal.calories = calories;
    meal.dishImage = dishImage;

    if (ingredients !== undefined) {
      if (!Array.isArray(ingredients)) {
        return next(new customError("ingredients must be an array", 400));
      }
      meal.ingredients = ingredients;
    }

    const updatedMeal = await meal.save();

    res.status(200).json({
      success: true,
      message: "Meal updated successfully",
      data: updatedMeal,
    });
  } catch (error) {
    next(new customError(error.message, 500));
  }
};

const handleDeleteMeal = async (req, res, next) => {
  const user = req.user?.id;
  if (!user) return next(new customError("Unauthorised", 401));

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new customError("Invalid meal ID", 400));
  }

  try {
    const meal = await MEAL.findById(id);
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

    // ✅ delete image first
    if (meal.dishImage) {
      const publicId = meal.dishImage
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // 3. Document ownership confirmed, proceed with deletion
    await MEAL.findByIdAndDelete(id);

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
