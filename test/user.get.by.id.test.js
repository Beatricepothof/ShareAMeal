const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index.js')
const db = require('../src/dao/mysql-db')
const logger = require('../src/util/logger')

const expect = chai.expect

chai.use(chaiHttp)

const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const INSERT_USER = `
    INSERT INTO \`user\` (\`id\`, \`firstName\`, \`lastName\`, \`emailAdress\`, \`password\`, \`street\`, \`city\`)
    VALUES (1, 'John', 'Doe', 'test@example.com', 'correctpassword', 'Main Street', 'New York');
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

describe('User Data Retrieval by ID API Tests', () => {
    it('TC-204-1 should return 401 with specific error message when token is invalid', (done) => {
        chai.request(app)
            .get('/api/user/1')
            .set('Authorization', 'Bearer invalidtoken')
            .end((err, res) => {
                if (err) {
                    logger.error('Error in request:', err)
                    done(err)
                    return
                }
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 401)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('Invalid token')
                expect(res.body).to.have.property('data').to.be.empty

                done()
            })
    })

    it('TC-204-2 should return 404 with specific error message when user ID does not exist', (done) => {
        chai.request(app)
            .get('/api/user/999')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                if (err) {
                    logger.error('Error in request:', err)
                    done(err)
                    return
                }
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 404)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('User with id 999 not found.')
                expect(res.body).to.have.property('data').to.be.empty

                done()
            })
    })

    it('TC-204-3 should return 200 with specific success message and user data when user ID exists', (done) => {
        chai.request(app)
            .get('/api/user/1')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                if (err) {
                    logger.error('Error in request:', err)
                    done(err)
                    return
                }
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 200)
                expect(res.body)
                    .to.have.property('message')
                    .that.includes('User found successfully.')
                expect(res.body).to.have.property('data').that.is.an('object')
                expect(res.body.data).to.have.property('id', 1)
                expect(res.body.data).to.have.property('firstName', 'John')
                expect(res.body.data).to.have.property('lastName', 'Doe')
                expect(res.body.data).to.have.property('isActive', 1)
                expect(res.body.data).to.have.property(
                    'emailAdress',
                    'test@example.com'
                )
                expect(res.body.data).to.have.property(
                    'phoneNumber',
                    '+123456789'
                )
                expect(res.body.data).to.have.property('roles', 'editor,guest')
                expect(res.body.data).to.have.property('street', 'Main Street')
                expect(res.body.data).to.have.property('city', 'New York')

                done()
            })
    })
})
