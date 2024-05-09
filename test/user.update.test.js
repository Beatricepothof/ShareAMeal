const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user/:userId'

describe('Use Case 205 - Updating user data', () => {
    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    // TC-205-1: Required field "emailAddress" missing
    it('TC-205-1 Required field "emailAddress" missing', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                phoneNumber: '123456789'
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('Missing required field emailAddress')
                res.body.should.not.have.property('data')
                done()
            })
    })

    // TC-205-2: User is not the owner of the data
    it('TC-205-2 User is not the owner of the data', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .set('Authorization', 'Bearer invalidtoken')
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'test.mail@server.nl',
                phoneNumber: '123456789'
            })
            .end((err, res) => {
                res.should.have.status(403)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('User is not the owner of the data')
                res.body.should.not.have.property('data')
                done()
            })
    })

    // TC-205-3: Invalid phone number
    it('TC-205-3 Invalid phone number', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'test.mail@server.nl',
                phoneNumber: 'invalidnumber'
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('Invalid phone number')
                res.body.should.not.have.property('data')
                done()
            })
    })

    // TC-205-4: User does not exist
    it('TC-205-4 User does not exist', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .send({
                firstName: 'Non',
                lastName: 'Existant',
                emailAddress: 'nonexistant.user@example.com',
                phoneNumber: '123456789'
            })
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('User does not exist')
                res.body.should.not.have.property('data')
                done()
            })
    })

    // TC-205-5: Not logged in
    it('TC-205-5 Not logged in', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'test.mail@server.nl',
                phoneNumber: '123456789'
            })
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('Not logged in')
                res.body.should.not.have.property('data')
                done()
            })
    })

    // TC-205-6: User successfully updated
    it('TC-205-6 User successfully updated', (done) => {
        chai.request(server)
            .put(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                emailAdress: 'test.mail@server.nl',
                phoneNumber: '123456789'
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('User data updated successfully')
                res.body.should.have.property('data').that.is.a('object')
                done()
            })
    })
})
