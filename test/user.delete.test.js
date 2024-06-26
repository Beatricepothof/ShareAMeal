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

it('TC-206-1 should return 500 when attempting to delete a non-existing user', (done) => {
    chai.request(app)
        .delete('/api/user/999')
        .set('Authorization', `Bearer ${validToken}`)
        .end((err, res) => {
            expect(res).to.have.status(500)
            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('status', 500)
            expect(res.body).to.have.property(
                'message',
                'User with id 999 not found.'
            )
            expect(res.body).to.have.property('data').to.be.empty
            done()
        })
})

it('TC-206-2 should return 401 when user is not logged in', (done) => {
    chai.request(app)
        .delete('/api/user/1')
        // No Authorization header
        .end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('status', 401)
            expect(res.body).to.have.property(
                'message',
                'Unauthorized! Log in to get access.'
            )
            expect(res.body).to.have.property('data').to.be.empty
            done()
        })
})

it('TC-206-3 should return 200 with specific success message when user is successfully deleted', (done) => {
    chai.request(app)
        .delete('/api/user/1')
        .set('Authorization', `Bearer ${validToken}`)
        .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('status', 200)
            expect(res.body).to.have.property(
                'message',
                'User with id 1 deleted successfully.'
            )
            expect(res.body).to.have.property('data').to.be.empty
            done()
        })
})
