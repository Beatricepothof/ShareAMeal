const mealService = require('../services/meal.service')
const logger = require('../util/logger')

let mealController = {
    create: (req, res, next) => {
        const meal = req.body
        logger.info('Creating meal', meal.name)
        mealService.create(meal, (error, success) => {
            if (error) {
                if (error.code === 'required_fields_missing') {
                    return next({
                        status: 400,
                        message: 'Required field(s) missing',
                        data: {}
                    })
                } else if (error.code === 'unauthorized') {
                    return next({
                        status: 401,
                        message: 'Not logged in',
                        data: {}
                    })
                }
                return next({
                    status: 500,
                    message: error.message || 'Internal Server Error',
                    data: {}
                })
            }
            res.status(201).json({
                status: 201,
                message: success.message,
                data: success.data
            })
        })
    },

    update: (req, res, next) => {
        const mealId = req.params.mealId
        const newData = req.body
        logger.info(`Updating meal with ID ${mealId}`, newData)
        mealService.update(mealId, newData, (error, success) => {
            if (error) {
                if (
                    error.code === 'required_fields_missing' ||
                    error.code === 'meal_not_found'
                ) {
                    return next({
                        status: error.status || 404,
                        message: error.message,
                        data: {}
                    })
                } else if (error.code === 'unauthorized') {
                    return next({
                        status: 403,
                        message: 'Not the owner of the data',
                        data: {}
                    })
                }
                return next({
                    status: 500,
                    message: error.message || 'Internal Server Error',
                    data: {}
                })
            }
            res.status(200).json({
                status: 200,
                message: success.message,
                data: success.data
            })
        })
    },

    getAll: (req, res, next) => {
        logger.trace('Getting all meals')
        mealService.getAll((error, success) => {
            if (error) {
                return next({
                    status: 500,
                    message: error.message || 'Internal Server Error',
                    data: {}
                })
            }
            res.status(200).json({
                status: 200,
                message: success.message,
                data: success.data
            })
        })
    },

    getById: (req, res, next) => {
        const mealId = req.params.mealId
        logger.trace('Getting meal by ID', mealId)
        mealService.getById(mealId, (error, success) => {
            if (error) {
                return next({
                    status: error.status || 404,
                    message: error.message,
                    data: {}
                })
            }
            res.status(200).json({
                status: 200,
                message: success.message,
                data: success.data
            })
        })
    },

    delete: (req, res, next) => {
        const mealId = req.params.mealId
        logger.info(`Deleting meal with ID ${mealId}`)
        mealService.delete(mealId, (error, success) => {
            if (error) {
                if (error.code === 'meal_not_found') {
                    return next({
                        status: 404,
                        message: error.message,
                        data: {}
                    })
                } else if (error.code === 'unauthorized') {
                    return next({
                        status: 403,
                        message: 'Not the owner of the data',
                        data: {}
                    })
                }
                return next({
                    status: 500,
                    message: error.message || 'Internal Server Error',
                    data: {}
                })
            }
            res.status(200).json({
                status: 200,
                message: success.message,
                data: success.data
            })
        })
    }
}

module.exports = mealController
