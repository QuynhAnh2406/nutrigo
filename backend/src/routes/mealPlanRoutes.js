const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');

router.get('/', mealPlanController.getWeeklyPlan);
router.get('/monthly', mealPlanController.getMonthlyPlan);
router.post('/update', mealPlanController.updatePlan);
router.post('/suggest', mealPlanController.suggestMeals);
router.get('/ingredients', mealPlanController.getIngredients);
router.get('/user-recipes', mealPlanController.getUserRecipes);
router.post('/add-with-recipe', mealPlanController.addMealWithRecipe);
router.get('/history', mealPlanController.getCalorieHistory);
router.get('/day', mealPlanController.getDayPlan);
router.post('/clear-day', mealPlanController.clearDay);

module.exports = router;
