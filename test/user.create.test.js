const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const app = require('../index.js')

chai.should()
const expect = chai.expect
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

describe('User Registration and Query API Tests', () => {
    // UC-201: User Registration Tests

    // TC-201-1: Missing Required Field
    it('TC-201-1 should return 400 when a required field is missing', (done) => {
        chai.request(app)
            .post('/api/user')
            .send({
                lastName: 'Doe',
                emailAdress: 'john.doe@example.com',
                password: 'Password123',
                phoneNumber: '06-12345678',
                street: 'Main Street',
                city: 'New York'
                // Missing firstName intentionally
            })
            .end((err, res) => {
                // Check for error
                if (err) {
                    console.error(err) // Log the error for debugging
                    done(err) // Complete the test with the error
                    return
                }

                // Assertions for response
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Missing')
                expect(res.body).to.have.property('data').that.is.empty
                done() // Complete the test
            })
    })

    // TC-201-2: Invalid Email Address
    it('TC-201-2 should return 400 when email address is invalid', (done) => {
        chai.request(app)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAdress: 'invalid_email',
                password: 'Password123',
                phoneNumber: '06-12345678',
                street: 'Main Street',
                city: 'New York'
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Invalid email address')
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    // TC-201-3: Invalid Password
    it('TC-201-3 should return 400 when password is invalid', (done) => {
        chai.request(app)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAdress: 'john.doe@example.com',
                password: 'weakpass',
                phoneNumber: '06-12345678',
                street: 'Main Street',
                city: 'New York'
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Invalid password')
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    // TC-201-4: User Already Exists
    it('TC-201-4 should return 403 when user already exists', (done) => {
        chai.request(app)
            .post('/api/user')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAdress: 'existing.user@example.com',
                password: 'Password123',
                phoneNumber: '06-12345678',
                street: 'Main Street',
                city: 'New York'
            })
            .end((err, res) => {
                expect(res).to.have.status(403)
                expect(res.body).to.be.an('object')
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('User already exists')
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    // TC-201-5: Successful Registration
    it('TC-201-5 should return 201 and user data when registration is successful', (done) => {
        chai.request(app)
            .post('/api/user')
            .send({
                firstName: 'Jane',
                lastName: 'Smith',
                emailAdress: 'unique.email@example.com', // Use a unique email address
                password: 'StrongPassword123',
                phoneNumber: '06-87654321',
                street: 'Broadway',
                city: 'Los Angeles'
            })
            .end((err, res) => {
                // Check for error
                if (err) {
                    console.error(err) // Log the error for debugging
                    done(err) // Complete the test with the error
                    return
                }

                // Assertions for response
                expect(res).to.have.status(201)
                expect(res.body).to.be.an('object')
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('User registered successfully')
                expect(res.body).to.have.property('data').that.is.an('object')
                done() // Complete the test
            })
    })
})
