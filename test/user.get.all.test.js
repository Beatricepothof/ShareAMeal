const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

describe('Use Case 202 - Retrieving overview of users', () => {
    // TC-202-1: Show all users (at least 2)
    it('TC-202-1 Show all users', (done) => {
        chai.request(server)
            .get(endpointToTest)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('All users retrieved successfully')
                res.body.should.have
                    .property('data')
                    .that.is.an('array')
                    .with.length.at.least(2)
                done()
            })
    })

    // TC-202-2: Show users with search term on non-existing fields
    it('TC-202-2 Show users with search term on non-existing fields', (done) => {
        chai.request(server)
            .get(endpointToTest + '?search=nonexisting')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('No users found')
                res.body.should.have.property('data').that.is.an('array').that
                    .is.empty
                done()
            })
    })

    // TC-202-3: Show users with search term on field 'isActive' = false
    it('TC-202-3 Show users with search term on field isActive = false', (done) => {
        chai.request(server)
            .get(endpointToTest + '?isActive=false')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains(
                        'Users with isActive=false retrieved successfully'
                    )
                res.body.should.have
                    .property('data')
                    .that.is.an('array')
                    .with.length.at.least(1)
                done()
            })
    })

    // TC-202-4: Show users with search term on field 'isActive' = true
    it('TC-202-4 Show users with search term on field isActive = true', (done) => {
        chai.request(server)
            .get(endpointToTest + '?isActive=true')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains('Users with isActive=true retrieved successfully')
                res.body.should.have
                    .property('data')
                    .that.is.an('array')
                    .with.length.at.least(1)
                done()
            })
    })

    // TC-202-5: Show users with search terms on existing fields (maximum 2 fields filtering)
    it('TC-202-5 Show users with search terms on existing fields', (done) => {
        chai.request(server)
            .get(endpointToTest + '?firstName=John&isActive=true')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have
                    .property('message')
                    .that.is.a('string')
                    .contains(
                        'Users with specified criteria retrieved successfully'
                    )
                res.body.should.have
                    .property('data')
                    .that.is.an('array')
                    .with.length.at.least(1)
                done()
            })
    })
})
