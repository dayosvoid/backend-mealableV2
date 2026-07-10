const User = require("../models/user.schema");
const Auth = require("../models/auth");
const customError = require("../utilis/CustomError");
const { uploadToCloudinary } = require("../config/cloudinary.config");
const cloudinary = require("cloudinary").v2;

const handleGetUserProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new customError("Unauthorized", 401));
        }

        let userProfile = await User.findOne({ userId });
        if (!userProfile) {
            // Automatically create profile from Auth details if it doesn't exist yet
            const authDoc = await Auth.findById(userId);
            if (!authDoc) {
                return next(new customError("User not found", 404));
            }

            userProfile = await User.create({
                userId,
                displayName: authDoc.username,
            });
        }

        res.status(200).json({
            success: true,
            data: userProfile,
        });
    } catch (err) {
        next(new customError(err.message, 500));
    }
};

const handleUpdateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new customError("Unauthorized", 401));
        }

        // Find or create profile
        let userProfile = await User.findOne({ userId });
        if (!userProfile) {
            const authDoc = await Auth.findById(userId);
            if (!authDoc) {
                return next(new customError("User not found", 404));
            }

            userProfile = await User.create({
                userId,
                displayName: authDoc.username,
            });
        }

        const { displayName, dietaryPreference, calorieGoal } = req.body;

        // If a file is uploaded, upload to Cloudinary and update avatar field
        if (req.file) {
            // Delete old avatar from Cloudinary if it exists
            if (userProfile.avatar) {
                try {
                    const publicId = userProfile.avatar.split("/").slice(-2).join("/").split(".")[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (destroyErr) {
                    console.error("Failed to delete old avatar from Cloudinary:", destroyErr);
                }
            }

            const result = await uploadToCloudinary(req.file.buffer, "foodable/avatars");
            req.body.avatar = result.secure_url;
        }

        // Apply updates directly to the userProfile instance
        if (displayName !== undefined) userProfile.displayName = displayName;
        if (dietaryPreference !== undefined) userProfile.dietaryPreference = dietaryPreference;
        if (calorieGoal !== undefined) {
            userProfile.calorieGoal = calorieGoal === "" || calorieGoal === null ? undefined : Number(calorieGoal);
        }
        if (req.body.avatar !== undefined) userProfile.avatar = req.body.avatar;

        const updatedProfile = await userProfile.save();

        res.status(200).json({
            success: true,
            data: updatedProfile,
        });
    } catch (err) {
        next(new customError(err.message, 500));
    }
};

module.exports = {
    handleGetUserProfile,
    handleUpdateUserProfile
};
