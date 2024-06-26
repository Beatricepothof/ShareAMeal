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
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'

const CLEAR_DB = `${CLEAR_MEAL_TABLE} ${CLEAR_PARTICIPANTS_TABLE} ${CLEAR_USERS_TABLE}`

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "John", "Doe", "test@example.com", "correctpassword", "Main Street", "New York");'

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEAL =
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

                connection.query(INSERT_MEAL, (err, results) => {
                    if (err) {
                        logger.error('Error inserting meal:', err)
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

describe('Meal Update API Tests', () => {
    it('TC-302-1 should return 400 when required fields are missing', (done) => {
        chai.request(app)
            .put('/api/meal/1')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                // Missing required fields
                description: 'Updated description',
                imageUrl: 'https://updated-image-url.com'
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status', 400)
                expect(res.body).to.have.property(
                    'message',
                    'Missing or incorrect name field'
                )
                expect(res.body).to.have.property('data').to.be.empty
                done()
            })
    })

    it('TC-302-2 should return 401 when user is not logged in', (done) => {
        chai.request(app)
            .put('/api/meal/1')
            // No Authorization header set
            .send({
                name: 'Updated Meal Name',
                price: '15.00',
                maxAmountOfParticipants: 6
            })
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

    it('TC-302-4 should return 404 when attempting to update a non-existing meal', (done) => {
        chai.request(app)
            .put('/api/meal/999')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                name: 'Updated Meal Name',
                price: '15.00',
                maxAmountOfParticipants: 6
            })
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
