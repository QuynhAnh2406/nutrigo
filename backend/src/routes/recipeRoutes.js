const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.get('/', recipeController.getRecipes);
router.get('/:id', recipeController.getRecipeById);
router.put('/:id', recipeController.updateRecipe);
router.post('/', recipeController.createRecipe);
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;
