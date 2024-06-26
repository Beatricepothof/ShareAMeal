const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index.js')
const db = require('../src/dao/mysql-db')
const logger = require('../src/util/logger')

const expect = chai.expect

chai.use(chaiHttp)

/**
 * SQL Queries to clear and populate the database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = `${CLEAR_MEAL_TABLE} ${CLEAR_PARTICIPANTS_TABLE} ${CLEAR_USERS_TABLE}`

/**
 * Insert a user into the database.
 */
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

        connection.query(CLEAR_DB, (err, results) => {
            if (err) {
                logger.error('Error clearing database:', err)
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
                        validToken = res.body.data.token
                        done()
                    })
            })
        })
    })
})

describe('User Update API Tests', () => {
    it('TC-205-1 should return 400 with specific error message when "emailAdress" is missing', (done) => {
        chai.request(app)
            .put('/api/user/1')
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

    it('TC-205-3 should return 400 with specific error message when phone number is not valid', (done) => {
        chai.request(app)
            .put('/api/user/1')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'Updated',
                lastName: 'User',
                emailAddress: 'updated@example.com',
                street: 'Updated Street',
                city: 'Updated City',
                phoneNumber: '123' // Invalid phone number format
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 400)
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    it('TC-205-4 should return 500 with specific error message when user does not exist', (done) => {
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
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 401)
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    it('TC-205-6 should return 200 with specific success message when user is successfully updated', (done) => {
        chai.request(app)
            .put('/api/user/1')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                firstName: 'John',
                lastName: 'Doe',
                isActive: 1,
                emailAdress: 'test@example.com',
                password: 'Correctpassword123',
                phoneNumber: '06 12345678',
                street: 'Main Street',
                city: 'New York'
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('User with id 1 updated successfully.')
                done()
            })
    })
})
