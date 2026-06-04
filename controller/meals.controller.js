const MEAL = require("../model/meals.schema");
const customError = require("../utilis/CustomError")

// const handleCreateMeal = async (req, res, next) => {
//     const { name, weekDay, category, prepNotes, dishImage, description, ingredients, calories } = req.body;
//     if (!name || !weekDay || !category) {
//         return next(new customError("Name, weekDay, and category are required fields", 400));
//     }
//     try{
//        const newMeal = await MEAL.create({
//             name,
//             weekDay,
//             category,
//             prepNotes,
//             dishImage,
//             description,
//             ingredients,
//             calories
//         });
//         res.status(201).json({
//             success: true,
//             data: newMeal
//         });
//     } catch (err) { 
//         next(new customError(err.message, 500))
//     }
//          }