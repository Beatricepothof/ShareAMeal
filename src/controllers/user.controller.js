const userService = require('../services/user.service')
const logger = require('../util/logger')

let userController = {
    create: (req, res, next) => {
        const user = req.body
        logger.info('create user', user.firstName, user.lastName)
        userService.create(user, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getAll: (req, res, next) => {
        const filters = req.query

        if (Object.keys(filters).length > 0) {
            logger.info('Fetching users with filters:', filters)
            userService.getByFilters(filters, (error, result) => {
                if (error) {
                    return next({
                        status: error.status || 500,
                        message: error.message || 'Internal Server Error',
                        data: {}
                    })
                }

                res.status(200).json({
                    status: 200,
                    message: 'Filtered users retrieved successfully',
                    data: result
                })
            })
        } else {
            logger.info('Fetching all users')
            userService.getAll((error, result) => {
                if (error) {
                    return next({
                        status: error.status || 500,
                        message: error.message || 'Internal Server Error',
                        data: {}
                    })
                }

                res.status(200).json({
                    status: 200,
                    message: 'All users retrieved successfully',
                    data: result
                })
            })
        }
    },

    getById: (req, res, next) => {
        const userId = req.params.userId
        logger.trace('userController: getById', userId)
        userService.getById(userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    update: (req, res, next) => {
        const userId = req.params.userId
        const newData = req.body
        logger.info(`Updating user with id ${userId}`, newData)
        userService.update(userId, newData, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    delete: (req, res, next) => {
        const userId = req.params.userId
        logger.info(`Attempting to delete user with id ${userId}`)
        userService.delete(userId, (error, success) => {
            if (error) {
                logger.error('Error deleting user:', error)
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                logger.info('User deleted successfully')
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getProfile: (req, res, next) => {
        const userId = req.userId

        userService.getProfile(userId, (err, profile) => {
            if (err) {
                return next({
                    status: err.status || 500,
                    message: err.message || 'Internal Server Error',
                    data: err.data || {}
                })
            }

            res.status(200).json({
                status: 200,
                message: 'User profile retrieved successfully.',
                data: {
                    profile
                }
            })
        })
    }
}

module.exports = userController
