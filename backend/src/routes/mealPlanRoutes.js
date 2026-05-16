const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');

router.get('/', mealPlanController.getWeeklyPlan);
router.post('/update', mealPlanController.updatePlan);
router.post('/suggest', mealPlanController.suggestMeals);
router.get('/recipes', mealPlanController.getRecipes);
router.post('/autofill', mealPlanController.autoFillWeek);
router.get('/ingredients', mealPlanController.getIngredients);
router.get('/user-recipes', mealPlanController.getUserRecipes);
router.post('/add-with-recipe', mealPlanController.addMealWithRecipe);

module.exports = router;
