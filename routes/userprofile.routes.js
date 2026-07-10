const { Router } = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { upload } = require("../config/cloudinary.config");

const { handleGetUserProfile, handleUpdateUserProfile } = require("../controllers/user.controller");

const router = Router();

router.get("/", authMiddleware, handleGetUserProfile);
router.put("/", authMiddleware, upload.single("avatar"), handleUpdateUserProfile);

module.exports = router;