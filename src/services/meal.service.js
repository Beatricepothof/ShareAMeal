const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const mealService = {
    create: (meal, callback) => {
        logger.info('Creating meal', meal)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'INSERT INTO meal SET ?',
                meal,
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.trace(
                            `Meal created with id ${results.insertId}.`
                        )
                        callback(null, {
                            message: `Meal created with id ${results.insertId}.`,
                            data: meal
                        })
                    }
                }
            )
        })
    },

    update: (mealId, meal, callback) => {
        logger.info(`Updating meal with id ${mealId}`, meal)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'UPDATE meal SET ? WHERE id = ?',
                [meal, mealId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.trace(
                            `Meal with id ${mealId} updated successfully.`
                        )
                        callback(null, {
                            message: `Meal with id ${mealId} updated successfully.`,
                            data: meal
                        })
                    }
                }
            )
        })
    },

    getAll: (callback) => {
        logger.info('Fetching all meals')
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT m.*, u.* AS cook, GROUP_CONCAT(p.*) AS participants FROM meal m ' +
                    'LEFT JOIN user u ON m.cookId = u.id ' +
                    'LEFT JOIN meal_participants_user p ON p.mealId = m.id ' +
                    'GROUP BY m.id',
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} meals.`,
                            data: results
                        })
                    }
                }
            )
        })
    },

    getById: (mealId, callback) => {
        logger.info('Fetching meal by id:', mealId)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT m.*, u.* AS cook, GROUP_CONCAT(p.*) AS participants FROM meal m ' +
                    'LEFT JOIN user u ON m.cookId = u.id ' +
                    'LEFT JOIN meal_participants_user p ON p.mealId = m.id ' +
                    'WHERE m.id = ? GROUP BY m.id',
                [mealId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug('Fetched meal:', results[0]) // Added logging here
                        if (results.length === 0) {
                            const notFoundError = new Error(
                                `Meal with id ${mealId} not found.`
                            )
                            logger.info(
                                'Meal not found:',
                                notFoundError.message
                            )
                            callback(notFoundError, {
                                status: 404,
                                message: `Meal with id ${mealId} not found`,
                                data: null
                            })
                        } else {
                            callback(null, {
                                status: 200,
                                message: `Found meal with id ${mealId}`,
                                data: results[0]
                            })
                        }
                    }
                }
            )
        })
    },

    delete: (mealId, callback) => {
        logger.info(`Deleting meal with id ${mealId}`)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'DELETE FROM meal WHERE id = ?',
                [mealId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.info(`Meal with id ${mealId} is deleted.`)
                        callback(null, {
                            message: `Meal with id ${mealId} is deleted.`
                        })
                    }
                }
            )
        })
    }
}

module.exports = mealService
