const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')

// Routes for meal CRUD operations
router.post('/api/meal', validateMealCreate, mealController.create)
router.put('/api/meal/:mealId', validateMealUpdate, mealController.update)
router.get('/api/meal', mealController.getAll)
router.get('/api/meal/:mealId', mealController.getById)
router.delete('/api/meal/:mealId', mealController.delete)

module.exports = router
