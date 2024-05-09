const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user/:userId'

describe('Use Case 204 - Retrieving user data by ID', () => {
    // TC-204-1: Invalid token
    it('TC-204-1 Invalid token', (done) => {
        chai.request(server)
            .get(endpointToTest)
            .set('Authorization', 'Bearer invalidtoken')
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('Invalid token')
                res.body.should.not.have.property('data')
                done()
            })
    })

    // TC-204-2: User ID does not exist
    it('TC-204-2 User ID does not exist', (done) => {
        chai.request(server)
            .get(endpointToTest + '/123')
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('User ID does not exist')
                res.body.should.not.have.property('data')
                done()
            })
    })

    // TC-204-3: User ID exists
    it('TC-204-3 User ID exists', (done) => {
        chai.request(server)
            .get(endpointToTest + '/1')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('User data retrieved successfully')
                res.body.should.have.property('data').that.is.a('object')
                done()
            })
    })
})
