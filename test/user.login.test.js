const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index.js')
const db = require('../src/dao/mysql-db')
const logger = require('../src/util/logger')

const expect = chai.expect

chai.use(chaiHttp)

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEALS_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = `${CLEAR_MEALS_TABLE} ${CLEAR_PARTICIPANTS_TABLE} ${CLEAR_USERS_TABLE}`

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER = `
    INSERT INTO \`user\` (\`id\`, \`firstName\`, \`lastName\`, \`emailAdress\`, \`password\`, \`street\`, \`city\`)
    VALUES (1, 'first', 'last', 'name@server.nl', 'secret', 'street', 'city');
`

beforeEach((done) => {
    db.getConnection((err, connection) => {
        if (err) {
            logger.error('Error connecting to database:', err)
            done(err)
            return
        }

        connection.query(CLEAR_DB, (err) => {
            if (err) {
                logger.error('Error clearing database:', err)
                connection.release()
                done(err)
                return
            }

            connection.query(INSERT_USER, (err) => {
                connection.release()
                if (err) {
                    logger.error('Error inserting user:', err)
                    done(err)
                    return
                }

                done()
            })
        })
    })
})

describe('User Login', () => {
    describe('UC-101 Log in', () => {
        it('TC-101-1 Required field missing', (done) => {
            chai.request(app)
                .post('/api/login')
                .send({
                    // email is missing
                    password: 'somepassword'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400)
                    expect(res.body).to.be.a('object')
                    expect(res.body)
                        .to.have.property('message')
                        .eql(
                            'AssertionError [ERR_ASSERTION]: email must be a string.'
                        )
                    expect(res.body).to.have.property('data').eql({})
                    done()
                })
        })

        it('TC-101-2 Invalid password', (done) => {
            chai.request(app)
                .post('/api/login')
                .send({ email: 'user@example.com', password: 'wrongpassword' })
                .end((err, res) => {
                    expect(res).to.have.status(400)
                    expect(res.body)
                        .to.have.property('message')
                        .that.includes(
                            'AssertionError [ERR_ASSERTION]: email must be a string.'
                        )
                    expect(res.body).to.have.property('data').that.is.empty
                    done()
                })
        })

        it('TC-101-3 User doesnt exist', (done) => {
            chai.request(app)
                .post('/api/login')
                .send({
                    email: 'nonexistentuser@example.com',
                    password: 'somepassword'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400)
                    expect(res.body).to.be.a('object')
                    expect(res.body)
                        .to.have.property('message')
                        .that.includes(
                            'AssertionError [ERR_ASSERTION]: email must be a string.'
                        )
                    expect(res.body).to.have.property('data').to.be.empty
                    done()
                })
        })
    })
})
