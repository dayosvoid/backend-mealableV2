const mongoose = require("mongoose");
const {next} = require("../middleware/errorHandling.middleware")


// ingredient schema for a particular meal_________________________________________
const ingredientSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Ingredient name is required"],
        trim: true
    },
    quantity:{
        type:Number,
        required: [true, "Ingredient quantity is required"],
        min: [0.01, "Quantity must be greater than 0"]
    },
    unit:{
        type: String,
        enum: ["grams","kg","L", "milliliters", "cups", "tablespoons", "teaspoons", "pieces", "slices", "pinch", "dash", "custom"],
        required: [true, "Ingredient unit is required"],
        trim: true,
        default: "grams"
    },
    groceryCategory: {
    type: String,
    enum: {
      values: ["Produce", "Protein", "Grains", "Dairy", "Spices", "Seafood", "Other"],
      message: "Invalid grocery category"
    },
    default: "Other"
  }
},{_id:false})

// meal schema for a particular user_________________________________________

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: [true, "Meal name is required"],
    },
    weekDay: {
      type: String,
      enum: {
        values: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        message: "Invalid weekday",
      },
      required: [true],
    },
    weekDayOrder: {
      type: Number,
      min: 0,
      max: 6,
      // 0 = Monday, 6 = Sunday
    },
    category: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: [true, "Meal category is required"],
    },
    categoryOrder: {
        type: Number,
        min: 0,
        max: 2,
        // 0 = breakfast, 1 = lunch, 2 = dinner
    },
    prepNotes: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true
    },
    dishImage: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true
    },
    ingredients: {
      type: [ingredientSchema],
      default: []
    },

    calories: {
      type: Number,
      min: [0, "Calories must be a positive number"],
      default: null
    },

  },
  { timestamps: true });


//   this is the pre-save middleware to set the weekDayOrder field based on the weekDay value.
 const DAY_ORDER = {
  monday: 0, tuesday: 1, wednesday: 2,
  thursday: 3, friday: 4, saturday: 5, sunday: 6
};

const CATEGORY_ORDER = {
    breakfast: 0, lunch: 1, dinner: 2
}

mealSchema.pre("validate", function() {
  if ((this.isNew || this.isModified("weekDay")) && this.weekDay) {
    this.weekDayOrder = DAY_ORDER[this.weekDay];
  }
  if ((this.isNew || this.isModified("category")) && this.category) {
    this.categoryOrder = CATEGORY_ORDER[this.category];
  }
  ;
})
// indexes to optimize queries for retrieving meals sorted by weekDay or category for a specific user.
mealSchema.index({ user: 1, weekDayOrder: 1, categoryOrder: 1 });    

const MEAL = mongoose.model("Meal", mealSchema);
module.exports = MEAL;
