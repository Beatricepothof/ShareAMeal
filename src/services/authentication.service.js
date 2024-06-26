const jwt = require('jsonwebtoken')
const db = require('../dao/mysql-db')
// const validateEmail = require('../util/emailvalidator')
const logger = require('../util/logger')
const jwtSecretKey = require('../util/config').secretkey

const authController = {
    login: (userCredentials, callback) => {
        logger.debug('login')

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err.message, null)
                return
            }
            if (connection) {
                // Check if the user account exists
                connection.query(
                    'SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?',
                    [userCredentials.emailAdress],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            logger.error('Error: ', err.toString())
                            callback(err.message, null)
                            return
                        }
                        if (
                            rows.length === 1 &&
                            rows[0].password === userCredentials.password
                        ) {
                            // If password match, generate JWT token
                            const { password, ...userinfo } = rows[0]
                            const payload = {
                                userId: userinfo.id
                            }
                            jwt.sign(
                                payload,
                                jwtSecretKey,
                                { expiresIn: '12d' },
                                (err, token) => {
                                    if (err) {
                                        logger.error(
                                            'Error generating token:',
                                            err
                                        )
                                        callback(err, null)
                                    } else {
                                        logger.info('User logged in:', userinfo)
                                        callback(null, {
                                            status: 200,
                                            message: 'User logged in',
                                            data: { ...userinfo, token }
                                        })
                                    }
                                }
                            )
                        } else {
                            logger.debug('User not found or password invalid')
                            callback(
                                {
                                    status: 409,
                                    message:
                                        'User not found or password invalid'
                                },
                                null
                            )
                        }
                    }
                )
            }
        })
    },

    register: (userData, callback) => {
        logger.debug('register')

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                callback(err.message, null)
                return
            }
            if (connection) {
                // Check if the email address is already in use
                connection.query(
                    'SELECT COUNT(*) AS count FROM `user` WHERE `emailAdress` = ?',
                    [userData.emailAdress],
                    (err, rows, fields) => {
                        if (err) {
                            logger.error('Error: ', err.toString())
                            callback(err.message, null)
                            return
                        }
                        if (rows[0].count > 0) {
                            logger.debug('Email address already in use')
                            callback(
                                {
                                    status: 409,
                                    message: 'Email address already in use'
                                },
                                null
                            )
                        } else {
                            connection.query(
                                'INSERT INTO `user` SET ?',
                                userData,
                                (err, results, fields) => {
                                    connection.release()
                                    if (err) {
                                        logger.error('Error: ', err.toString())
                                        callback(err.message, null)
                                    } else {
                                        logger.info(
                                            'User registered successfully'
                                        )
                                        callback(null, {
                                            status: 201,
                                            message:
                                                'User registered successfully',
                                            data: { ...userData }
                                        })
                                    }
                                }
                            )
                        }
                    }
                )
            }
        })
    }
}

module.exports = authController
