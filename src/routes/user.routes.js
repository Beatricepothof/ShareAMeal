const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const { validateToken } = require('./authentication.routes')
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
        // Log the email adress just before validation
        console.log('Email Adress:', req.body.emailAddress)

        // Validate required fields
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
            if (!req.body[field]) {
                throw new Error(`Missing or incorrect ${field} field`)
            }
        }

        // Validate firstName field
        if (!/^[a-zA-Z]+$/.test(req.body.firstName)) {
            throw new Error('firstName must be a string')
        }

        // Validate email field
        if (
            !/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3})$/.test(
                req.body.emailAdress
            )
        ) {
            throw new Error('Invalid email adress')
        }

        // Validate password field
        if (!/(?=.*[A-Z])(?=.*\d).{8,}/.test(req.body.password)) {
            throw new Error('Invalid password')
        }

        // Validate phoneNumber field
        if (!/^06-\d{8}$/.test(req.body.phoneNumber)) {
            throw new Error('Invalid phone number')
        }

        // Validate street field
        if (typeof req.body.street !== 'string') {
            throw new Error('street must be a string')
        }

        // Validate city field
        if (typeof req.body.city !== 'string') {
            throw new Error('city must be a string')
        }

        logger.trace('User successfully validated for create')
        next()
    } catch (ex) {
        logger.trace('User validation failed for create:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUserUpdate = (req, res, next) => {
    try {
        // Validate emailAdress field (always required for updating)
        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field')
        chai.expect(req.body.emailAdress).to.be.a('string')
        chai.expect(req.body.emailAdress).to.match(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/,
            'Invalid email adress'
        )

        // Validate first name field
        assert(req.body.firstName, 'Missing or incorrect firstName field')
        chai.expect(req.body.firstName).to.be.a('string')
        chai.expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'firstName must be a string'
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

        // Validate phoneNumber field
        assert(req.body.phoneNumber, 'Missing or incorrect phoneNumber field')
        chai.expect(req.body.phoneNumber).to.be.a('string')
        chai.expect(req.body.phoneNumber).to.match(
            /^06[- ]?\d{8}$/,
            'Invalid phoneNumber'
        )

        // Validate street field
        assert(req.body.street, 'Missing or incorrect street field')
        chai.expect(req.body.street).to.be.a('string')

        // Validate city field
        assert(req.body.city, 'Missing or incorrect city field')
        chai.expect(req.body.city).to.be.a('string')

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
router.post(
    '/api/user',
    validateToken,
    validateUserCreate,
    userController.create
)
// Handles both getAll and getByFilters and getbyIsActive
router.get('/api/user', validateToken, userController.getAll)
router.get('/api/user/profile', validateToken, userController.getProfile)
router.get('/api/user/:userId', validateToken, userController.getById)
router.put(
    '/api/user/:userId',
    validateToken,
    validateUserUpdate,
    userController.update
)
router.delete('/api/user/:userId', validateToken, userController.delete)

// Tijdelijke routes om niet bestaande routes op te vangen
// router.put('/api/user/:userId', notFound)
// router.delete('/api/user/:userId', notFound)

module.exports = router
