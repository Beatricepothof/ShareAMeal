const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const { validateToken } = require('./authentication.routes')

const validateMealCreate = (req, res, next) => {
    try {
        const requiredFields = [
            'name',
            'description',
            'price',
            'dateTime',
            'maxAmountOfParticipants',
            'imageUrl'
        ]
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Missing or incorrect ${field} field`)
            }
        }
        next()
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateMealUpdate = (req, res, next) => {
    try {
        const requiredFields = ['name', 'price', 'maxAmountOfParticipants']
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Missing or incorrect ${field} field`)
            }
        }
        next()
    } catch (ex) {
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

router.post(
    '/api/meal',
    validateToken,
    validateMealCreate,
    mealController.create
)
router.put(
    '/api/meal/:mealId',
    validateToken,
    validateMealUpdate,
    mealController.update
)
router.get('/api/meal', validateToken, mealController.getAll)
router.get('/api/meal/:mealId', validateToken, mealController.getById)
router.delete('/api/meal/:mealId', validateToken, mealController.delete)

module.exports = router
