const MEAL = require("../model/meals.schema");
const customError = require("../utilis/CustomError")

const handleCreateMeal = async (req, res, next) => {

    const { name, weekDay, category, prepNotes, dishImage, description, ingredients, calories } = req.body;
    if (!name || !weekDay || !category) {
        return next(new customError("Name, weekDay, and category are required fields", 400));
    }
    
    const userId  = req.user?._id;
     if (!userId){
            return next(new customError("User ID is required", 400));
        }
    try{
       
       const newMeal = await MEAL.create({
            user: userId,
            name,
            weekDay,
            category,
            prepNotes,
            dishImage,
            description,
            ingredients,
            calories
        });
        res.status(201).json({
            success: true,
            data: newMeal
        });
    } catch (err) { 
        next(new customError(err.message, 500))
    }
         }





    const handleGetAllMeal = async (req, res, next) => {
        const  userId  = req.user?._id;
    
    try{
        if (!userId){
        return next(new customError("User ID is required", 400));
        }


        const userMeals = await MEAL.find({user:userId})
        .sort({ weekDayOrder: 1, CategoryOrder: 1 });


        if(!userMeals || userMeals.length === 0){
            return res.status(200).jjson({
                success: true,
                data: [],
                message: "No meals found for this user"
            })
        }
            
        res.status(200).json({
            success: true,
            data: userMeals
        });
    }catch (err) {
        next(new customError(err.message, 500))
    }
    }