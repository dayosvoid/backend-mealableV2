const customError = require("../utilis/CustomError");
const mongoose = require("mongoose");
const MEAL = require("../model/meals.schema");

const handleGetGroceryList = async (req, res, next) => {
  const user = req.user?.id;
  if (!user) {
    return next(new customError("", 401));
  }

  const { period = "month" } = req.query;

  if (!["week", "month"].includes(period)) {
    return next(new customError("period must be 'week' or 'month'", 400));
  }

  const MULTIPLIER = { week: 1, month: 4 };
  const multiplier = MULTIPLIER[period];

  try {
    const groceryList = await MEAL.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(user) },
      },
      {
        $unwind: "$ingredients",
      },
      {
        $group: {
          _id: {
            groceryCategory: "$ingredients.groceryCategory",
            name: { $toLower: "$ingredients.name" },
            unit: "$ingredients.unit",
          },
          rawQuantity: { $sum: "$ingredients.quantity" },
        },
      },
      {
        $addFields: {
          totalQuantity: { $multiply: ["$rawQuantity", multiplier] }, // ← multiply after
        }
      },
      {
        $group: {
          _id: "$_id.groceryCategory",
          items: {
            $push: {
              name: "$_id.name",
              totalQuantity: "$totalQuantity",
              unit: "$_id.unit",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },

      {
        $project: {
          _id: 0,
          category: "$_id",
          items: 1,
        },
      },
    ]);

    if (groceryList.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No ingredients found. Add some meals first.",
      });
    }

    res.status(200).json({
      success: true,
      totalCategories: groceryList.length,
      data: groceryList,
    });
  } catch (error) {
    next(new customError(error.message, 500));
  }
};

module.exports = { handleGetGroceryList };
