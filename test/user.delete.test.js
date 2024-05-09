const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user/:userId'

describe('Use Case 206 - Deleting user', () => {
    // TC-206-1: User does not exist
    it('TC-206-1 User does not exist', (done) => {
        chai.request(server)
            .delete(endpointToTest)
            .set('Authorization', 'Bearer validtoken')
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

    // TC-206-2: User is not logged in
    it('TC-206-2 User is not logged in', (done) => {
        chai.request(server)
            .delete(endpointToTest)
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

    // TC-206-3: The user is not the owner of the data
    it('TC-206-3 The user is not the owner of the data', (done) => {
        chai.request(server)
            .delete(endpointToTest)
            .set('Authorization', 'Bearer invalidtoken')
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

    // TC-206-4: User successfully deleted
    it('TC-206-4 User successfully deleted', (done) => {
        chai.request(server)
            .delete(endpointToTest)
            .set('Authorization', 'Bearer validtoken')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('User successfully deleted')
                done()
            })
    })
})
