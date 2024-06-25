const logger = require('../util/logger')
const db = require('../dao/mysql-db')

const mealService = {
    create: (meal, callback) => {
        logger.info('Creating meal', meal)
        if (!meal.name || !meal.price || !meal.maxAmountOfParticipants) {
            const error = new Error('Required field(s) missing')
            error.code = 'required_fields_missing'
            callback(error, null)
            return
        }
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
                            message: `Meal successfully added`,
                            data: meal
                        })
                    }
                }
            )
        })
    },

    update: (mealId, meal, callback) => {
        logger.info(`Updating meal with id ${mealId}`, meal)
        if (!meal.name && !meal.price && !meal.maxAmountOfParticipants) {
            const error = new Error(
                'Required fields "name" and/or "price" and/or "maxAmountOfParticipants" missing'
            )
            error.code = 'required_fields_missing'
            callback(error, null)
            return
        }
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
                    } else if (results.affectedRows === 0) {
                        const notFoundError = new Error(`Meal not found`)
                        notFoundError.code = 'meal_not_found'
                        callback(notFoundError, null)
                    } else {
                        logger.trace(
                            `Meal with id ${mealId} updated successfully.`
                        )
                        callback(null, {
                            message: `Meal successfully updated`,
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
                'SELECT id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes FROM meal',
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `List of meals returned`,
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
                'SELECT id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes FROM meal WHERE id = ?',
                [mealId],
                (error, results, fields) => {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else if (results.length === 0) {
                        const notFoundError = new Error(`Meal not found`)
                        notFoundError.code = 'meal_not_found'
                        callback(notFoundError, null)
                    } else {
                        logger.debug('Fetched meal:', results[0])
                        callback(null, {
                            message: `Meal details returned`,
                            data: results[0]
                        })
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
                    } else if (results.affectedRows === 0) {
                        const notFoundError = new Error(`Meal not found`)
                        notFoundError.code = 'meal_not_found'
                        callback(notFoundError, null)
                    } else {
                        logger.info(`Meal successfully deleted`)
                        callback(null, {
                            message: `Meal successfully deleted`
                        })
                    }
                }
            )
        })
    }
}

module.exports = mealService
