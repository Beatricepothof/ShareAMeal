const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const validateToken = require('./authentication.routes').validateToken
const logger = require('../util/logger')

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

const validateUserCreate = (req, res, next) => {
    try {
        // Validate firstName field
        assert(req.body.firstName, 'Missing or incorrect firstName field')
        chai.expect(req.body.firstName).to.be.a('string')
        chai.expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
        )

        // Validate email field
        assert(req.body.emailAdress, 'Missing or incorrect email field')
        chai.expect(req.body.emailAdress).to.be.a('string')
        chai.expect(req.body.emailAdress).to.match(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/,
            'Invalid email address'
        )

        // Validate password field
        if (!req.body.password || req.body.password.trim() === '') {
            throw new Error('Missing or incorrect password field')
        }

        chai.expect(req.body.password).to.be.a('string')
        chai.expect(req.body.password).to.have.length.at.least(8)
        chai.expect(req.body.password).to.match(
            /^(?=.*[A-Z])(?=.*\d).{8,}$/,
            'Invalid password'
        )

        logger.trace('User successfully validated')
        next()
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUserDelete = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw new Error('Authorization header is missing')
        }

        const authToken = req.headers.authorization.split(' ')[1]
        if (!authToken) {
            throw new Error('Not logged in')
        }

        next()
    } catch (ex) {
        logger.trace('User delete validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUserRetrieve = (req, res, next) => {
    try {
        // Optionally, you can add validation logic here
        // For example, you can check if the search parameters are valid

        // If all validations pass, call next middleware
        next()
    } catch (ex) {
        // If any validation fails, handle the error
        logger.trace('User retrieve validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUserUpdate = (req, res, next) => {
    try {
        // Validate emailAddress field
        assert(req.body.emailAddress, 'Missing required field emailAddress')
        chai.expect(req.body.emailAddress).to.not.be.empty
        chai.expect(req.body.emailAddress).to.be.a('string')
        chai.expect(req.body.emailAddress).to.match(
            /\S+@\S+\.\S+/,
            'Invalid email format'
        )

        // Validate phoneNumber field
        if (req.body.phoneNumber) {
            chai.expect(req.body.phoneNumber).to.be.a('string')
            chai.expect(req.body.phoneNumber).to.match(
                /^\d{9}$/,
                'Invalid phone number'
            )
        }

        logger.trace('User successfully validated for update')
        next()
    } catch (ex) {
        logger.trace('User validation failed for update:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

// Userroutes
router.post('/api/user', validateUserCreate, userController.create)
router.get('/api/user', validateUserRetrieve, userController.getAll)
router.get('/api/user/:userId', userController.getById)
router.put('/api/user/:userId', validateUserUpdate, userController.update)
router.delete('/api/user/:userId', validateUserDelete, userController.delete)
router.get('/api/user/profile', validateToken, userController.getProfile)

// Tijdelijke routes om niet bestaande routes op te vangen
// router.put('/api/user/:userId', notFound)
// router.delete('/api/user/:userId', notFound)

module.exports = router
