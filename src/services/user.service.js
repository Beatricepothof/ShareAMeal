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
                            const notFoundError = new Error(
                                `User with id ${userId} not found.`
                            )
                            logger.info(
                                'user not found:',
                                notFoundError.message
                            )
                            callback(notFoundError, null)
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
                            const notFoundError = new Error(
                                `User with id ${userId} not found.`
                            )
                            logger.info(
                                'user not found:',
                                notFoundError.message
                            )
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
                            logger.info(
                                'user not found:',
                                notFoundError.message
                            )
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
        // retrieve user profile details
        db.query('SELECT * FROM user WHERE id = ?', [userId], (err, rows) => {
            if (err) {
                logger.error('Error retrieving user profile:', err)
                return callback({
                    status: 500,
                    message: 'Internal Server Error',
                    data: {}
                })
            }

            if (rows.length === 0) {
                return callback({
                    status: 404,
                    message: 'User not found',
                    data: {}
                })
            }

            // Retrieve meals linked with the user
            db.query(
                'SELECT * FROM meal WHERE cookId = ?',
                [userId],
                (err, mealRows) => {
                    if (err) {
                        logger.error('Error retrieving meals:', err)
                        return callback({
                            status: 500,
                            message: 'Internal Server Error',
                            data: {}
                        })
                    }

                    // Construct the user profile object with meals
                    const userProfile = {
                        user: rows[0],
                        meals: mealRows
                    }

                    callback(null, {
                        status: 200,
                        message: 'User profile retrieved successfully',
                        data: userProfile
                    })
                }
            )
        })
    }
}

module.exports = userService
