const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const db = require('../dao/mysql-db')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)
        database.add(user, (err, data) => {
            if (err) {
                logger.info(
                    'error creating user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User created with id ${data.id}.`)
                callback(null, {
                    message: `User created with id ${data.id}.`,
                    data: data
                })
            }
        })
    },

    getAll: (callback) => {
        logger.info('getAll')

        // Deprecated: de 'oude' manier van werken, met de inmemory database
        // database.getAll((err, data) => {
        //     if (err) {
        //         callback(err, null)
        //     } else {
        //         callback(null, {
        //             message: `Found ${data.length} users.`,
        //             data: data
        //         })
        //     }
        // })

        // Nieuwe manier van werken: met de MySQL database
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName FROM `user`',
                function (error, results, fields) {
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
        database.getById(userId, (err, user) => {
            if (err) {
                logger.info(
                    'error fetching user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                if (!user) {
                    const notFoundError = new Error(
                        `User with id ${userId} not found.`
                    )
                    logger.info('user not found:', notFoundError.message)
                    callback(notFoundError, null)
                } else {
                    logger.trace(`User found with id ${userId}:`, user)
                    callback(null, user)
                }
            }
        })
    },

    update: (userId, newData, callback) => {
        logger.info(`Updating user with id ${userId}`, newData)
        database.update(userId, newData, (err, updatedUser) => {
            if (err) {
                logger.info(
                    'error updating user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                if (!updatedUser) {
                    const notFoundError = new Error(
                        `User with id ${userId} not found.`
                    )
                    logger.info('user not found:', notFoundError.message)
                    callback(notFoundError, null)
                } else {
                    logger.trace(`User updated with id ${userId}:`, updatedUser)
                    callback(null, {
                        status: 200,
                        message: `User with id ${userId} updated successfully.`,
                        data: updatedUser
                    })
                }
            }
        })
    },

    getProfile: (userId, callback) => {
        logger.info('getProfile userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} user.`,
                            data: results
                        })
                    }
                }
            )
        })
    }
}

module.exports = userService
