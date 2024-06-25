const assert = require('assert')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../util/config').secretkey
const routes = require('express').Router()
const AuthController = require('../controllers/authentication.controller')
const logger = require('../util/logger')
const authController = require('../controllers/authentication.controller')

function validateRegistration(req, res, next) {
    try {
        // Log the email address just before validation
        // console.log('Email Address:', req.body.emailAddress)

        // Validate required fields for registration
        const requiredFields = [
            'firstName',
            'lastName',
            'emailAdress',
            'password',
            'phoneNumber',
            'street',
            'city'
        ]
        for (const field of requiredFields) {
            assert(req.body[field], `Missing ${field} field`)
        }

        // Validate first name field
        assert(
            /^[a-zA-Z]+$/.test(req.body.firstName),
            'firstName must be a string'
        )

        // Validate email field
        assert(
            /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3})$/.test(
                req.body.emailAdress
            ),
            'Invalid email address'
        )

        // Validate password field
        assert(
            /(?=.*[A-Z])(?=.*\d).{8,}/.test(req.body.password),
            'Invalid password'
        )

        // Validate phone number field
        assert(/^06-\d{8}$/.test(req.body.phoneNumber), 'Invalid phone number')

        // Validate street field
        assert(typeof req.body.street === 'string', 'street must be a string')

        // Validate city field
        assert(typeof req.body.city === 'string', 'city must be a string')

        // Log success
        console.log('User successfully validated for create')

        next()
    } catch (error) {
        console.log('User validation failed for create:', error.message)
        next({
            status: 400,
            message: error.message,
            data: {}
        })
    }
}

function validateLogin(req, res, next) {
    try {
        assert(
            typeof req.body.emailAdress === 'string',
            'email must be a string.'
        )
        assert(
            typeof req.body.password === 'string',
            'password must be a string.'
        )
        next()
    } catch (ex) {
        next({
            status: 400,
            message: ex.toString(),
            data: {}
        })
    }
}

function validateToken(req, res, next) {
    logger.info('validateToken called')
    logger.trace('Headers:', req.headers)
    // The headers in Postman should contain authorization key with valid Bearer <token> value
    const authHeader = req.headers.authorization
    if (!authHeader) {
        logger.warn('Authorization header missing!')
        next({
            status: 401,
            message: 'Unautorized! Log in to get access.',
            data: {}
        })
    } else {
        const token = authHeader.substring(7, authHeader.length)

        // Token verification
        jwt.verify(token, jwtSecretKey, (err, payload) => {
            if (err) {
                logger.warn('Token verification failed:', err.message)
                return next({
                    status: 403,
                    message: 'Unauthorized! Invalid token.',
                    data: {}
                })
            }

            // Check if payload contains userId
            if (!payload.userId) {
                logger.warn('Token does not contain userId.')
                return next({
                    status: 401,
                    message: 'Unauthorized! Missing userId in token payload.',
                    data: {}
                })
            }

            logger.debug('Token verification successful:', payload)

            req.userId = payload.userId
            next()
        })
    }
}

routes.post('/api/login', validateLogin, authController.login)
routes.post('/api/user', validateRegistration, (req, res, next) => {
    authController.register(req.body, (err, result) => {
        if (err) {
            return next(err)
        }
        res.status(result.status).json(result)
    })
})

module.exports = { routes, validateToken }
