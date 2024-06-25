const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)
        if (
            !user.firstName ||
            !user.lastName ||
            !user.emailAdress ||
            !user.password
        ) {
            const error = new Error('Required fields are missing.')
            error.code = 'missing_field'
            callback(error, null)
            return
        }

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'INSERT INTO user SET ?',
                user,
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.trace(
                            `User created with id ${results.insertId}.`
                        )
                        callback(null, {
                            message: `User created with id ${results.insertId}.`,
                            data: user
                        })
                    }
                }
            )
        })
    },

    getAll: (callback) => {
        logger.info('getAll')
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName, isActive, emailAdress, phoneNumber, roles, street, city FROM user',
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} users.`,
                            data: results
                        })
                    }
                }
            )
        })
    },

    getById: (userId, callback) => {
        logger.info('fetching user by id:', userId)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName, isActive, emailAdress, phoneNumber, roles, street, city FROM user WHERE id = ?',
                [userId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        if (results.length === 0) {
                            const notFoundError = new Error(
                                `User with id ${userId} not found.`
                            )
                            notFoundError.code = 'not_found'
                            callback(notFoundError, null)
                        } else {
                            callback(null, {
                                status: 200,
                                message: 'User found successfully.',
                                data: results[0]
                            })
                        }
                    }
                }
            )
        })
    },

    update: (userId, newData, callback) => {
        logger.info(`Updating user with id ${userId}`, newData)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'UPDATE user SET ? WHERE id = ?',
                [newData, userId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.affectedRows === 0) {
                            const notFoundError = new Error(
                                `User with id ${userId} not found.`
                            )
                            notFoundError.code = 'not_found'
                            callback(notFoundError, null)
                        } else {
                            logger.trace(
                                `User updated with id ${userId}:`,
                                newData
                            )
                            callback(null, {
                                status: 200,
                                message: `User with id ${userId} updated successfully.`,
                                data: newData
                            })
                        }
                    }
                }
            )
        })
    },

    delete: (userId, callback) => {
        logger.info(`Deleting user with id ${userId}`)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'DELETE FROM user WHERE id = ?',
                [userId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.affectedRows === 0) {
                            const notFoundError = new Error(
                                `User with id ${userId} not found.`
                            )
                            notFoundError.code = 'not_found'
                            callback(notFoundError, null)
                        } else {
                            logger.trace(
                                `User with id ${userId} deleted successfully.`
                            )
                            callback(null, {
                                status: 200,
                                message: `User with id ${userId} deleted successfully.`,
                                data: {}
                            })
                        }
                    }
                }
            )
        })
    },

    getProfile: (userId, callback) => {
        logger.info('Fetching profile for user:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                `SELECT u.id, u.firstName, u.lastName, u.emailAdress, 
                        m.id AS mealId, m.cookId, m.name, m.description
                FROM user u
                LEFT JOIN meal m ON u.id = m.cookId
                WHERE u.id = ?`,
                [userId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(
                            {
                                status: 500,
                                message:
                                    error.message || 'Internal Server Error'
                            },
                            null
                        )
                    } else {
                        if (results.length === 0) {
                            const notFoundError = {
                                status: 404,
                                message: `User with id ${userId} not found.`
                            }
                            callback(notFoundError, null)
                        } else {
                            const user = results[0]

                            // Collect meals cooked by the user
                            const meals = results
                                .filter((result) => result.mealId !== null)
                                .map((result) => ({
                                    id: result.mealId,
                                    cookId: result.cookId,
                                    name: result.name,
                                    description: result.description
                                }))

                            // Return user profile with meals
                            const userProfile = {
                                id: user.id,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                emailAdress: user.emailAdress,
                                meals: meals
                            }
                            callback(null, userProfile)
                        }
                    }
                }
            )
        })
    },

    getByFilters: (filters, callback) => {
        logger.info('Fetching users with filters:', filters)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            let query = 'SELECT * FROM `user` WHERE 1=1'
            const queryParams = []

            Object.keys(filters).forEach((filter) => {
                query += ` AND ${filter} = ?`
                queryParams.push(filters[filter])
            })

            connection.query(query, queryParams, (error, results) => {
                connection.release()

                if (error) {
                    logger.error(error)
                    callback(error, null)
                } else {
                    logger.debug('Filtered users:', results)

                    if (results.length === 0) {
                        callback(null, {
                            status: 200,
                            message: 'No filtered users found.',
                            data: []
                        })
                    } else {
                        callback(null, {
                            status: 200,
                            message: `Found ${results.length} users.`,
                            data: results
                        })
                    }
                }
            })
        })
    }
}

module.exports = userService
