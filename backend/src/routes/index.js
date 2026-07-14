const express = require('express');
const router = express.Router();

const authOptional = require('../middleware/authOptional');

const authRoutes = require('./authRoutes');
const ingredientRoutes = require('./ingredientRoutes');
const recipeRoutes = require('./recipeRoutes');
const mealPlanRoutes = require('./mealPlanRoutes');
const profileRoutes = require('./profileRoutes');
const aiRoutes = require('./aiRoutes_new');

// Attach req.user if a Bearer token is provided.
router.use(authOptional);

router.use('/auth', authRoutes);
router.use('/ingredients', ingredientRoutes);
router.use('/recipes', recipeRoutes);
router.use('/mealplan', mealPlanRoutes);
router.use('/profile', profileRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
