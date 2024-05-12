const jwt = require('jsonwebtoken')
const db = require('../dao/mysql-db')
const logger = require('../util/logger')
const config = require('../util/config') // Import your application configuration

const jwtSecretKey = config.secretkey // Use the secret key from the configuration

const authController = {
    login: (req, res, next) => {
        const userCredentials = req.body
        logger.debug('login', userCredentials)
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err)
                return next(err) // Pass error to the Express error handler
            }
            if (connection) {
                // 1. Check if the user account exists.
                connection.query(
                    'SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?',
                    [userCredentials.emailAdress],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            logger.error('Error: ', err.toString())
                            return next(err) // Pass error to the Express error handler
                        }
                        if (rows) {
                            // 2. There was a result, check the password.
                            if (
                                rows &&
                                rows.length === 1 &&
                                rows[0].password == userCredentials.password
                            ) {
                                logger.debug(
                                    'Passwords matched, sending userinfo and valid token'
                                )
                                // Extract the password from the userdata - we do not send that in the response.
                                const { password, ...userinfo } = rows[0]
                                // Create an object containing the data we want in the payload.
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
                                            return next(err) // Pass error to the Express error handler
                                        }
                                        logger.info(
                                            'User logged in, sending: ',
                                            userinfo
                                        )
                                        res.status(200).json({
                                            status: 200,
                                            message: 'User logged in',
                                            data: { ...userinfo, token }
                                        })
                                    }
                                )
                            } else {
                                logger.debug(
                                    'User not found or password invalid'
                                )
                                res.status(409).json({
                                    status: 409,
                                    message:
                                        'User not found or password invalid',
                                    data: {}
                                })
                            }
                        }
                    }
                )
            }
        })
    },

    register: (userData, callback) => {
        logger.debug('register', userData)

        db.getConnection((err, connection) => {
            if (err) {
                logger.error('Error getting database connection:', err)
                callback(err, null)
                return
            }

            // Perform the database query to insert the user data
            connection.query(
                'INSERT INTO user SET ?',
                userData,
                (err, results) => {
                    connection.release() // Release the database connection

                    if (err) {
                        logger.error('Error registering user:', err)
                        callback(err, null)
                        return
                    }

                    // If registration was successful, return the generated user ID along with the registration data
                    const userId = results.insertId // ID of the newly registered user
                    callback(null, {
                        status: 201, // Status code for successful creation
                        message: 'User registered successfully',
                        data: { userId, ...userData } // Include the new user ID and other register info in the response
                    })
                }
            )
        })
    }
}

module.exports = authController
