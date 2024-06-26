require('dotenv').config()
const chai = require('chai')
const chaiHttp = require('chai-http')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
const db = require('../src/dao/mysql-db')
const app = require('../index')
const logger = require('../src/util/logger')

const expect = chai.expect

chai.use(chaiHttp)

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'

const CLEAR_DB = `${CLEAR_MEAL_TABLE} ${CLEAR_PARTICIPANTS_TABLE} ${CLEAR_USERS_TABLE}`

/**
 * Insert a user into the database.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "John", "Doe", "test@example.com", "correctpassword", "Main Street", "New York");'

/**
 * Query to insert meals into the database.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description A', 'image url A', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description B', 'image url B', NOW(), 5, 6.50, 1);"

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

                connection.query(INSERT_MEALS, (err, results) => {
                    if (err) {
                        logger.error('Error inserting meals:', err)
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
})

describe('Delete Meal API Tests', () => {
    it('TC-305-1 should return 401 when user is not logged in', (done) => {
        chai.request(app)
            .delete('/api/meal/1')
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

    it('TC-305-3 should return 404 when attempting to delete a non-existing meal', (done) => {
        chai.request(app)
            .delete('/api/meal/999')
            .set('Authorization', `Bearer ${validToken}`)
            .end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 404)
                expect(res.body).to.have.property('message', 'Meal not found')
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })
})
