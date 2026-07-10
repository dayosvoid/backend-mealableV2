const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        trim: true,
        ref: "Auth",
        unique: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    dietaryPreference: {
        type: [String],
        required: false,
        trim: true,
        enum: ["None", "Vegan", "Vegetarian", "Pescatarian", "Flexitarian", "Paleo", "Gluten-Free", "Keto"],
    },
    calorieGoal: {
        type: Number,
        required: false,
    },
    avatar: {
        type: String,
        required: false,
        trim: true,
    }
}, { timestamps: true, versionKey: false });

userSchema.pre("validate", function () {
    if (!this.dietaryPreference || this.dietaryPreference.length === 0 || this.dietaryPreference.includes("None")) {
        this.dietaryPreference = ["None"];
    }
});


const User = mongoose.model("User", userSchema);

module.exports = User;
