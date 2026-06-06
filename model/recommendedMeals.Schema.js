const mongoose = require("mongoose");

const recommendedIngredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ingredient name is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Ingredient quantity is required"],
      min: [0.01, "Quantity must be greater than 0"],
    },
    unit: {
      type: String,
      enum: [
        "grams",
        "kg",
        "L",
        "milliliters",
        "cups",
        "tablespoons",
        "teaspoons",
        "pieces",
        "slices",
        "pinch",
        "dash",
        "custom",
      ],
      required: [true, "Ingredient unit is required"],
      trim: true,
      default: "grams",
    },
    groceryCategory: {
      type: String,
      enum: {
        values: [
          "Produce",
          "Protein",
          "Grains",
          "Dairy",
          "Spices",
          "Seafood",
          "Other",
        ],
        message: "Invalid grocery category",
      },
      default: "Other",
    },
  },
  { _id: false },
);

const recommendedMealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Recommended meal name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "A brief description is required"],
      maxlength: [500, "Description cannot exceed 1000 characters"],
      trim: true,
    },
    prepNotes: {
      type: String,
      maxlength: [500, "Preparation notes cannot exceed 1000 characters"],
      trim: true,
    },
    dishImage: {
      type: String,
      required: [true, "An image link is required for recommended meals"],
      trim: true,
    },
    ingredients: {
      type: [recommendedIngredientSchema],
      default: [],
    },
    calories: {
      type: Number,
      min: [0, "Calories must be a positive number"],
      required: [
        true,
        "Calorie count is required for official recommendations",
      ],
    },
    tags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    isFeatured: {
      type: Boolean,
      default: false, // Allows you to pin special meals to the top of your discovery feed
    },
  },
  { timestamps: true },
);

recommendedMealSchema.index({ tags: 1 });
recommendedMealSchema.index({ isFeatured: -1 }); // Fast sorting for pinned/featured meals

// Text index allows your users to search recipes via a keyword search bar (matches name or tags)
recommendedMealSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

const RECOMMENDED_MEAL = mongoose.model(
  "RecommendedMeal",
  recommendedMealSchema,
);
module.exports = RECOMMENDED_MEAL;
