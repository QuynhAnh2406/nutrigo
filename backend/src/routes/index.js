const express = require('express');
const router = express.Router();

const authOptional = require('../middleware/authOptional');

const authRoutes = require('./authRoutes');
const ingredientRoutes = require('./ingredientRoutes');
const recipeRoutes = require('./recipeRoutes');
const mealPlanRoutes = require('./mealPlanRoutes');
const profileRoutes = require('./profileRoutes');
const postRoutes = require('./postRoutes');

// Attach req.user if a Bearer token is provided.
router.use(authOptional);

router.use('/auth', authRoutes);
router.use('/ingredients', ingredientRoutes);
router.use('/posts', postRoutes);
router.use('/mealplan', mealPlanRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
