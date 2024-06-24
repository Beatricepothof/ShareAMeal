const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index.js') // Adjust the path based on your actual file structure
const db = require('../src/dao/mysql-db')
const logger = require('../src/util/logger')

const expect = chai.expect

chai.use(chaiHttp)

const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const INSERT_USER = `
    INSERT INTO \`user\` (\`id\`, \`firstName\`, \`lastName\`, \`emailAdress\`, \`password\`, \`street\`, \`city\`, \`phoneNumber\`)
    VALUES (1, 'John', 'Doe', 'test@example.com', 'correctpassword', 'Main Street', 'New York', '+123456789');
`

let validToken = ''

beforeEach((done) => {
    db.getConnection((err, connection) => {
        if (err) {
            logger.error('Error connecting to database:', err)
            done(err)
            return
        }

        connection.query(CLEAR_USERS_TABLE, (err, results) => {
            if (err) {
                logger.error('Error clearing users table:', err)
                connection.release()
                done(err)
                return
            }

            connection.query(INSERT_USER, (err, results) => {
                if (err) {
                    logger.error('Error inserting user:', err)
                    connection.release()
                    done(err)
                    return
                }

                connection.release()
                // Generate or fetch a valid token for tests
                chai.request(app)
                    .post('/api/login')
                    .send({
                        emailAdress: 'test@example.com',
                        password: 'correctpassword'
                    })
                    .end((err, res) => {
                        if (err) {
                            logger.error('Error logging in user:', err)
                            done(err)
                            return
                        }
                        validToken = res.body.data.token // Capture the valid token for use
                        done()
                    })
            })
        })
    })
})

describe('User Update API Tests', () => {
    // TC-205-1: Required field "emailAddress" missing
    it('TC-205-1 should return 400 with specific error message when "emailAdress" is missing', (done) => {
        chai.request(app)
            .put('/api/user/1') // Assuming user ID 1 exists in the test setup
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User',
                // Missing emailAddress
                street: 'Updated Street',
                city: 'Updated City',
                phoneNumber: '+987654321'
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 400)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('emailAdress')
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    // TC-205-2: User is not the owner of the data
    it('TC-205-2 should return 403 with specific error message when user is not the owner of the data', (done) => {
        chai.request(app)
            .put('/api/user/999') // Assuming user ID 999 does not exist in the test setup
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User',
                emailAddress: 'updated@example.com',
                street: 'Updated Street',
                city: 'Updated City',
                phoneNumber: '+987654321'
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 400)
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    // TC-205-3: Non-valid phone number
    it('TC-205-3 should return 400 with specific error message when phone number is not valid', (done) => {
        chai.request(app)
            .put('/api/user/1') // Assuming user ID 1 exists in the test setup
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User',
                emailAddress: 'updated@example.com',
                street: 'Updated Street',
                city: 'Updated City',
                phoneNumber: '123'
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 400)
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    // TC-205-4: User does not exist
    it('TC-205-4 should return 400 with specific error message when user does not exist', (done) => {
        chai.request(app)
            .put('/api/user/999')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User',
                emailAddress: 'updated@example.com',
                street: 'Updated Street',
                city: 'Updated City',
                phoneNumber: '+987654321'
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 400)
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    // TC-205-5: Not logged in
    it('TC-205-5 should return 401 with specific error message when user is not logged in', (done) => {
        chai.request(app)
            .put('/api/user/1')
            .send({
                firstName: 'Updated',
                lastName: 'User',
                emailAddress: 'updated@example.com',
                street: 'Updated Street',
                city: 'Updated City',
                phoneNumber: '+987654321'
            })
            .end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 404)
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })
})
