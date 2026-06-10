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


const TAGS = [
  // ─── Meal type ───────────────────────────────────────────
  "rice", "soup", "stew", "porridge", "salad", "bread",
  "pasta", "swallow", "snack", "drink", "dessert",
  "sauce", "marinade", "dip", "wrap",

  // ─── Protein source ──────────────────────────────────────
  "chicken", "beef", "fish", "goat", "turkey",
  "pork", "seafood", "egg", "beans", "tofu",
  "lamb", "prawns", "crab", "snail", "offal",

  // ─── Cuisine / origin ────────────────────────────────────
  "nigerian", "yoruba", "igbo", "hausa", "delta",
  "calabar", "edo", "tiv", "fulani",
  "ghanaian", "senegalese", "cameroonian",
  "western", "continental", "asian", "caribbean",

  // ─── Dietary ─────────────────────────────────────────────
  "vegan", "vegetarian", "gluten-free", "dairy-free",
  "nut-free", "low-carb", "high-protein", "low-calorie",
  "keto", "halal", "low-sugar", "high-fibre",

  // ─── Taste profile ───────────────────────────────────────
  "spicy",          // ← added
  "mild",
  "sweet",
  "savory",
  "smoky",
  "tangy",
  "rich",
  "light",
  "creamy",
  "peppery",

  // ─── Cooking method ──────────────────────────────────────
  "fried",
  "grilled",
  "steamed",
  "baked",
  "boiled",
  "roasted",
  "smoked",
  "raw",
  "stir-fried",
  "one-pot",        // ← added

  // ─── Prep time ───────────────────────────────────────────
  "quick",          // under 20 mins
  "medium",         // 20–45 mins
  "slow-cook",      // 45 mins+
  "overnight",      // marinated or soaked overnight

  // ─── Occasion ────────────────────────────────────────────
  "everyday",
  "party",
  "festive",
  "lunchbox",
  "meal-prep",
  "street-food",
  "comfort-food",
  "date-night",
  "family-style",
  "budget-friendly",

  // ─── Nigerian dishes ─────────────────────────────────────
  "jollof", "egusi", "efo-riro", "pepper-soup", "suya",
  "moi-moi", "akara", "puff-puff", "banga", "ogbono",
  "ofada", "asun", "nkwobi", "abacha", "eba",
  "amala", "fufu", "tuwo", "kilishi", "masa",
  "miyan-kuka", "ofe-onugbu", "afang", "edikang-ikong",
  "oha-soup", "white-soup", "ofe-akwu",
];



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
      trim: true,
    },
    ingredients: {
      type: [recommendedIngredientSchema],
      default: [],
    },
    calories: {
      type: Number,
      min: [0, "Calories must be a positive number"],
    },
    tags: {
      type: [String],
      enum: {
      values: TAGS,                                  // ← fixed enum syntax
      message: "Invalid tag",
    },
      default:[]
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

  },
  { timestamps: true },
);

recommendedMealSchema.index({ tags: 1 });
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
