const userService = require('../services/user.service')
const logger = require('../util/logger')

let userController = {
    create: (req, res, next) => {
        const user = req.body
        logger.info('create user', user.firstName, user.lastName)
        userService.create(user, (error, success) => {
            if (error) {
                if (error.code === 'missing_field') {
                    return next({
                        status: 400,
                        message: error.message,
                        data: {}
                    })
                } else if (error.code === 'invalid_password') {
                    return next({
                        status: 400,
                        message: error.message,
                        data: {}
                    })
                } else if (error.code === 'user_not_found') {
                    return next({
                        status: 404,
                        message: error.message,
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

    getAll: (req, res, next) => {
        const filters = req.query

        if (Object.keys(filters).length > 0) {
            logger.info('Fetching users with filters:', filters)
            userService.getByFilters(filters, (error, result) => {
                if (error) {
                    return next({
                        status: 500,
                        message: error.message || 'Internal Server Error',
                        data: {}
                    })
                }

                if (result.data.length === 0) {
                    res.status(200).json({
                        status: 200,
                        message: 'No filtered users found.',
                        data: []
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        message: `Found ${result.data.length} users.`,
                        data: result.data
                    })
                }
            })
        } else {
            logger.info('Fetching all users')
            userService.getAll((error, result) => {
                if (error) {
                    return next({
                        status: 500,
                        message: error.message || 'Internal Server Error',
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
        userService.getById(userId, (error, success) => {
            if (error) {
                if (error.code === 'user_not_found') {
                    return res.status(404).json({
                        status: 404,
                        message: `User with id ${userId} not found.`,
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

    update: (req, res, next) => {
        const userId = req.params.userId
        const newData = req.body
        logger.info(`Updating user with id ${userId}`, newData)
        userService.update(userId, newData, (error, success) => {
            if (error) {
                if (
                    error.code === 'missing_field' ||
                    error.code === 'invalid_phone_number'
                ) {
                    return next({
                        status: 400,
                        message: error.message,
                        data: {}
                    })
                } else if (error.code === 'not_owner') {
                    return next({
                        status: 403,
                        message: error.message,
                        data: {}
                    })
                } else if (error.code === 'user_not_found') {
                    return res.status(404).json({
                        status: 404,
                        message: `User with id ${userId} not found.`,
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

    delete: (req, res, next) => {
        const userId = req.params.userId
        logger.info(`Attempting to delete user with id ${userId}`)
        userService.delete(userId, (error, success) => {
            if (error) {
                if (error.code === 'user_not_found') {
                    return res.status(404).json({
                        status: 404,
                        message: `User with id ${userId} not found.`,
                        data: {}
                    })
                } else if (error.code === 'not_owner') {
                    return next({
                        status: 403,
                        message: error.message,
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

    getProfile: (req, res, next) => {
        logger.info('Fetching profile details')

        // Use the userId from req object (set during token validation)
        const userId = req.userId

        userService.getProfile(userId, (error, profile) => {
            if (error) {
                return next({
                    status: error.status || 500,
                    message: error.message || 'Internal Server Error',
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
