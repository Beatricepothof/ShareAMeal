const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index.js') // Adjust the path based on your actual file structure

const expect = chai.expect

chai.use(chaiHttp)

describe('User Login API Tests', () => {
    // Test case TC-101-1: Required field missing
    it('TC-101-1 should return 400 with specific error message when required field is missing', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({
                /* missing required fields */
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes(
                        'email must be a string.',
                        'password must be a string.'
                    )
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    // Test case TC-101-2: Invalid password
    it('TC-101-2 should return 400 with specific error message when password is invalid', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'invalidpassword' })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes(
                        'email must be a string.',
                        'password must be a string.'
                    )
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    // Test case TC-101-3: User does not exist
    it('should return 404 with specific error message when user does not exist', (done) => {
        chai.request(app)
            .post('/api/login')
            .send({
                emailAdress: 'nonexistentuser@example.com',
                password: 'invalidpassword'
            })
            .end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 404)
                expect(res.body).to.have.property(
                    'message',
                    'User not found or password invalid'
                )
                expect(res.body).to.have.property('data').that.is.an('object')
                    .that.is.empty
                done()
            })
    })

    // // TC-101-4: Successful login
    // it('should return 200 with specific success message and user info + token on successful login', (done) => {
    //     chai.request(app)
    //         .post('/api/login')
    //         .send({
    //             email: 'test@example.com',
    //             password: 'correctpassword'
    //         })
    //         .end((err, res) => {
    //             expect(res).to.have.status(200)
    //             expect(res.body).to.be.an('object')
    //             expect(res.body).to.have.property('status', 200)
    //             expect(res.body).to.have.property('message', 'User logged in')
    //             expect(res.body).to.have.property('data').that.is.an('object')
    //             expect(res.body.data).to.have.property('firstName')
    //             expect(res.body.data).to.have.property('lastName')
    //             expect(res.body.data).to.have.property(
    //                 'emailAdress',
    //                 'test@example.com'
    //             )
    //             expect(res.body.data)
    //                 .to.have.property('token')
    //                 .that.is.a('string')
    //             done()
    //         })
    // })
})
