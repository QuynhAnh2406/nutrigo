const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');

router.get('/', mealPlanController.getWeeklyPlan);
router.post('/update', mealPlanController.updatePlan);
router.post('/suggest', mealPlanController.suggestMeals);
router.get('/recipes', mealPlanController.getRecipes);
router.post('/autofill', mealPlanController.autoFillWeek);

module.exports = router;
