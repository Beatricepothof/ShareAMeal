const userService = require('../services/user.service')
const logger = require('../util/logger')

let userController = {
    create: (req, res, next) => {
        const user = req.body
        logger.info('create user', user.firstName, user.lastName)
        userService.create(user, (error, result) => {
            if (error) {
                return next({
                    status: 500,
                    message: 'Internal Server Error',
                    data: {}
                })
            }
            res.status(201).json({
                status: 201,
                message: result.message,
                data: result.data
            })
        })
    },

    getAll: (req, res, next) => {
        const filters = req.query

        if (Object.keys(filters).length > 0) {
            logger.info('Fetching users with filters:', filters)
            userService.getByFilters(filters, (error, result) => {
                if (error) {
                    return next({
                        status: 500,
                        message: 'Internal Server Error',
                        data: {}
                    })
                }

                res.status(200).json({
                    status: 200,
                    message: 'Filtered users retrieved successfully',
                    data: result.data
                })
            })
        } else {
            logger.info('Fetching all users')
            userService.getAll((error, result) => {
                if (error) {
                    return next({
                        status: 500,
                        message: 'Internal Server Error',
                        data: {}
                    })
                }

                res.status(200).json({
                    status: 200,
                    message: 'All users retrieved successfully',
                    data: result.data
                })
            })
        }
    },

    getById: (req, res, next) => {
        const userId = req.params.userId
        logger.trace('userController: getById', userId)
        userService.getById(userId, (error, result) => {
            if (error) {
                return next({
                    status: 500,
                    message: 'Internal Server Error',
                    data: {}
                })
            }
            if (!result.data) {
                return res.status(404).json({
                    status: 404,
                    message: `User with id ${userId} not found.`,
                    data: {}
                })
            }
            res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data
            })
        })
    },

    update: (req, res, next) => {
        const userId = req.params.userId
        const newData = req.body
        logger.info(`Updating user with id ${userId}`, newData)
        userService.update(userId, newData, (error, result) => {
            if (error) {
                return next({
                    status: 500,
                    message: 'Internal Server Error',
                    data: {}
                })
            }
            if (!result.data) {
                return res.status(404).json({
                    status: 404,
                    message: `User with id ${userId} not found.`,
                    data: {}
                })
            }
            res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data
            })
        })
    },

    delete: (req, res, next) => {
        const userId = req.params.userId
        logger.info(`Attempting to delete user with id ${userId}`)
        userService.delete(userId, (error, result) => {
            if (error) {
                logger.error('Error deleting user:', error)
                return next({
                    status: 500,
                    message: 'Internal Server Error',
                    data: {}
                })
            }
            if (!result.data) {
                return res.status(404).json({
                    status: 404,
                    message: `User with id ${userId} not found.`,
                    data: {}
                })
            }
            logger.info('User deleted successfully')
            res.status(200).json({
                status: 200,
                message: result.message,
                data: result.data
            })
        })
    },

    getProfile: (req, res, next) => {
        const userId = req.userId

        userService.getProfile(userId, (err, profile) => {
            if (err) {
                return next({
                    status: 500,
                    message: 'Internal Server Error',
                    data: {}
                })
            }
            if (!profile) {
                return res.status(404).json({
                    status: 404,
                    message: `Profile for user with id ${userId} not found.`,
                    data: {}
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
