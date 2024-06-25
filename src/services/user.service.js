const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)
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
                'SELECT id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city FROM user',
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
                'SELECT id, firstName, lastName, isActive, emailadress, password, phoneNumber, roles, street, city FROM user WHERE id = ?',
                [userId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        if (results.length === 0) {
                            callback(
                                {
                                    message: `User with id ${userId} not found.`,
                                    data: {}
                                },
                                null
                            )
                        } else {
                            callback(null, {
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
                            callback(
                                {
                                    message: `User with id ${userId} not found.`,
                                    data: {}
                                },
                                null
                            )
                        } else {
                            logger.trace(
                                `User updated with id ${userId}:`,
                                newData
                            )
                            callback(null, {
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
                            callback(
                                {
                                    message: `User with id ${userId} not found.`,
                                    data: {}
                                },
                                null
                            )
                        } else {
                            logger.trace(
                                `User with id ${userId} deleted successfully.`
                            )
                            callback(null, {
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
        const query = 'SELECT * FROM users WHERE id = ?'

        db.getConnection((err, connection) => {
            if (err) {
                return callback(err, null)
            }

            connection.query(query, [userId], (error, results) => {
                connection.release()

                if (error) {
                    return callback(error, null)
                }

                if (results.length === 0) {
                    return callback(
                        {
                            message: `User with id ${userId} not found.`,
                            data: {}
                        },
                        null
                    )
                }

                const user = results[0]
                callback(null, {
                    message: 'User profile retrieved successfully.',
                    data: user
                })
            })
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
                    callback(null, {
                        message: `Found ${results.length} users.`,
                        data: results
                    })
                }
            })
        })
    }
}

module.exports = userService
